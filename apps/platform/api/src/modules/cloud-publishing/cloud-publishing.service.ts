import { AppError } from "@cxshop/framework/errors";
import { FrappeCloudClient } from "./cloud-publishing.client.js";
import { CloudPublishingRepository } from "./cloud-publishing.repository.js";
import type { CloudConnectionInput, CloudPublishingQueuePort } from "./cloud-publishing.types.js";

export const cloudArticlePublishJobName = "blogs.cloud-publishing.article";
export class CloudPublishingService {
  constructor(
    private readonly enqueue: CloudPublishingQueuePort,
    private readonly repository = new CloudPublishingRepository()
  ) {}
  connection() {
    return this.repository.connection();
  }
  publications() {
    return this.repository.listPublications();
  }
  async saveConnection(input: CloudConnectionInput, actor: string) {
    validateHttps(input.siteUrl);
    await this.repository.saveConnection(input, actor);
    return this.verify();
  }
  async verify() {
    const credentials = await this.requiredCredentials(false);
    const result = await new FrappeCloudClient(credentials).verify();
    return this.repository.markVerified(result.user, result.sessionToken);
  }
  async pull() {
    const credentials = await this.requiredCredentials(true);
    const result = await new FrappeCloudClient(credentials).pull();
    const imported = await this.repository.importArticles(result.articles);
    await this.repository.saveSessionToken(result.sessionToken);
    return { ...imported, pulledAt: new Date().toISOString(), received: result.articles.length };
  }
  async requestPublish(articleId: number, actor: string, correlationId: string) {
    const connection = await this.repository.connection();
    if (!connection.enabled || connection.verificationStatus !== "live")
      throw AppError.validation(
        "Verify and enable the production site connection before publishing."
      );
    const article = await this.repository.article(articleId);
    if (!article) throw AppError.notFound("Article was not found.");
    if (article.status !== "published")
      throw AppError.validation("Only a locally published article can be sent to production.");
    const publication = await this.repository.createPublication(article, actor);
    if (!publication) throw AppError.conflict("Publication request could not be created.");
    await this.enqueue({
      actorEmail: actor,
      correlationId,
      idempotencyKey: `blogs.publish:${publication.uuid}`,
      jobName: cloudArticlePublishJobName,
      maxAttempts: 3,
      payload: { publicationId: publication.id },
      priority: 10,
      queueName: "system",
      sourceModule: "blogs.cloud-publishing"
    });
    return publication;
  }
  async process(publicationId: number) {
    const publication = await this.repository.findPublication(publicationId);
    if (!publication) throw AppError.notFound("Publication request was not found.");
    await this.repository.markRunning(publicationId);
    try {
      const [credentials, article] = await Promise.all([
        this.requiredCredentials(true),
        this.repository.article(publication.articleId)
      ]);
      if (!article) throw AppError.notFound("Source article was not found.");
      const tags = await this.repository.taxonomy(parseIds(article.tag_ids));
      const result = await new FrappeCloudClient(credentials).publish(
        credentials.publishMethod,
        articlePayload(article, tags)
      );
      await this.repository.saveSessionToken(result.sessionToken);
      return await this.repository.markCompleted(
        publicationId,
        result.remoteName,
        result.publicUrl
      );
    } catch (error) {
      await this.repository.markFailed(
        publicationId,
        error instanceof Error ? error.message : "Production publication failed."
      );
      throw error;
    }
  }
  private async requiredCredentials(requireEnabled: boolean) {
    const value = await this.repository.credentials();
    if (!value || (requireEnabled && !value.enabled))
      throw AppError.validation("Production site connection is not enabled.");
    validateHttps(value.siteUrl);
    if (!value.user || !value.password)
      throw AppError.validation("Site user and password are required.");
    return value;
  }
}
function validateHttps(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw AppError.validation("Production site URL must use HTTPS.");
}
function parseIds(value: unknown) {
  try {
    const result = Array.isArray(value) ? value : JSON.parse(String(value ?? "[]"));
    return result.map(Number).filter(Number.isFinite);
  } catch {
    return [];
  }
}
function articlePayload(row: Record<string, unknown>, tags: string[]) {
  return {
    author_avatar: row.author_avatar,
    author_name: row.author_name,
    author_role: row.author_role,
    canonical_url: row.canonical_url,
    category: row.category_name,
    excerpt: row.excerpt,
    featured_image: row.featured_image,
    image_alt: row.image_alt,
    kind: row.kind,
    mdx: row.mdx,
    published_at: row.published_at ? new Date(row.published_at as string).toISOString() : null,
    seo_description: row.seo_description,
    seo_title: row.seo_title,
    slug: row.slug,
    source_updated_at: new Date(row.updated_at as string).toISOString(),
    source_uuid: row.uuid,
    status: row.status,
    tags,
    title: row.title
  };
}
