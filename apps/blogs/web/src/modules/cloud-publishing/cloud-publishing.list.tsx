import { Button } from "@cxshop/ui/components/button";
import { WorkspaceStatusBadge } from "@cxshop/ui/workspace/status";
import type { CloudPublication, PublishableArticle } from "./cloud-publishing.types";
export function CloudPublishingList({
  articles,
  publications,
  publishing,
  onPublish
}: {
  articles: PublishableArticle[];
  publications: CloudPublication[];
  publishing: boolean;
  onPublish: (id: number) => void;
}) {
  const latest = new Map<number, CloudPublication>();
  for (const publication of publications)
    if (!latest.has(publication.articleId)) latest.set(publication.articleId, publication);
  const records = articles.filter((article) => article.status === "published");
  if (!records.length)
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        Publish an article locally before sending it to production.
      </div>
    );
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left">Article</th>
            <th className="px-4 py-3 text-left">Local revision</th>
            <th className="px-4 py-3 text-left">Cloud status</th>
            <th className="px-4 py-3 text-left">Public URL</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {records.map((article) => {
            const deployment = latest.get(article.id);
            return (
              <tr className="border-b" key={article.id}>
                <td className="px-4 py-3">
                  <strong>{article.title}</strong>
                  <div className="text-muted-foreground">/{article.slug}</div>
                </td>
                <td className="px-4 py-3">{new Date(article.updatedAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {deployment ? (
                    <WorkspaceStatusBadge
                      label={deployment.status}
                      tone={
                        deployment.status === "completed"
                          ? "success"
                          : deployment.status === "failed"
                            ? "danger"
                            : "warning"
                      }
                    />
                  ) : (
                    "Never published"
                  )}
                  {deployment?.errorMessage ? (
                    <div className="mt-1 max-w-72 text-xs text-destructive">
                      {deployment.errorMessage}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {deployment?.publicUrl ? (
                    <a
                      className="text-primary underline"
                      href={deployment.publicUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open public page
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    disabled={
                      publishing ||
                      deployment?.status === "pending" ||
                      deployment?.status === "running"
                    }
                    onClick={() => onPublish(article.id)}
                  >
                    Publish to cloud
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
