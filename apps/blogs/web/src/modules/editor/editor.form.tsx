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
  authorName: "Editorial Team",
  authorRole: "Technology Editor",
  authorAvatar: "",
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
      <div className="blogs-editor-meta">
        <span>{record ? `Created ${formatDate(record.createdAt)}` : "Unsaved draft"}</span>
        <span>
          {record ? `Updated ${formatDate(record.updatedAt)}` : "A timestamp is added on save"}
        </span>
        <span>{value.mdx.trim().split(/\s+/u).length} words</span>
      </div>
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
          <fieldset className="blogs-tags">
            <legend>Tags</legend>
            <div>
              {taxonomy
                .filter((x) => x.kind === "tag")
                .map((tag) => (
                  <label key={tag.id} data-selected={value.tagIds.includes(tag.id)}>
                    <input
                      type="checkbox"
                      checked={value.tagIds.includes(tag.id)}
                      onChange={() =>
                        field(
                          "tagIds",
                          value.tagIds.includes(tag.id)
                            ? value.tagIds.filter((id) => id !== tag.id)
                            : [...value.tagIds, tag.id]
                        )
                      }
                    />
                    {tag.name}
                  </label>
                ))}
            </div>
          </fieldset>
          <div className="blogs-form-section">
            <h2>Author</h2>
            <label>
              Display name
              <input
                value={value.authorName}
                onChange={(e) => field("authorName", e.target.value)}
              />
            </label>
            <label>
              Role
              <input
                value={value.authorRole}
                onChange={(e) => field("authorRole", e.target.value)}
              />
            </label>
            <label>
              Avatar URL
              <input
                value={value.authorAvatar}
                onChange={(e) => field("authorAvatar", e.target.value)}
              />
            </label>
          </div>
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
          <label>
            Canonical URL
            <input
              value={value.canonicalUrl}
              onChange={(e) => field("canonicalUrl", e.target.value)}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}
