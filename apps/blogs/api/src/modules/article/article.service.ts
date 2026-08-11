import { AppError } from "@cxshop/framework/errors";
import { ArticleRepository } from "./article.repository.js";
import type { ArticleSaveInput } from "./article.types.js";
export class ArticleService {
  constructor(private readonly repository = new ArticleRepository()) {}
  list(input?: { publicOnly?: boolean; search?: string; kind?: "post" | "page" }) {
    return this.repository.list(input);
  }
  findBySlug(slug: string, publicOnly = false) {
    return this.repository.findBySlug(slug, publicOnly);
  }
  async save(input: ArticleSaveInput, id?: number) {
    const value = {
      ...input,
      title: input.title.trim(),
      slug: slugify(input.slug || input.title),
      excerpt: input.excerpt.trim(),
      seoTitle: (input.seoTitle || input.title).trim(),
      seoDescription: (input.seoDescription || input.excerpt).trim(),
      tagIds: [...new Set(input.tagIds)]
    };
    if (!value.title || !value.slug) throw AppError.validation("Title and slug are required.");
    validateMdx(value.mdx);
    if (await this.repository.duplicate(value.slug, id))
      throw AppError.conflict("This article slug already exists.");
    if (!(await this.repository.taxonomyValid(value.categoryId, value.tagIds)))
      throw AppError.validation("A selected category or tag is inactive or missing.");
    return id ? this.repository.update(id, value) : this.repository.create(value);
  }
}
function slugify(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}
function validateMdx(value: string) {
  if (!value.trim()) throw AppError.validation("MDX content is required.");
  if (/<(script|iframe)\b/iu.test(value) || /javascript:/iu.test(value))
    throw AppError.validation("Unsafe executable markup is not allowed in MDX.");
}
