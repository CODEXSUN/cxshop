import { AppError } from "@cxshop/framework/errors";
import { EngagementRepository } from "./engagement.repository.js";
import type { EngagementInput } from "./engagement.types.js";
export class EngagementService {
  constructor(private readonly repository = new EngagementRepository()) {}
  summary(id: number) {
    return this.repository.summary(id);
  }
  async upsert(input: EngagementInput) {
    if (!(await this.repository.articlePublished(input.articleId)))
      throw AppError.notFound("Published article was not found.");
    if (input.kind === "star" && (!input.rating || input.rating < 1 || input.rating > 5))
      throw AppError.validation("A star rating from 1 to 5 is required.");
    return this.repository.upsert({
      ...input,
      actorKey: input.actorKey.trim(),
      rating: input.kind === "star" ? input.rating : null
    });
  }
}
