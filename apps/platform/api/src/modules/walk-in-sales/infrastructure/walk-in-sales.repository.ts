import { randomUUID } from "node:crypto";
import type { SalesEnquiryInput, WalkInOrderStatus } from "@cxshop/contracts";
import type { DatabaseConnection, DatabaseTransaction } from "@cxshop/framework";
import { canTransition } from "../domain/walk-in-order";

export type SalesCaseDto = { id: string; reference: string; status: "received" | WalkInOrderStatus; customerName: string; customerPhone: string; productName: string; quantity: number; totalMinor: number | null; billNumber: string | null; collectionNote: string; createdAt: Date };

export class WalkInSalesRepository {
  constructor(private readonly database: DatabaseConnection) {}

  async createEnquiry(input: SalesEnquiryInput): Promise<SalesCaseDto> {
    const existing = await this.database.selectFrom("cxshop_sales_enquiries").select("public_id").where("idempotency_key", "=", input.requestId).executeTakeFirst();
    if (existing) return this.findCase(existing.public_id);
    const product = await this.database.selectFrom("cxshop_products").select(["id", "name"]).where("public_id", "=", input.productId).where("status", "=", "active").executeTakeFirstOrThrow();
    const variant = input.variantId ? await this.database.selectFrom("cxshop_product_variants").select("id").where("public_id", "=", input.variantId).where("product_id", "=", product.id).where("status", "=", "active").executeTakeFirstOrThrow() : undefined;
    const publicId = randomUUID();
    const enquiryNumber = reference("ENQ");
    await this.database.transaction().execute(async transaction => {
      await transaction.insertInto("cxshop_sales_enquiries").values({ public_id: publicId, idempotency_key: input.requestId, enquiry_number: enquiryNumber, customer_name: input.customerName, customer_phone: input.customerPhone, product_id: product.id, variant_id: variant?.id ?? null, quantity: input.quantity, customer_note: input.note, consent_at: new Date() }).execute();
      await this.event(transaction, "walk-in.enquiry.received", "sales-enquiry", publicId, null, input.requestId, { reference: enquiryNumber, productId: input.productId, quantity: input.quantity });
    });
    return this.findCase(publicId);
  }

  async listCases(): Promise<SalesCaseDto[]> {
    const rows = await this.database.selectFrom("cxshop_sales_enquiries as enquiry").innerJoin("cxshop_products as product", "product.id", "enquiry.product_id").leftJoin("cxshop_walk_in_orders as order", "order.enquiry_id", "enquiry.id").select(["enquiry.public_id as id", "enquiry.enquiry_number", "enquiry.status as enquiryStatus", "enquiry.customer_name as customerName", "enquiry.customer_phone as customerPhone", "enquiry.quantity", "enquiry.created_at as createdAt", "product.name as productName", "order.public_id as orderId", "order.order_number", "order.status as orderStatus", "order.total_minor as totalMinor", "order.bill_number as billNumber", "order.collection_note as collectionNote"]).orderBy("enquiry.created_at", "desc").execute();
    return rows.map(row => ({ id: row.orderId ?? row.id, reference: row.order_number ?? row.enquiry_number, status: row.orderStatus ?? "received", customerName: row.customerName, customerPhone: row.customerPhone, productName: row.productName, quantity: row.quantity, totalMinor: row.totalMinor ?? null, billNumber: row.billNumber ?? null, collectionNote: row.collectionNote ?? "", createdAt: row.createdAt }));
  }

