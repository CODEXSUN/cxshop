export type EngagementKind = "like" | "star" | "share";
export type EngagementSummary = {
  articleId: number;
  likes: number;
  stars: number;
  shares: number;
  averageStar: number;
};
export type EngagementInput = {
  articleId: number;
  kind: EngagementKind;
  actorKey: string;
  rating: number | null;
  channel: string;
};
