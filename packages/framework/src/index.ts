import { Kysely, MysqlDialect, type Generated, type Transaction } from "kysely";
import mysql from "mysql2";

const DATABASE_POOL_SIZE = 10;
const DATABASE_SSL_QUERY_KEYS = ["ssl", "ssl-mode", "sslMode"];

export type PortalCode = "store" | "vendor" | "admin" | "sa";

export type UserTable = {
  id: Generated<number>;
  public_id: string;
  email: string;
  display_name: string;
  password_hash: string;
  active: Generated<boolean>;
  created_at: Generated<Date>;
};

export type PortalAccessTable = {
  user_id: number;
  portal: PortalCode;
  permissions: string;
  active: boolean;
};

export type VendorMembershipTable = {
  user_id: number;
  vendor_id: number;
  vendor_public_id: string;
  active: boolean;
};

export type ProjectTable = {
  id: Generated<number>;
  public_id: string;
  project_key: string;
  name: string;
  status: Generated<"planned" | "active" | "blocked" | "complete">;
  created_at: Generated<Date>;
};

export type VendorTable = {
  id: Generated<number>;
  public_id: string;
  vendor_key: string;
  name: string;
  status: Generated<"pending" | "active" | "suspended">;
};

export type SchemaMigrationTable = {
  migration_key: string;
  applied_at: Generated<Date>;
};

export type BusinessAssistRequestTable = {
  id: Generated<number>;
  public_id: string;
  actor_public_id: string;
  portal: PortalCode;
  area: string;
  question: string;
  context: string;
  status: Generated<"queued" | "processing" | "complete" | "failed">;
  model: string;
  response_text: string | null;
  provider_response_id: string | null;
  error_code: string | null;
  created_at: Generated<Date>;
  completed_at: Date | null;
};

export type JobTable = {
  id: Generated<number>;
  public_id: string;
  job_name: string;
  job_version: number;
  idempotency_key: string;
  correlation_id: string;
  payload: string;
  status: Generated<"ready" | "running" | "complete" | "failed">;
  attempts: Generated<number>;
  max_attempts: Generated<number>;
  available_at: Generated<Date>;
  created_at: Generated<Date>;
};

export type CatalogTable = {
  id: Generated<number>;
  public_id: string;
  catalog_key: string;
  name: string;
  slug: string;
  description: string;
  status: Generated<"draft" | "active" | "archived">;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
};

export type CategoryTable = {
  id: Generated<number>;
  public_id: string;
  catalog_id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string;
  status: Generated<"draft" | "active" | "archived">;
  sort_order: Generated<number>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
};

export type ProductTable = {
  id: Generated<number>;
  public_id: string;
  product_key: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  status: Generated<"draft" | "active" | "archived">;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
};

export type ProductCategoryTable = { product_id: number; category_id: number; is_primary: boolean };
export type ProductVariantTable = {
  id: Generated<number>;
  public_id: string;
  product_id: number;
  sku: string;
  name: string;
  attributes: string;
  status: Generated<"draft" | "active" | "archived">;
};
export type ProductMediaTable = {
  id: Generated<number>;
  public_id: string;
  product_id: number;
  media_url: string;
  alt_text: string;
  sort_order: Generated<number>;
};
export type SalesEnquiryTable = { id: Generated<number>; public_id: string; idempotency_key: string; enquiry_number: string; customer_name: string; customer_phone: string; product_id: number; variant_id: number | null; quantity: number; customer_note: string; status: Generated<"received" | "converted" | "closed">; consent_at: Date; created_at: Generated<Date> };
export type WalkInOrderTable = { id: Generated<number>; public_id: string; order_number: string; enquiry_id: number; customer_name: string; customer_phone: string; status: Generated<"confirmed" | "billed" | "ready_for_collection" | "collected" | "cancelled">; currency: Generated<string>; total_minor: number; bill_number: string | null; collection_note: Generated<string>; created_at: Generated<Date>; updated_at: Generated<Date> };
export type WalkInOrderLineTable = { id: Generated<number>; order_id: number; product_public_id: string; variant_public_id: string | null; product_name: string; variant_name: string | null; sku: string | null; quantity: number; unit_minor: number };
export type WalkInOrderTransitionTable = { id: Generated<number>; public_id: string; order_id: number; from_status: string | null; to_status: string; actor_public_id: string; reason: string; correlation_id: string; occurred_at: Generated<Date> };
export type AuditEventTable = {
  id: Generated<number>; public_id: string; actor_public_id: string | null; action: string;
  resource_type: string; resource_public_id: string | null; correlation_id: string; details: string; occurred_at: Generated<Date>;
};
export type OutboxTable = {
  id: Generated<number>; event_id: string; event_name: string; event_version: number; aggregate_type: string;
  aggregate_id: string; actor_id: string | null; correlation_id: string; payload: string; occurred_at: Generated<Date>; published_at: Date | null;
};

export type DatabaseSchema = {
  cxshop_users: UserTable;
  cxshop_portal_access: PortalAccessTable;
  cxshop_vendor_memberships: VendorMembershipTable;
  cxshop_projects: ProjectTable;
  cxshop_vendors: VendorTable;
  cxshop_schema_migrations: SchemaMigrationTable;
  cxshop_business_assist_requests: BusinessAssistRequestTable;
  cxshop_jobs: JobTable;
  cxshop_catalogs: CatalogTable;
  cxshop_categories: CategoryTable;
  cxshop_products: ProductTable;
  cxshop_product_categories: ProductCategoryTable;
  cxshop_product_variants: ProductVariantTable;
  cxshop_product_media: ProductMediaTable;
  cxshop_audit_events: AuditEventTable;
  cxshop_outbox: OutboxTable;
  cxshop_sales_enquiries: SalesEnquiryTable;
  cxshop_walk_in_orders: WalkInOrderTable;
  cxshop_walk_in_order_lines: WalkInOrderLineTable;
  cxshop_walk_in_order_transitions: WalkInOrderTransitionTable;
};

export type DatabaseConnection = Kysely<DatabaseSchema>;
export type DatabaseTransaction = Transaction<DatabaseSchema>;

export class Database {
  readonly connection: DatabaseConnection;

  constructor(url: string) {
    const poolUrl = databasePoolUrl(url);
    this.connection = new Kysely<DatabaseSchema>({
      dialect: new MysqlDialect({
        pool: mysql.createPool({ connectionLimit: DATABASE_POOL_SIZE, uri: poolUrl })
      })
    });
  }

  transaction<T>(work: (transaction: DatabaseTransaction) => Promise<T>): Promise<T> {
    return this.connection.transaction().execute(work);
  }

  destroy(): Promise<void> {
    return this.connection.destroy();
  }
}

function databasePoolUrl(value: string): string {
  const url = new URL(value);
  for (const key of DATABASE_SSL_QUERY_KEYS) url.searchParams.delete(key);
  return url.toString();
}

export function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