  async transition(caseId: string, input: { status: WalkInOrderStatus; reason: string; totalMinor?: number | undefined; billNumber?: string | undefined; collectionNote?: string | undefined }, actorId: string, correlationId: string): Promise<SalesCaseDto> {
    const locatedOrder = await this.database.selectFrom("cxshop_walk_in_orders").selectAll().where("public_id", "=", caseId).executeTakeFirst();
    let enquiryQuery = this.database.selectFrom("cxshop_sales_enquiries as enquiry").innerJoin("cxshop_products as product", "product.id", "enquiry.product_id").leftJoin("cxshop_product_variants as variant", "variant.id", "enquiry.variant_id").select(["enquiry.id", "enquiry.public_id", "enquiry.status", "enquiry.customer_name", "enquiry.customer_phone", "enquiry.quantity", "product.public_id as productPublicId", "product.name as productName", "variant.public_id as variantPublicId", "variant.name as variantName", "variant.sku"]);
    enquiryQuery = locatedOrder ? enquiryQuery.where("enquiry.id", "=", locatedOrder.enquiry_id) : enquiryQuery.where("enquiry.public_id", "=", caseId);
    const enquiry = await enquiryQuery.executeTakeFirstOrThrow();
    const existingOrder = locatedOrder ?? await this.database.selectFrom("cxshop_walk_in_orders").selectAll().where("enquiry_id", "=", enquiry.id).executeTakeFirst();
    if (!existingOrder) {
      if (input.status !== "confirmed" || !input.totalMinor || input.totalMinor < 1) throw new Error("ORDER_CONFIRMATION_TOTAL_REQUIRED");
      return this.confirm(enquiry, input.totalMinor, input.reason, actorId, correlationId);
    }
    if (!canTransition(existingOrder.status, input.status)) throw new Error("ORDER_TRANSITION_INVALID");
    if (input.status === "billed" && !input.billNumber) throw new Error("ORDER_BILL_NUMBER_REQUIRED");
    await this.database.transaction().execute(async transaction => {
      await transaction.updateTable("cxshop_walk_in_orders").set({ status: input.status, bill_number: input.billNumber ?? existingOrder.bill_number, collection_note: input.collectionNote ?? existingOrder.collection_note }).where("id", "=", existingOrder.id).execute();
      await transaction.insertInto("cxshop_walk_in_order_transitions").values({ public_id: randomUUID(), order_id: existingOrder.id, from_status: existingOrder.status, to_status: input.status, actor_public_id: actorId, reason: input.reason, correlation_id: correlationId }).execute();
      await this.event(transaction, `walk-in.order.${input.status}`, "walk-in-order", existingOrder.public_id, actorId, correlationId, { orderNumber: existingOrder.order_number, status: input.status });
    });
    return this.findCase(existingOrder.public_id);
  }

  private async confirm(enquiry: { id: number; public_id: string; customer_name: string; customer_phone: string; quantity: number; productPublicId: string; productName: string; variantPublicId: string | null; variantName: string | null; sku: string | null }, totalMinor: number, reason: string, actorId: string, correlationId: string): Promise<SalesCaseDto> {
    const orderId = randomUUID(); const orderNumber = reference("ORD");
    await this.database.transaction().execute(async transaction => {
      const inserted = await transaction.insertInto("cxshop_walk_in_orders").values({ public_id: orderId, order_number: orderNumber, enquiry_id: enquiry.id, customer_name: enquiry.customer_name, customer_phone: enquiry.customer_phone, total_minor: totalMinor, bill_number: null, collection_note: "", status: "confirmed" }).executeTakeFirstOrThrow();
      await transaction.insertInto("cxshop_walk_in_order_lines").values({ order_id: Number(inserted.insertId), product_public_id: enquiry.productPublicId, variant_public_id: enquiry.variantPublicId, product_name: enquiry.productName, variant_name: enquiry.variantName, sku: enquiry.sku, quantity: enquiry.quantity, unit_minor: Math.floor(totalMinor / enquiry.quantity) }).execute();
      await transaction.updateTable("cxshop_sales_enquiries").set({ status: "converted" }).where("id", "=", enquiry.id).execute();
      await transaction.insertInto("cxshop_walk_in_order_transitions").values({ public_id: randomUUID(), order_id: Number(inserted.insertId), from_status: null, to_status: "confirmed", actor_public_id: actorId, reason, correlation_id: correlationId }).execute();
      await this.event(transaction, "walk-in.order.confirmed", "walk-in-order", orderId, actorId, correlationId, { orderNumber, totalMinor });
    });
    return this.findCase(orderId);
  }

  private async findCase(id: string): Promise<SalesCaseDto> { const item = (await this.listCases()).find(value => value.id === id); if (!item) throw new Error("SALES_CASE_NOT_FOUND"); return item; }
  private async event(transaction: DatabaseTransaction, name: string, type: string, id: string, actor: string | null, correlationId: string, payload: object) {
    const details = JSON.stringify(payload);
    await transaction.insertInto("cxshop_outbox").values({ event_id: randomUUID(), event_name: name, event_version: 1, aggregate_type: type, aggregate_id: id, actor_id: actor, correlation_id: correlationId, payload: details, published_at: null }).execute();
    await transaction.insertInto("cxshop_audit_events").values({ public_id: randomUUID(), actor_public_id: actor, action: name, resource_type: type, resource_public_id: id, correlation_id: correlationId, details }).execute();
  }
}

function reference(prefix: string): string { return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0,4).toUpperCase()}`; }
