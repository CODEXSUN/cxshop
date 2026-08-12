import { Button } from "@cxshop/ui/components/button";
import { WorkspaceStatusBadge } from "@cxshop/ui/workspace/status";
import type {
  DataSourceConnectionResult,
  DataSourceProvider,
  DataSourceSettings
} from "./data-source-settings.types";
export function DataSourceConnectionList({
  busy,
  result,
  settings,
  onTest
}: {
  busy: boolean;
  result?: DataSourceConnectionResult | undefined;
  settings?: DataSourceSettings | undefined;
  onTest: (provider: DataSourceProvider) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {(["own", "frappe"] as const).map((provider) => (
        <section className="rounded-md border bg-card p-4" key={provider}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">
                {provider === "own" ? "Own Database" : "Frappe Live"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {provider === "own"
                  ? "Server-selected cxshop_db MariaDB connection."
                  : (settings?.frappeUrl ?? "Configure CXSHOP_FRAPPE_URL in .env.")}
              </p>
            </div>
            <WorkspaceStatusBadge
              label={settings?.provider === provider ? "Active" : "Inactive"}
              tone={settings?.provider === provider ? "success" : "neutral"}
            />
          </div>
          {result?.provider === provider ? (
            <p
              className={`mt-3 text-sm ${result.connected ? "text-emerald-600" : "text-destructive"}`}
            >
              {result.message} ({result.latencyMs} ms)
            </p>
          ) : null}
          <Button
            className="mt-4"
            disabled={busy || (provider === "frappe" && !settings?.frappeConfigured)}
            onClick={() => onTest(provider)}
            type="button"
            variant="outline"
          >
            Test connection
          </Button>
        </section>
      ))}
    </div>
  );
}
