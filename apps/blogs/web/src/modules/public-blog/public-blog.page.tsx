import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { searchPublicArticles } from "./public-blog.services";
import "./public-blog.css";
export function PublicBlogPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["public-blog", search],
    queryFn: () => searchPublicArticles(search)
  });
  return (
    <div className="public-blog">
      <header>
        <a href="/">CODEXSUN Journal</a>
        <label>
          <Search />
          <input
            aria-label="Search articles"
            placeholder="Search practical guides"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </header>
      <section className="public-blog-hero">
        <span>Ideas for independent commerce</span>
        <h1>Build a sharper business, one practical story at a time.</h1>
        <p>Field notes on digital commerce, operations, customer trust, and sustainable growth.</p>
      </section>
      <section className="public-blog-grid" aria-live="polite">
        {query.data?.map((article, index) => (
          <article className={index === 0 ? "featured" : ""} key={article.id}>
            {article.featuredImage ? (
              <img src={article.featuredImage} alt={article.imageAlt} />
            ) : null}
            <div>
              <span>
                {article.kind} ·{" "}
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString()
                  : "Recently published"}
              </span>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <a href={`/blog/${article.slug}`}>
                Read story <ArrowRight />
              </a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
