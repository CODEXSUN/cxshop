import { orderTransitionSchema, salesEnquirySchema } from "@cxshop/contracts";
import { WalkInSalesRepository, type SalesCaseDto } from "../infrastructure/walk-in-sales.repository";

type StoreConfig = { STORE_NAME: string; STORE_WHATSAPP: string; STORE_ADDRESS: string };
export class WalkInSalesService {
  constructor(private readonly repository: WalkInSalesRepository, private readonly store: StoreConfig) {}
  listCases() { return this.repository.listCases(); }
  async createEnquiry(value: unknown) { const item = await this.repository.createEnquiry(salesEnquirySchema.parse(value)); return { item, whatsappUrl: this.whatsapp(item, "enquiry") }; }
  async transition(id: string, value: unknown, actorId: string, correlationId: string) { const item = await this.repository.transition(id, orderTransitionSchema.parse(value), actorId, correlationId); return { item, whatsappUrl: this.whatsapp(item, item.status) }; }
  private whatsapp(item: SalesCaseDto, purpose: string): string {
    const total = item.totalMinor === null ? "To be confirmed by the store" : `INR ${(item.totalMinor / 100).toFixed(2)}`;
    const message = [`Hello ${this.store.STORE_NAME},`, `Reference: ${item.reference}`, `Product: ${item.productName}`, `Quantity: ${item.quantity}`, `Status: ${purpose.replaceAll("_", " ")}`, `Total: ${total}`, purpose === "ready_for_collection" ? `Collection: ${this.store.STORE_ADDRESS}` : "Please confirm this request manually."].join("\n");
    return `https://wa.me/${this.store.STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
  }
}
