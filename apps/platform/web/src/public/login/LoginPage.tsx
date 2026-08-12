import { useNavigate } from "@tanstack/react-router";
import { AuthLayout, Button, Field } from "@cxshop/ui";
import { LogIn } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { developmentTenantLogin, type LoginDesk, login } from "../../shared/api/platform-api";
import { requiredClientEnv } from "../../shared/env/client-env";
import {
  hasSessionExpiredReason,
  hasSessionRefreshedReason
} from "../../shared/auth/session-expiry";
import { usePublicCompanyBranding } from "../../modules/tenant-portal/tenant-portal.api";

type LoginPageProps = {
  desk: LoginDesk;
  title: string;
};

export function LoginPage({ desk, title }: LoginPageProps) {
  const branding = usePublicCompanyBranding();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const autoLoginStarted = useRef(false);
  const sessionExpired = hasSessionExpiredReason(window.location.search);
  const sessionRefreshed = hasSessionRefreshedReason(window.location.search);

  const targetPath = useMemo(() => {
    if (desk === "sa") {
      return "/sa/$";
    }

    return "/admin/$";
  }, [desk]);

  useEffect(() => {
    if (
      desk !== "admin" ||
      requiredClientEnv("VITE_DEV_AUTO_TENANT_LOGIN") !== "1" ||
      autoLoginStarted.current
    ) {
      return;
    }

    autoLoginStarted.current = true;
    setLoading(true);
    setMessage("");
    void developmentTenantLogin()
      .then((result) => {
        if (!result.success) {
          setMessage(result.error.message);
          return;
        }
        window.location.assign("/admin/");
      })
      .catch(() => setMessage("Development auto-login failed."))
      .finally(() => setLoading(false));
  }, [desk, navigate, targetPath]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await login({
        desk,
        email,
        password
      });

      if (!result.success) {
        setMessage(result.error?.message ?? "Login failed");
        return;
      }

      if (desk === "admin") {
        window.location.assign("/admin/");
        return;
      }

      await navigate({ to: targetPath });
    } catch {
      setMessage("Network error, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      brandName={branding.data?.brandName}
      logoDarkSrc={branding.data?.logoDarkUrl}
      logoSrc={branding.data?.logoUrl}
      afterCard={
        sessionExpired || sessionRefreshed ? (
          <p className="auth-session-badge" role="status">
            {sessionRefreshed
              ? "Session data was cleared. Sign in again."
              : "Session expired. Please sign in again."}
          </p>
        ) : null
      }
      surface={desk}
      title={title}
    >
      <form className="auth-form" onSubmit={submit}>
        <Field
          autoComplete="email"
          className="auth-field"
          label="Email"
          name="email"
          disabled={loading}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        <Field
          autoComplete="current-password"
          className="auth-field"
          label="Password"
          name="password"
          disabled={loading}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
        <Button
          disabled={loading}
          type="button"
          variant="ghost"
          onClick={() => window.location.assign(`/forgot-password?desk=${desk}`)}
        >
          Forgot password?
        </Button>
        {message ? <p className="form-error">{message}</p> : null}
        <Button disabled={loading} icon={<LogIn size={16} />} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
