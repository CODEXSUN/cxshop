export async function processCloudPublishingEvent(event: { publicationId?: number; type: string }) {
  return { ...event, processed: true };
}
