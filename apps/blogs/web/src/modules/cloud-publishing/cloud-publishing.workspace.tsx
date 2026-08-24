import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@cxshop/ui/components/button";
import { WorkspacePage } from "@cxshop/ui/workspace/page";
import { CloudConnectionForm } from "./cloud-publishing.form";
import {
  cloudConnectionKey,
  cloudPublicationsKey,
  useCloudConnection,
  useCloudPublications,
  usePublishableArticles
} from "./cloud-publishing.hooks";
import { CloudPublishingList } from "./cloud-publishing.list";
import {
  publishArticleToCloud,
  pullArticlesFromCloud,
  saveCloudConnection,
  verifyCloudConnection
} from "./cloud-publishing.services";
import type { CloudConnectionPayload } from "./cloud-publishing.types";
export function CloudPublishingWorkspace({
  view = "publications"
}: {
  view?: "connection" | "publications";
}) {
  const client = useQueryClient(),
    connection = useCloudConnection(),
    publications = useCloudPublications(),
    articles = usePublishableArticles();
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: cloudConnectionKey }),
      client.invalidateQueries({ queryKey: cloudPublicationsKey }),
      articles.refetch()
    ]);
  };
  const save = useMutation({
    mutationFn: (value: CloudConnectionPayload) => saveCloudConnection(value),
    onSuccess: async () => {
      await refresh();
      toast.success("Production site verified");
    },
    onError: (error) => toast.error(error.message)
  });
  const verify = useMutation({
    mutationFn: verifyCloudConnection,
    onSuccess: async () => {
      await refresh();
      toast.success("Production site verified");
    },
    onError: (error) => toast.error(error.message)
  });
  const publish = useMutation({
    mutationFn: publishArticleToCloud,
    onSuccess: async () => {
      await refresh();
      toast.success("Article queued for cloud publishing");
    },
    onError: (error) => toast.error(error.message)
  });
  const pull = useMutation({
    mutationFn: pullArticlesFromCloud,
    onSuccess: async (result) => {
      await refresh();
      toast.success(`Cloud refresh complete: ${result.created} created, ${result.updated} updated`);
    },
    onError: (error) => toast.error(error.message)
  });
  if (view === "connection")
    return (
      <WorkspacePage
        title="Production Site Connection"
        description="One application-level Frappe connection shared by Blogs now and other modules later."
      >
        <CloudConnectionForm
          connection={connection.data}
          saving={save.isPending}
          onSave={(value) => save.mutate(value)}
          onVerify={() => verify.mutate()}
        />
      </WorkspacePage>
    );
  return (
    <div className="[&_tbody_td]:py-4">
      <WorkspacePage
        title="Cloud Publishing"
        description="Review local article revisions and explicitly deploy approved content to the public production site."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.assign("/admin/application/connections/production")}
            >
              <Settings2 className="size-4" />
              Production settings
            </Button>
            <Button
              variant="outline"
              disabled={pull.isPending || connection.data?.verificationStatus !== "live"}
              onClick={() => pull.mutate()}
            >
              <RefreshCw className="size-4" />
              {pull.isPending ? "Pulling..." : "Pull fresh from cloud"}
            </Button>
          </div>
        }
      >
        <div className="mb-4 flex items-center justify-between rounded-md bg-muted/40 p-4 text-sm">
          <span>
            Production: <strong>{connection.data?.siteUrl || "Not configured"}</strong>
            {" · "}
            Session:{" "}
            <strong>
              {connection.data?.transactionTokenConfigured ? "Ready" : "Not generated"}
            </strong>
          </span>
          <WorkspaceStatusBadgeProxy
            live={connection.data?.verificationStatus === "live" && connection.data.enabled}
          />
        </div>
        <CloudPublishingList
          articles={articles.data ?? []}
          publications={publications.data ?? []}
          publishing={publish.isPending}
          onPublish={(id) => publish.mutate(id)}
        />
      </WorkspacePage>
    </div>
  );
}
function WorkspaceStatusBadgeProxy({ live }: { live: boolean }) {
  return (
    <span className={live ? "text-emerald-700" : "text-amber-700"}>
      {live ? "Verified and enabled" : "Connection required"}
    </span>
  );
}
