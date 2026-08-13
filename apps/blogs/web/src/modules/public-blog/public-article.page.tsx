import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEngagement,
  getPublicArticle,
  getPublicDiscussions,
  getPublicTaxonomy,
  saveDiscussion,
  saveEngagement
} from "./public-blog.services";
import type { PublicDiscussion } from "./public-blog.types";

export function PublicArticlePage({ slug }: { slug: string }) {
  const client = useQueryClient();
  const articleQuery = useQuery({
    queryKey: ["public-blog", slug],
    queryFn: () => getPublicArticle(slug)
  });
  const article = articleQuery.data;
  const taxonomyQuery = useQuery({
    queryKey: ["public-blog-taxonomy"],
    queryFn: getPublicTaxonomy
  });
  const discussionsQuery = useQuery({
    queryKey: ["public-blog-discussions", article?.id],
    queryFn: () => getPublicDiscussions(article!.id),
    enabled: Boolean(article)
  });
  const engagementQuery = useQuery({
    queryKey: ["public-blog-engagement", article?.id],
    queryFn: () => getEngagement(article!.id),
    enabled: Boolean(article)
  });
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const actorKey = useMemo(visitorKey, []);
  const discussion = useMutation({
    mutationFn: saveDiscussion,
    onSuccess: () => {
      setNotice("Thanks — your contribution is awaiting moderation.");
      setReplyTo(null);
    }
  });
  const engage = useMutation({
    mutationFn: saveEngagement,
    onSuccess: (data) => client.setQueryData(["public-blog-engagement", article?.id], data)
  });
  useEffect(() => {
    if (!article) return;
    document.title = article.seoTitle || article.title;
    setMeta("description", article.seoDescription || article.excerpt);
    setCanonical(article.canonicalUrl || window.location.href);
  }, [article]);
  if (articleQuery.isLoading) return <div className="public-article-state">Loading story…</div>;
  if (articleQuery.error || !article)
    return <div className="public-article-state">This story is unavailable.</div>;
  const taxonomy = taxonomyQuery.data ?? [];
  const category = taxonomy.find((item) => item.id === article.categoryId);
  const tags = taxonomy.filter((item) => article.tagIds.includes(item.id));
  const discussions = discussionsQuery.data ?? [];
  const topLevel = discussions.filter((item) => !item.parentId);
  const reactions = engagementQuery.data;
  const react = (kind: "like" | "star" | "share", rating: number | null = null) =>
    engage.mutate({
      articleId: article.id,
      kind,
      actorKey,
      rating,
      channel: kind === "share" ? "native" : "blog"
    });
  return (
    <main className="public-article">
      <nav>
        <a href="/blog">Journal</a>
        <span>/</span>
        <span>{category?.name ?? "Article"}</span>
      </nav>
      <header>
        <div className="public-article-taxonomy">
          <span>{category?.name ?? article.kind}</span>
          <span>{readTime(article.mdx)} min read</span>
        </div>
        <h1>{article.title}</h1>
        <p>{article.excerpt}</p>
        <div className="public-author">
          {article.authorAvatar ? (
            <img src={article.authorAvatar} alt="" />
          ) : (
            <span aria-hidden="true">{initials(article.authorName)}</span>
          )}
          <div>
            <strong>{article.authorName}</strong>
            <small>
              {article.authorRole} · {formatDate(article.publishedAt ?? article.createdAt)}
            </small>
          </div>
        </div>
      </header>
      {article.featuredImage ? (
        <img className="public-article-cover" src={article.featuredImage} alt={article.imageAlt} />
      ) : null}
      <div className="public-article-layout">
        <aside aria-label="Article actions">
          <button onClick={() => react("like")}>
            ♥ <span>{reactions?.likes ?? 0}</span>
            <small>Like</small>
          </button>
          <button onClick={() => react("star", 5)}>
            ★ <span>{reactions?.averageStar ?? 0}</span>
            <small>Star</small>
          </button>
          <button
            onClick={async () => {
              react("share");
              if (navigator.share)
                await navigator.share({ title: article.title, url: window.location.href });
              else await navigator.clipboard.writeText(window.location.href);
            }}
          >
            ↗ <span>{reactions?.shares ?? 0}</span>
            <small>Share</small>
          </button>
        </aside>
        <article>{renderMarkdown(article.mdx)}</article>
      </div>
      <footer className="public-article-footer">
        <div>
          {tags.map((tag) => (
            <span key={tag.id}>#{tag.name}</span>
          ))}
        </div>
        <p>
          Published {formatDate(article.publishedAt ?? article.createdAt)} · Updated{" "}
          {formatDate(article.updatedAt)}
        </p>
      </footer>
      <section className="public-discussion">
        <header>
          <div>
            <span>Conversation</span>
            <h2>Comments & reviews</h2>
          </div>
          <strong>{discussions.length}</strong>
        </header>
        <DiscussionForm
          articleId={article.id}
          parentId={null}
          pending={discussion.isPending}
          onSubmit={discussion.mutate}
        />
        {notice ? <p className="public-notice">{notice}</p> : null}
        <div className="public-comments">
          {topLevel.map((item) => (
            <div key={item.id} className="public-comment">
              <Comment item={item} />
              <button onClick={() => setReplyTo(replyTo === item.id ? null : item.id)}>
                Reply
              </button>
              {discussions
                .filter((reply) => reply.parentId === item.id)
                .map((reply) => (
                  <div className="public-reply" key={reply.id}>
                    <Comment item={reply} />
                  </div>
                ))}
              {replyTo === item.id ? (
                <DiscussionForm
                  articleId={article.id}
                  parentId={item.id}
                  pending={discussion.isPending}
                  onSubmit={discussion.mutate}
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function DiscussionForm({
  articleId,
  parentId,
  pending,
  onSubmit
}: {
  articleId: number;
  parentId: number | null;
  pending: boolean;
  onSubmit: (
    value: Omit<PublicDiscussion, "id" | "uuid" | "status" | "createdAt" | "updatedAt">
  ) => void;
}) {
  const [kind, setKind] = useState<"comment" | "review">("comment");
  return (
    <form
      className="public-comment-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSubmit({
          articleId,
          parentId,
          kind,
          authorName: String(data.get("name")),
          authorEmail: String(data.get("email")),
          body: String(data.get("body")),
          rating: kind === "review" ? Number(data.get("rating")) : null
        });
        event.currentTarget.reset();
      }}
    >
      <div>
        <input name="name" required placeholder="Your name" />
        <input name="email" type="email" required placeholder="Email (not published)" />
        <select value={kind} onChange={(e) => setKind(e.target.value as "comment" | "review")}>
          <option value="comment">Comment</option>
          <option value="review">Review</option>
        </select>
        {kind === "review" ? (
          <select name="rating" defaultValue="5">
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        ) : null}
      </div>
      <textarea
        name="body"
        required
        minLength={2}
        placeholder={parentId ? "Write a thoughtful reply…" : "Join the conversation…"}
      />
      <button disabled={pending}>
        {pending ? "Sending…" : parentId ? "Post reply" : "Post contribution"}
      </button>
    </form>
  );
}
function Comment({ item }: { item: PublicDiscussion }) {
  return (
    <div className="public-comment-body">
      <span>{initials(item.authorName)}</span>
      <div>
        <strong>
          {item.authorName}
          {item.rating ? ` · ${"★".repeat(item.rating)}` : ""}
        </strong>
        <small>{formatDate(item.createdAt)}</small>
        <p>{item.body}</p>
      </div>
    </div>
  );
}
function readTime(value: string) {
  return Math.max(1, Math.ceil(value.trim().split(/\s+/u).length / 220));
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}
function initials(value: string) {
  return value
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
function visitorKey() {
  const key = localStorage.getItem("cxshop.blog.visitor") ?? crypto.randomUUID();
  localStorage.setItem("cxshop.blog.visitor", key);
  return key;
}
function renderMarkdown(source: string) {
  return source.split(/\n{2,}/u).map((block, index) => {
    const value = block.trim();
    if (value.startsWith("# ")) return <h2 key={index}>{value.slice(2)}</h2>;
    if (value.startsWith("## ")) return <h3 key={index}>{value.slice(3)}</h3>;
    if (value.startsWith("- "))
      return (
        <ul key={index}>
          {value.split("\n").map((line, item) => (
            <li key={item}>{line.replace(/^-\s*/u, "")}</li>
          ))}
        </ul>
      );
    return <p key={index}>{value}</p>;
  });
}
function setMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.append(element);
  }
  element.content = content;
}
function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.append(element);
  }
  element.href = href;
}
