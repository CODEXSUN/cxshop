export type CloudPublishStatus = "completed" | "failed" | "pending" | "running";

export type CloudConnectionInput = {
  enabled: boolean;
  password?: string | undefined;
  siteUrl: string;
  user: string;
};

export type CloudConnectionView = {
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

export type CloudPullResult = {
  created: number;
  pulledAt: string;
  received: number;
  updated: number;
};

export type CloudPublishRecord = {
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
  status: CloudPublishStatus;
  updatedAt: string;
  uuid: string;
};

export type CloudPublishingQueuePort = (input: {
  actorEmail: string;
  correlationId: string;
  idempotencyKey: string;
  jobName: string;
  maxAttempts: number;
  payload: Record<string, unknown>;
  priority: number;
  queueName: string;
  sourceModule: string;
}) => Promise<unknown>;
