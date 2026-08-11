import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicArticle } from "./public-blog.services";

export function PublicArticlePage({ slug }: { slug: string }) {
  const query = useQuery({
    queryKey: ["public-blog", slug],
    queryFn: () => getPublicArticle(slug)
  });
  useEffect(() => {
    if (!query.data) return;
    document.title = query.data.seoTitle || query.data.title;
    setMeta("description", query.data.seoDescription || query.data.excerpt);
    setCanonical(query.data.canonicalUrl || window.location.href);
  }, [query.data]);
  if (query.isLoading) return <div className="public-article">Loading story…</div>;
  if (query.error || !query.data)
    return <div className="public-article">This story is unavailable.</div>;
  const article = query.data;
  return (
    <div className="public-article">
      <a href="/blog">CODEXSUN Journal</a>
      <header>
        <span>{article.kind}</span>
        <h1>{article.title}</h1>
        <p>{article.excerpt}</p>
      </header>
      {article.featuredImage ? <img src={article.featuredImage} alt={article.imageAlt} /> : null}
      <article>{renderMarkdown(article.mdx)}</article>
    </div>
  );
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
