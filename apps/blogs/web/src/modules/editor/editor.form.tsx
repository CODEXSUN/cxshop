import { useState } from "react";
import { Button } from "@cxshop/ui/components/button";
import { articleSchema } from "./editor.schema";
import type { Article, ArticlePayload, Taxonomy } from "./editor.types";
const empty: ArticlePayload = {
  kind: "post",
  title: "",
  slug: "",
  excerpt: "",
  mdx: "# Start writing\n",
  featuredImage: "",
  imageAlt: "",
  categoryId: null,
  tagIds: [],
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  status: "draft"
};
export function EditorForm({
  record,
  taxonomy,
  saving,
  onCancel,
  onSubmit
}: {
  record: Article | null;
  taxonomy: Taxonomy[];
  saving: boolean;
  onCancel: () => void;
  onSubmit: (v: ArticlePayload) => void;
}) {
  const [value, setValue] = useState<ArticlePayload>(record ?? empty),
    [error, setError] = useState("");
  const field = <K extends keyof ArticlePayload>(key: K, next: ArticlePayload[K]) =>
    setValue((current) => ({ ...current, [key]: next }));
  return (
    <section className="blogs-editor-form">
      <header>
        <div>
          <span className="blogs-kicker">MDX file</span>
          <h1>{record ? "Edit article" : "New article"}</h1>
        </div>
        <div className="blogs-actions">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={saving}
            onClick={() => {
              const parsed = articleSchema.safeParse(value);
              if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? "Check the article fields.");
                return;
              }
              onSubmit(parsed.data);
            }}
          >
            {saving ? "Saving…" : "Save article"}
          </Button>
        </div>
      </header>
      {error ? <p className="blogs-error">{error}</p> : null}
      <div className="blogs-editor-grid">
        <div className="blogs-fields">
          <label>
            Title
            <input value={value.title} onChange={(e) => field("title", e.target.value)} />
          </label>
          <div className="blogs-row">
            <label>
              Type
              <select
                value={value.kind}
                onChange={(e) => field("kind", e.target.value as ArticlePayload["kind"])}
              >
                <option value="post">Post</option>
                <option value="page">Page</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={value.status}
                onChange={(e) => field("status", e.target.value as ArticlePayload["status"])}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          <label>
            Slug
            <input value={value.slug} onChange={(e) => field("slug", e.target.value)} />
          </label>
          <label>
            Excerpt
            <textarea
              rows={3}
              value={value.excerpt}
              onChange={(e) => field("excerpt", e.target.value)}
            />
          </label>
          <label>
            Category
            <select
              value={value.categoryId ?? ""}
              onChange={(e) => field("categoryId", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Uncategorised</option>
              {taxonomy
                .filter((x) => x.kind === "category")
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Featured image URL
            <input
              value={value.featuredImage}
              onChange={(e) => field("featuredImage", e.target.value)}
            />
          </label>
          <label>
            Image alt text
            <input value={value.imageAlt} onChange={(e) => field("imageAlt", e.target.value)} />
          </label>
          <label>
            SEO title
            <input value={value.seoTitle} onChange={(e) => field("seoTitle", e.target.value)} />
          </label>
          <label>
            SEO description
            <textarea
              rows={3}
              value={value.seoDescription}
              onChange={(e) => field("seoDescription", e.target.value)}
            />
          </label>
        </div>
        <label className="blogs-mdx">
          Content / MDX
          <textarea
            spellCheck
            rows={28}
            value={value.mdx}
            onChange={(e) => field("mdx", e.target.value)}
          />
          <small>
            Markdown with safe MDX components. Script, iframe, and javascript URLs are rejected.
          </small>
        </label>
      </div>
    </section>
  );
}
