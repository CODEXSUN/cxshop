import { AppError } from "@cxshop/framework/errors";
import { TaxonomyRepository } from "./taxonomy.repository.js";
import type { TaxonomyKind, TaxonomySaveInput } from "./taxonomy.types.js";
export class TaxonomyService {
  constructor(private readonly repository = new TaxonomyRepository()) {}
  list(kind?: TaxonomyKind) {
    return this.repository.list(kind);
  }
  async save(input: TaxonomySaveInput, id?: number) {
    const value = {
      ...input,
      name: input.name.trim(),
      slug: slugify(input.slug || input.name),
      description: input.description.trim()
    };
    if (!value.name || !value.slug)
      throw AppError.validation("Taxonomy name and slug are required.");
    if (await this.repository.duplicate(value.kind, value.slug, id))
      throw AppError.conflict("This category or tag slug already exists.");
    return id ? this.repository.update(id, value) : this.repository.create(value);
  }
}
function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}
