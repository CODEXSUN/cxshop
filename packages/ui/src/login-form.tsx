"use client";

import { Crown, Headphones, LogIn, ShoppingBag, Store } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

type Portal = "store" | "vendor" | "admin" | "sa";

type LoginFormProps = {
  description: string;
  destination: string;
  portal: Portal;
  title: string;
};

export function LoginForm({ description, destination, portal, title }: LoginFormProps) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const autoLoginStarted = useRef(false);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "session-expired") setNotice("Session expired. Please sign in again.");
    if (reason === "portal-switch") setNotice("Confirm your identity to switch workspace.");
  }, []);

  useEffect(() => {
    if (process.env.DEV_LOGIN_AUTO !== "1" || autoLoginStarted.current) return;
    autoLoginStarted.current = true;
    setLoading(true);
    void authenticate("/v1/auth/development-login", { portal })
      .then(response => response.ok
        ? window.location.replace(destination)
        : undefined)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [destination, portal]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await authenticate("/v1/auth/login", {
        email: form.get("email"),
        password: form.get("password"),
        portal
      });
      if (!response.ok) {
        setError("The credentials or portal access are not valid.");
        return;
      }
      window.location.assign(destination);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout afterCard={notice ? <p className="auth-session-badge" role="status">{notice}</p> : null} description={description} portal={portal} title={title}>
      <form className="auth-form" onSubmit={submit}>
        <label><span>Email</span><input autoComplete="email" disabled={loading} name="email" required type="email" /></label>
        <label><span>Password</span><input autoComplete="current-password" disabled={loading} minLength={12} name="password" required type="password" /></label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button disabled={loading} type="submit"><LogIn aria-hidden="true" size={16} />{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ afterCard, children, description, portal, title }: { afterCard: ReactNode; children: ReactNode; description: string; portal: Portal; title: string }) {
  return <main className="auth-page" data-auth-portal={portal}>
    <section className="auth-shell" aria-label={title}>
      <div className="auth-brand"><SurfaceMark portal={portal} /><strong>Codexsun</strong><span>{title}</span></div>
      <div className="auth-content"><div className="auth-card-frame"><div className="auth-card">
        <header className="auth-card-header"><h1>Welcome</h1><p>{description}</p></header>{children}
      </div></div>{afterCard}</div>
    </section>
  </main>;
}

function SurfaceMark({ portal }: { portal: Portal }) {
  const Icon = portal === "sa" ? Crown : portal === "admin" ? Headphones : portal === "vendor" ? Store : ShoppingBag;
  return <span className="auth-surface-mark"><img alt="" aria-hidden="true" src="/logo/logo.svg" /><span className="auth-surface-badge"><Icon aria-hidden="true" size={13} strokeWidth={2.25} /></span></span>;
}

function authenticate(path: string, body: object): Promise<Response> {
  return fetch(`/api${path}`, {
    body: JSON.stringify(body),
    credentials: "include",
    headers: { "content-type": "application/json" },
    method: "POST"
  });
}
