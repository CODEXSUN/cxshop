import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@cxshop/ui/components/button";
import { Card } from "@cxshop/ui/components/card";
import { Input } from "@cxshop/ui/components/input";
import { Label } from "@cxshop/ui/components/label";
import { cloudConnectionSchema } from "./cloud-publishing.schema";
import type { CloudConnection, CloudConnectionPayload } from "./cloud-publishing.types";
export function CloudConnectionForm({
  connection,
  saving,
  onSave,
  onVerify
}: {
  connection: CloudConnection | undefined;
  saving: boolean;
  onSave: (value: CloudConnectionPayload) => void;
  onVerify: () => void;
}) {
  const [value, setValue] = useState<CloudConnectionPayload>({
    enabled: false,
    siteUrl: "",
    user: ""
  });
  const [error, setError] = useState("");
  useEffect(() => {
    if (connection)
      setValue({
        enabled: connection.enabled,
        siteUrl: connection.siteUrl,
        user: connection.user
      });
  }, [connection]);
  const update = <K extends keyof CloudConnectionPayload>(
    key: K,
    next: CloudConnectionPayload[K]
  ) => setValue((current) => ({ ...current, [key]: next }));
  const submit = () => {
    const parsed = cloudConnectionSchema.safeParse(value);
    if (!parsed.success)
      return setError(parsed.error.issues[0]?.message ?? "Check the connection.");
    setError("");
    onSave(parsed.data);
  };
  return (
    <Card
      title="Production site connection"
      description="Credentials are encrypted locally and used only by the server-side HTTPS publisher."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="HTTPS site URL">
          <Input
            placeholder="https://www.example.com"
            value={value.siteUrl}
            onChange={(e) => update("siteUrl", e.target.value)}
          />
        </Field>
        <Field label="Site user">
          <Input value={value.user} onChange={(e) => update("user", e.target.value)} />
        </Field>
        <Field label={`Password${connection?.passwordConfigured ? " (configured)" : ""}`}>
          <Input
            autoComplete="new-password"
            type="password"
            value={value.password ?? ""}
            onChange={(e) => update("password", e.target.value)}
          />
        </Field>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Frappe creates the transaction session after login. The encrypted session remains
        server-side and is renewed automatically.
      </p>
      <label className="mt-4 flex gap-2 text-sm">
        <input
          checked={value.enabled}
          type="checkbox"
          onChange={(e) => update("enabled", e.target.checked)}
        />
        Enable this production site connection for application modules
      </label>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" disabled={!connection?.siteUrl} onClick={onVerify}>
          Verify current
        </Button>
        <Button disabled={saving} onClick={submit}>
          {saving ? "Saving..." : "Save and verify"}
        </Button>
      </div>
    </Card>
  );
}
function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
