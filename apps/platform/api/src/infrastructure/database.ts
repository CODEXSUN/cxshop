import { Database } from "@cxshop/framework";
import type { DatabaseConnection } from "@cxshop/framework";

export class DatabaseProvider {
  readonly database: Database;
  constructor(url: string) { this.database = new Database(url); }
  get connection(): DatabaseConnection { return this.database.connection; }
}
