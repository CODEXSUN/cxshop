"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="state-page"><div className="brand"><span className="brand-mark">CX</span><span>Shop</span></div><h1>We could not open this page</h1><p>Your data was not changed. Retry the request or return to the storefront.</p><div className="state-actions"><button onClick={reset} type="button">Try again</button><a href="/">Storefront</a></div></main>;
}
