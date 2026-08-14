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
import { frappeConnectionSchema } from "./catalog-data-source.schema";
import type {
  CatalogDataSourceSettings,
  FrappeConnectionPayload,
  FrappeVerificationPayload
} from "./catalog-data-source.types";

type FormValue = {
  apiKey: string;
  apiSecret: string;
  connectionName: string;
  enabled: boolean;
  url: string;
};

export function CatalogDataSourceForm({
  busy,
  onSave,
  onVerify,
  settings
}: {
  busy: boolean;
  onSave: (value: FrappeConnectionPayload) => void;
  onVerify: (value: FrappeVerificationPayload) => void;
  settings?: CatalogDataSourceSettings;
}) {
  const [value, setValue] = useState<FormValue>(() => fromSettings(settings));
  const [error, setError] = useState("");

  useEffect(() => setValue(fromSettings(settings)), [settings]);

  function parse() {
    const result = frappeConnectionSchema.safeParse(value);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check the Frappe connection details.");
      return null;
    }
    setError("");
    return result.data;
  }

  function verificationPayload(): FrappeVerificationPayload | null {
    const result = parse();
    if (!result) return null;
    return {
      url: result.url,
      ...(result.apiKey ? { apiKey: result.apiKey } : {}),
      ...(result.apiSecret ? { apiSecret: result.apiSecret } : {})
    };
  }

  function savePayload(): FrappeConnectionPayload | null {
    const result = parse();
    if (!result) return null;
    return {
      connectionName: result.connectionName,
      enabled: result.enabled,
      saveToEnvironment: true,
      url: result.url,
      ...(result.apiKey ? { apiKey: result.apiKey } : {}),
      ...(result.apiSecret ? { apiSecret: result.apiSecret } : {})
    };
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const result = savePayload();
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
              <p className="text-sm font-medium">Shared Frappe connector</p>
              <p className="pt-1 text-sm text-muted-foreground">
                Saves encrypted credentials in MariaDB and synchronizes the same values to the root
                .env. Saved secrets are never returned to the browser.
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
                placeholder="https://erp.example.com"
                value={value.url}
                onChange={(event) => setValue({ ...value, url: event.target.value })}
              />
            </WorkspaceFormField>
            <WorkspaceFormField label="API key">
              <Input
                autoComplete="off"
                disabled={busy}
                placeholder={secretPlaceholder(settings?.appKeyConfigured, "API key")}
                type="password"
                value={value.apiKey}
                onChange={(event) => setValue({ ...value, apiKey: event.target.value })}
              />
            </WorkspaceFormField>
            <WorkspaceFormField label="API secret">
              <Input
                autoComplete="new-password"
                disabled={busy}
                placeholder={secretPlaceholder(settings?.appSecretConfigured, "API secret")}
                type="password"
                value={value.apiSecret}
                onChange={(event) => setValue({ ...value, apiSecret: event.target.value })}
              />
            </WorkspaceFormField>
            <WorkspaceSwitchCard
              activeLabel="Connector enabled"
              ariaLabel="Enable Frappe connector"
              checked={value.enabled}
              className="md:col-span-2"
              description="Allow Ecommerce modules to select Frappe Live after verification."
              disabled={busy}
              fieldLabel="Connection status"
              inactiveLabel="Connector disabled"
              onCheckedChange={(enabled) => setValue({ ...value, enabled })}
            />
          </WorkspaceFormGrid>
        </WorkspaceFormBody>
        <WorkspaceFormActions>
          <Button
            disabled={busy}
            onClick={() => {
              const result = verificationPayload();
              if (result) onVerify(result);
            }}
            type="button"
            variant="outline"
          >
            <PlugZapIcon className="size-4" />
            Verify
          </Button>
          <Button disabled={busy} type="submit">
            <SaveIcon className="size-4" />
            Save connector
          </Button>
        </WorkspaceFormActions>
      </WorkspaceFormSurface>
    </form>
  );
}

function fromSettings(settings?: CatalogDataSourceSettings): FormValue {
  return {
    apiKey: "",
    apiSecret: "",
    connectionName: settings?.connectionName ?? "Frappe",
    enabled: settings?.frappeEnabled ?? false,
    url: settings?.frappeUrl ?? ""
  };
}

function secretPlaceholder(configured: boolean | undefined, label: string) {
  return configured ? "Configured — leave blank to keep" : `Enter Frappe ${label.toLowerCase()}`;
}
