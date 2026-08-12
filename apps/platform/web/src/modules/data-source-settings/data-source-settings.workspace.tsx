import { useState } from "react";
import { WorkspacePage } from "@cxshop/ui/workspace/page";
import { toast } from "sonner";
import { DataSourceSettingsForm } from "./data-source-settings.form";
import {
  useDataSourceSettingsMutations,
  useDataSourceSettingsQuery
} from "./data-source-settings.hooks";
import { DataSourceConnectionList } from "./data-source-settings.list";
import type { DataSourceConnectionResult, DataSourceProvider } from "./data-source-settings.types";
export function DataSourceSettingsWorkspace() {
  const settings = useDataSourceSettingsQuery();
  const mutations = useDataSourceSettingsMutations();
  const [result, setResult] = useState<DataSourceConnectionResult>();
  const busy =
    mutations.switchProvider.isPending ||
    mutations.testConnection.isPending ||
    mutations.saveFrappe.isPending ||
    mutations.verifyFrappe.isPending;
  function change(provider: DataSourceProvider) {
    mutations.switchProvider.mutate(provider, {
      onError: (error) => toast.error(error.message),
      onSuccess: (value) => toast.success(`${value.providerLabel} is now active.`)
    });
  }
  function test(provider: DataSourceProvider) {
    mutations.testConnection.mutate(provider, {
      onError: (error) => toast.error(error.message),
      onSuccess: (value) => {
        setResult(value);
        if (value.connected) {
          toast.success(value.message);
          return;
        }
        toast.error(value.message);
      }
    });
  }
  function saveFrappe(value: Parameters<typeof mutations.saveFrappe.mutate>[0]) {
    mutations.saveFrappe.mutate(value, {
      onError: (error) => toast.error(error.message),
      onSuccess: () => toast.success("Frappe connection saved securely.")
    });
  }
  function verifyFrappe(value: Parameters<typeof mutations.verifyFrappe.mutate>[0]) {
    mutations.verifyFrappe.mutate(value, {
      onError: (error) => toast.error(error.message),
      onSuccess: (connection) => {
        setResult(connection);
        if (connection.connected) toast.success(connection.message);
        else toast.error(connection.message);
      }
    });
  }
  return (
    <WorkspacePage
      title="Frappe Connection"
      description="Save the CXShop application connection in MariaDB, optionally synchronize .env, and select the active data provider."
      technicalName="page.data-source-settings"
    >
      <div className="rounded-md border bg-card p-4">
        <DataSourceSettingsForm
          busy={busy || settings.isLoading}
          onSave={saveFrappe}
          onVerify={verifyFrappe}
          {...(settings.data ? { settings: settings.data } : {})}
        />
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Active application data source</p>
          <button
            className="sr-only"
            type="button"
            onClick={() => change(settings.data?.provider === "frappe" ? "own" : "frappe")}
          >
            Change provider
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`rounded-md border px-4 py-3 text-sm ${settings.data?.provider !== "frappe" ? "border-primary bg-primary/5 font-medium" : ""}`}
              disabled={busy}
              onClick={() => change("own")}
              type="button"
            >
              Own Database
            </button>
            <button
              className={`rounded-md border px-4 py-3 text-sm ${settings.data?.provider === "frappe" ? "border-primary bg-primary/5 font-medium" : ""}`}
              disabled={busy || !settings.data?.frappeConfigured}
              onClick={() => change("frappe")}
              type="button"
            >
              Frappe Live
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Environment default: {settings.data?.envProvider ?? "own"}. Last verification:{" "}
          {settings.data?.verificationStatus ?? "unverified"}
          {settings.data?.verifiedUser ? ` as ${settings.data.verifiedUser}` : ""}.
        </p>
      </div>
      {settings.error ? (
        <div className="rounded-md border border-destructive/40 p-4 text-sm text-destructive">
          {settings.error.message}
        </div>
      ) : null}
      <DataSourceConnectionList
        busy={busy}
        result={result}
        settings={settings.data}
        onTest={test}
      />
    </WorkspacePage>
  );
}
