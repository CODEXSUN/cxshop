export type ApiWelcomePageOptions = {
  actionLabel: string;
  actionUrl: string;
  message: string;
  title: string;
};

export function renderApiWelcomePage(options: ApiWelcomePageOptions) {
  const title = escapeHtml(options.title);
  const message = escapeHtml(options.message);
  const actionLabel = escapeHtml(options.actionLabel);
  const actionUrl = escapeHtml(options.actionUrl);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${title}</title>
  <style>
    :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { min-height: 100vh; display: grid; place-items: center; padding: 32px; margin: 0; color: #10233b; background: #f3f8f7; }
    main { width: min(100%, 620px); display: grid; gap: 28px; padding: 48px; background: #fff; border: 1px solid #cbdcd9; border-radius: 24px; box-shadow: 0 20px 60px rgb(17 47 43 / 10%); }
    .status { width: fit-content; display: inline-flex; align-items: center; gap: 9px; color: #087465; font-size: 14px; font-weight: 700; }
    .status::before { width: 10px; height: 10px; content: ""; background: #0c9b83; border-radius: 50%; box-shadow: 0 0 0 5px #d9f5ef; }
    section { display: grid; gap: 14px; }
    h1 { margin: 0; font-size: clamp(34px, 7vw, 56px); line-height: 1.02; letter-spacing: -0.045em; }
    p { max-width: 48ch; margin: 0; color: #526579; font-size: 18px; line-height: 1.65; }
    a { width: fit-content; display: inline-flex; align-items: center; gap: 10px; padding: 14px 19px; color: #fff; background: #087465; border-radius: 12px; font-weight: 750; text-decoration: none; transition: transform 180ms ease, background 180ms ease; }
    a:hover { background: #065f54; transform: translateY(-2px); }
    a:focus-visible { outline: 3px solid #7bd7c8; outline-offset: 4px; }
    .arrow { font-size: 19px; line-height: 1; }
    .tweak { position: fixed; right: 18px; bottom: 18px; display: flex; gap: 4px; padding: 4px; background: rgb(255 255 255 / 92%); border: 1px solid #cbdcd9; border-radius: 10px; }
    .tweak span { padding: 7px 9px; color: #526579; font-size: 13px; }
    .tweak label { padding: 7px 10px; border-radius: 7px; color: #526579; font-size: 13px; cursor: pointer; }
    .tweak input { position: absolute; opacity: 0; }
    .tweak label:has(input:checked) { color: #fff; background: #10233b; }
    body:has(#compact:checked) main { gap: 20px; padding: 34px; }
    @media (max-width: 560px) { body { padding: 18px; } main { padding: 30px 24px; border-radius: 18px; } .tweak { display: none; } }
    @media (prefers-reduced-motion: reduce) { a { transition: none; } }
    @media (prefers-color-scheme: dark) { body { color: #e8f1f0; background: #081412; } main { background: #101f1d; border-color: #29423e; } p, .tweak span, .tweak label { color: #a8bfbb; } .tweak { background: rgb(16 31 29 / 94%); border-color: #29423e; } }
  </style>
</head>
<body>
  <main>
    <div class="status">API connected</div>
    <section>
      <h1>${title}</h1>
      <p>${message}</p>
    </section>
    <a href="${actionUrl}">${actionLabel}<span class="arrow" aria-hidden="true">→</span></a>
  </main>
  <aside class="tweak" aria-label="Display density">
    <span>View</span>
    <label><input id="relaxed" name="density" type="radio" checked>Relaxed</label>
    <label><input id="compact" name="density" type="radio">Compact</label>
  </aside>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, (character) => htmlEntities[character] ?? character);
}

const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
