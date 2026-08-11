import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@cxshop/ui/components/button";
import { WorkspacePage } from "@cxshop/ui/workspace/page";
import { toast } from "sonner";
import { EditorForm } from "./editor.form";
import { useArticles, useTaxonomy, articleKey } from "./editor.hooks";
import { EditorList } from "./editor.list";
import { createArticle, updateArticle } from "./editor.services";
import type { Article, ArticlePayload } from "./editor.types";
import "./editor.css";
export function BlogsEditorWorkspace() {
  const client = useQueryClient(),
    articles = useArticles(),
    taxonomy = useTaxonomy(),
    [editing, setEditing] = useState<Article | null | undefined>(),
    [density, setDensity] = useState<"compact" | "relaxed">("relaxed");
  const save = useMutation({
    mutationFn: (v: ArticlePayload) => (editing ? updateArticle(editing.id, v) : createArticle(v)),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: articleKey });
      setEditing(undefined);
      toast.success("Article saved");
    },
    onError: (e) => toast.error("Article could not be saved", { description: e.message })
  });
  if (editing !== undefined)
    return (
      <EditorForm
        record={editing}
        taxonomy={taxonomy.data ?? []}
        saving={save.isPending}
        onCancel={() => setEditing(undefined)}
        onSubmit={(v) => save.mutate(v)}
      />
    );
  return (
    <div data-density={density}>
      <WorkspacePage
        title="Blogs"
        description="Publish MDX stories and evergreen SEO pages."
        actions={
          <div className="blogs-actions">
            <Button variant="outline" onClick={() => void articles.refetch()}>
              <RefreshCw />
              Refresh
            </Button>
            <Button onClick={() => setEditing(null)}>
              <Plus />
              New article
            </Button>
          </div>
        }
      >
        <EditorList records={articles.data ?? []} onEdit={setEditing} />
      </WorkspacePage>
      <aside className="blogs-tweak">
        <strong>View</strong>
        <button data-active={density === "compact"} onClick={() => setDensity("compact")}>
          Compact
        </button>
        <button data-active={density === "relaxed"} onClick={() => setDensity("relaxed")}>
          Relaxed
        </button>
      </aside>
    </div>
  );
}
