export type CloudConnection = {
  enabled: boolean;
  lastVerifiedAt: string | null;
  passwordConfigured: boolean;
  siteUrl: string;
  updatedAt: string | null;
  updatedBy: string | null;
  user: string;
  verificationStatus: "live" | "unverified";
  verifiedUser: string | null;
  transactionTokenConfigured: boolean;
};
export type CloudConnectionPayload = {
  enabled: boolean;
  password?: string | undefined;
  siteUrl: string;
  user: string;
};
export type CloudPullResult = {
  created: number;
  pulledAt: string;
  received: number;
  updated: number;
};
export type CloudPublication = {
  articleId: number;
  articleSlug: string;
  articleTitle: string;
  attempts: number;
  completedAt: string | null;
  createdAt: string;
  errorMessage: string | null;
  id: number;
  publicUrl: string | null;
  remoteDocumentName: string | null;
  requestedBy: string;
  sourceUpdatedAt: string;
  status: "completed" | "failed" | "pending" | "running";
  updatedAt: string;
  uuid: string;
};
export type PublishableArticle = {
  id: number;
  slug: string;
  status: "archived" | "draft" | "published";
  title: string;
  updatedAt: string;
};
