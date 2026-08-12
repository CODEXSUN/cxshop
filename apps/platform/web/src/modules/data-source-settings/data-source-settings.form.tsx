import { useEffect, useState } from "react";
import { KeyRoundIcon, PlugZapIcon, SaveIcon } from "lucide-react";
import { Button } from "@cxshop/ui/components/button";
import { Input } from "@cxshop/ui/components/input";
import { WorkspaceSwitchCard } from "@cxshop/ui/workspace/status";
import {
  WorkspaceFormActions,
  WorkspaceFormBody,
  WorkspaceFormField,
  WorkspaceFormGrid,
  WorkspaceFormSurface
} from "@cxshop/ui/workspace/upsert";
import { frappeConnectionSchema } from "./data-source-settings.schema";
import type {
  DataSourceSettings,
  FrappeConnectionPayload,
  FrappeVerificationPayload
} from "./data-source-settings.types";

type Value = {
  apiKey: string;
  apiSecret: string;
  connectionName: string;
  enabled: boolean;
  saveToEnvironment: boolean;
  url: string;
};

export function DataSourceSettingsForm({
  busy,
  onSave,
  onVerify,
  settings
}: {
  busy: boolean;
  onSave: (value: FrappeConnectionPayload) => void;
  onVerify: (value: FrappeVerificationPayload) => void;
  settings?: DataSourceSettings;
}) {
  const [value, setValue] = useState<Value>(() => fromSettings(settings));
  const [error, setError] = useState("");
  useEffect(() => setValue(fromSettings(settings)), [settings]);
  function parsed() {
    const result = frappeConnectionSchema.safeParse(value);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check the connection details.");
      return null;
    }
    setError("");
    return {
      ...result.data,
      ...(result.data.apiKey ? { apiKey: result.data.apiKey } : {}),
      ...(result.data.apiSecret ? { apiSecret: result.data.apiSecret } : {})
    };
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const result = parsed();
        if (result) onSave(result);
      }}
    >
      <WorkspaceFormSurface>
        <WorkspaceFormBody>
          <div className="flex items-start gap-3 rounded-md bg-muted/30 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <KeyRoundIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Application connection</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Credentials are encrypted in CXShop MariaDB and never returned to the browser. Leave
                a secret blank to keep its saved value.
              </p>
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <WorkspaceFormGrid>
            <WorkspaceFormField label="Connection name" required>
              <Input
                disabled={busy}
                value={value.connectionName}
                onChange={(event) => setValue({ ...value, connectionName: event.target.value })}
              />
            </WorkspaceFormField>
            <WorkspaceFormField label="Frappe URL" required>
              <Input
                disabled={busy}
                placeholder="https://crm.example.com"
                value={value.url}
                onChange={(event) => setValue({ ...value, url: event.target.value })}
              />
            </WorkspaceFormField>
            <WorkspaceFormField label="Frappe app key">
              <Input
                autoComplete="off"
                disabled={busy}
                placeholder={
                  settings?.appKeyConfigured
                    ? "Configured — leave blank to keep"
                    : "Enter Frappe app key"
                }
                type="password"
                value={value.apiKey}
                onChange={(event) => setValue({ ...value, apiKey: event.target.value })}
              />
            </WorkspaceFormField>
            <WorkspaceFormField label="Frappe app secret">
              <Input
                autoComplete="new-password"
                disabled={busy}
                placeholder={
                  settings?.appSecretConfigured
                    ? "Configured — leave blank to keep"
                    : "Enter Frappe app secret"
                }
                type="password"
                value={value.apiSecret}
                onChange={(event) => setValue({ ...value, apiSecret: event.target.value })}
              />
            </WorkspaceFormField>
            <WorkspaceSwitchCard
              activeLabel="Connection enabled"
              ariaLabel="Enable Frappe connection"
              checked={value.enabled}
              className="md:col-span-2"
              description="CXShop API integrations may use this connection only while enabled."
              disabled={busy}
              fieldLabel="Connection status"
              inactiveLabel="Connection disabled"
              onCheckedChange={(enabled) => setValue({ ...value, enabled })}
            />
            <WorkspaceSwitchCard
              activeLabel="Also sync root .env"
              ariaLabel="Sync Frappe connection to root environment"
              checked={value.saveToEnvironment}
              className="md:col-span-2"
              description="Write the same connection to CXShop's configured root .env. Database persistence is always enabled."
              disabled={busy}
              fieldLabel="Environment synchronization"
              inactiveLabel="Save only in database"
              onCheckedChange={(saveToEnvironment) => setValue({ ...value, saveToEnvironment })}
            />
          </WorkspaceFormGrid>
        </WorkspaceFormBody>
        <WorkspaceFormActions>
          <Button
            disabled={busy}
            onClick={() => {
              const result = parsed();
              if (result) onVerify(result);
            }}
            type="button"
            variant="outline"
          >
            <PlugZapIcon className="size-4" />
            Verify connection
          </Button>
          <Button disabled={busy} type="submit">
            <SaveIcon className="size-4" />
            Save connection
          </Button>
        </WorkspaceFormActions>
      </WorkspaceFormSurface>
    </form>
  );
}

function fromSettings(settings?: DataSourceSettings): Value {
  return {
    apiKey: "",
    apiSecret: "",
    connectionName: settings?.connectionName ?? "Frappe",
    enabled: settings?.frappeEnabled ?? false,
    saveToEnvironment: settings?.saveToEnvironment ?? false,
    url: settings?.frappeUrl ?? ""
  };
}
