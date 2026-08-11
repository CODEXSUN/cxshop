export type DiscussionKind = "comment" | "review";
export type DiscussionRecord = {
  id: number;
  uuid: string;
  articleId: number;
  kind: DiscussionKind;
  authorName: string;
  authorEmail: string;
  body: string;
  rating: number | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};
export type DiscussionSaveInput = Pick<
  DiscussionRecord,
  "articleId" | "kind" | "authorName" | "authorEmail" | "body" | "rating"
>;
