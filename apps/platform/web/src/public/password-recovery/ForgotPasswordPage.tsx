import { AuthLayout, Button, Field } from "@cxshop/ui";
import { ArrowLeft, Mail } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { forgotPassword, type Desk } from "../../shared/api/platform-api";
import { usePublicCompanyBranding } from "../../modules/tenant-portal/tenant-portal.api";

export function ForgotPasswordPage() {
  const branding = usePublicCompanyBranding();
  const desk = deskFromQuery();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await forgotPassword({
        desk,
        email
      });
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Password recovery failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      brandName={branding.data?.brandName}
      logoDarkSrc={branding.data?.logoDarkUrl}
      logoSrc={branding.data?.logoUrl}
      surface={desk}
      title="Forgot password"
    >
      <form className="auth-form" onSubmit={submit}>
        <Field
          autoComplete="email"
          className="auth-field"
          disabled={loading}
          label="Email"
          name="email"
          onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        <Button disabled={loading} icon={<Mail size={16} />} type="submit">
          {loading ? "Sending..." : "Send reset link"}
        </Button>
        <Button
          disabled={loading}
          icon={<ArrowLeft size={16} />}
          type="button"
          variant="outline"
          onClick={() => window.location.assign(loginPath(desk))}
        >
          Back to sign in
        </Button>
      </form>
    </AuthLayout>
  );
}

function deskFromQuery(): Desk {
  const desk = new URLSearchParams(window.location.search).get("desk");
  return desk === "sa" || desk === "admin" ? desk : "tenant";
}

function loginPath(desk: Desk) {
  if (desk === "sa") return "/sa/login";
  if (desk === "admin") return "/admin/login";
  return "/admin/login";
}
