"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PortalShell } from "@cxshop/ui";

export function BusinessAssistPage({ portal }: { portal: "admin" | "sa" }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [advice, setAdvice] = useState("");

  useEffect(() => {
    void api("/v1/platform/business-assist/status")
      .then(response => response.json())
      .then(data => setEnabled(Boolean(data.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (!requestId) return;
    const timer = window.setInterval(() => void poll(requestId, timer), 2_000);
    return () => window.clearInterval(timer);
  }, [requestId]);

  async function poll(id: string, timer: number) {
    const data = await api(`/v1/platform/business-assist/requests/${id}`).then(response => response.json()) as { status?: string; response?: string | null; errorCode?: string | null };
    if (data.status === "complete" && data.response) {
      setAdvice(data.response);
      window.clearInterval(timer);
    }
    if (data.status === "failed") {
      setMessage(data.errorCode ?? "Business Assist failed.");
      window.clearInterval(timer);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setAdvice("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await api("/v1/platform/business-assist/requests", {
        method: "POST",
        body: JSON.stringify({ question: form.get("question"), area: form.get("area"), context: {} })
      });
      const data = await response.json() as { requestId?: string; error?: string };
      if (response.ok && data.requestId) {
        setRequestId(data.requestId);
        setMessage("Advice request queued.");
      } else {
        setMessage(data.error ?? "Unable to queue advice.");
      }
    } finally {
      setLoading(false);
    }
  }

  return <PortalShell accent={portal === "sa" ? "#69498b" : "#405d8b"} eyebrow="OpenAI integration" title="Business Assist">
    <section className="surface">
      <h2>Ask for marketplace guidance</h2>
      <p>Business Assist uses only the context you submit. It cannot execute business actions or access private modules directly.</p>
      <p role="status">{enabled === null ? "Checking connectivity..." : enabled ? "OpenAI adapter enabled" : "OpenAI adapter disabled in environment"}</p>
      <form className="assist-form" onSubmit={submit}>
        <label>Area<select name="area"><option value="general">General</option><option value="catalog">Catalog</option><option value="vendor-operations">Vendor operations</option><option value="customer-experience">Customer experience</option><option value="finance">Finance</option><option value="growth">Growth</option></select></label>
        <label>Question<textarea name="question" minLength={10} maxLength={4000} required rows={7}/></label>
        <button disabled={!enabled || loading} type="submit">{loading ? "Queuing..." : "Request advice"}</button>
        {message && <p role="status">{message}</p>}
      </form>
      {advice && <article className="assist-result"><h2>Guidance</h2><p>{advice}</p></article>}
    </section>
  </PortalShell>;
}

function api(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`/api${path}`, { ...init, credentials: "include", headers: { "content-type": "application/json", ...init?.headers } });
}
