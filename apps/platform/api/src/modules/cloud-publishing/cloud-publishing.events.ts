export const cloudPublishingEvents = {
  articlePublished: "platform.cloud-publishing.article.published",
  cloudPulled: "platform.cloud-publishing.cloud.pulled"
} as const;

export function createCloudPublishingEvent(
  type: (typeof cloudPublishingEvents)[keyof typeof cloudPublishingEvents],
  publicationId?: number
) {
  return { publicationId, type };
}
