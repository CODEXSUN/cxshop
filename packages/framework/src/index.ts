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

export type DatabaseSchema = {
  cxshop_users: UserTable;
  cxshop_portal_access: PortalAccessTable;
  cxshop_vendor_memberships: VendorMembershipTable;
  cxshop_projects: ProjectTable;
  cxshop_vendors: VendorTable;
  cxshop_schema_migrations: SchemaMigrationTable;
  cxshop_business_assist_requests: BusinessAssistRequestTable;
  cxshop_jobs: JobTable;
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
