import type { ProjectDto } from "@cxshop/contracts";
import type { DatabaseConnection } from "@cxshop/framework";

export class ProjectRepository {
  constructor(private readonly database: DatabaseConnection) {}

  async list(): Promise<ProjectDto[]> {
    return this.database
      .selectFrom("cxshop_projects")
      .select(["public_id as id", "project_key as key", "name", "status"])
      .orderBy("created_at")
      .execute();
  }
}
