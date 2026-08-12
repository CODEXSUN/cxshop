export type DiscussionKind = "comment" | "review";
export type DiscussionRecord = {
  id: number;
  uuid: string;
  articleId: number;
  parentId: number | null;
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
  "articleId" | "parentId" | "kind" | "authorName" | "authorEmail" | "body" | "rating"
>;
