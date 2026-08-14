import { useState } from "react";
import { DownloadIcon, RefreshCwIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@cxshop/ui/components/button";
import { Card } from "@cxshop/ui/components/card";
import { WorkspacePage } from "@cxshop/ui/workspace/page";
import { WorkspaceStatusBadge } from "@cxshop/ui/workspace/status";
import { CatalogDataSourceForm } from "./catalog-data-source.form";
import { useCatalogDataSource } from "./catalog-data-source.hooks";
import { CatalogDataSourceList } from "./catalog-data-source.list";
import type {
  CatalogDataSourceModule,
  CatalogDataSourceProvider
} from "./catalog-data-source.types";

export function CatalogDataSourceWorkspace() {
  const { save, saveConnection, settings, sync, test, verifyConnection } = useCatalogDataSource();
  const [compact, setCompact] = useState(false);
  const value = settings.data;
  const busy =
    save.isPending ||
    saveConnection.isPending ||
    sync.isPending ||
    test.isPending ||
    verifyConnection.isPending;

  function change(module: CatalogDataSourceModule, provider: CatalogDataSourceProvider) {
    save.mutate(
      { module, provider },
      {
        onError: (error) => toast.error(error.message),
        onSuccess: (next) => {
          const changed = next.modules.find((item) => item.module === module);
          toast.success(`${changed?.label ?? "Module"} now reads from ${sourceLabel(provider)}.`);
        }
      }
    );
  }

  function verify() {
    test.mutate("frappe", {
      onError: (error) => toast.error(error.message),
      onSuccess: (result) =>
        result.connected ? toast.success(result.message) : toast.error(result.message)
    });
  }

  function verifyConnectionDetails(input: Parameters<typeof verifyConnection.mutate>[0]) {
    verifyConnection.mutate(input, {
      onError: (error) => toast.error(error.message),
      onSuccess: (result) =>
        result.connected ? toast.success(result.message) : toast.error(result.message)
    });
  }

  function saveConnectionDetails(input: Parameters<typeof saveConnection.mutate>[0]) {
    saveConnection.mutate(input, {
      onError: (error) => toast.error(error.message),
      onSuccess: () => toast.success("Frappe connector saved to MariaDB and .env.")
    });
  }

  function synchronize(action: "pull" | "push" | "seed-demo") {
    sync.mutate(action, {
      onError: (error) => toast.error(error.message),
      onSuccess: (result) =>
        toast.success(
          `${result.message} ${result.items} items and ${result.catalogs} catalogs processed.`
        )
    });
  }

  return (
    <WorkspacePage
      title="Data Source"
      description="Route each Ecommerce module to local MariaDB or live Frappe. Local is the default and remains available for every module."
    >
      <div className={`grid ${compact ? "gap-3" : "gap-5"}`}>
        <CatalogDataSourceForm
          busy={busy || settings.isLoading}
          onSave={saveConnectionDetails}
          onVerify={verifyConnectionDetails}
          {...(value ? { settings: value } : {})}
        />
        <Card
          title="Module data routing"
          description="Choose one live read source per module. Changes apply immediately to storefront requests."
        >
          <CatalogDataSourceList
            busy={busy || settings.isLoading}
            frappeConfigured={value?.frappeConfigured ?? false}
            modules={value?.modules ?? []}
            onChange={change}
          />
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <ConnectionCard
            busy={busy}
            configured={value?.frappeConfigured ?? false}
            status={value?.verificationStatus ?? "unverified"}
            url={value?.frappeUrl ?? null}
            verify={verify}
          />
          <SyncCard
            busy={busy}
            configured={value?.frappeConfigured ?? false}
            synchronize={synchronize}
          />
        </div>
      </div>
      <div className="fixed bottom-5 right-5 z-30 flex items-center gap-1 rounded-md border bg-background/95 p-1 shadow-sm backdrop-blur">
        <span className="px-2 text-xs text-muted-foreground">Density</span>
        <Button onClick={() => setCompact(true)} size="sm" variant={compact ? "default" : "ghost"}>
          Compact
        </Button>
        <Button
          onClick={() => setCompact(false)}
          size="sm"
          variant={!compact ? "default" : "ghost"}
        >
          Relaxed
        </Button>
      </div>
    </WorkspacePage>
  );
}

function ConnectionCard({
  busy,
  configured,
  status,
  url,
  verify
}: {
  busy: boolean;
  configured: boolean;
  status: "live" | "offline" | "unverified";
  url: string | null;
  verify: () => void;
}) {
  return (
    <Card title="Frappe connection" description={url ?? "No Frappe URL is configured."}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <WorkspaceStatusBadge
          label={status === "live" ? "Live" : configured ? "Unverified" : "Not configured"}
          tone={status === "live" ? "success" : "warning"}
        />
        <Button disabled={busy || !configured} onClick={verify} variant="outline">
          <RefreshCwIcon className="size-4" />
          Test connection
        </Button>
      </div>
    </Card>
  );
}

function SyncCard({
  busy,
  configured,
  synchronize
}: {
  busy: boolean;
  configured: boolean;
  synchronize: (action: "pull" | "push" | "seed-demo") => void;
}) {
  return (
    <Card
      title="Catalog synchronization"
      description="Copy catalog records between Frappe and local MariaDB without changing the selected live read source."
    >
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        <Button
          disabled={busy || !configured}
          onClick={() => synchronize("pull")}
          variant="outline"
        >
          <DownloadIcon className="size-4" />
          Pull to local
        </Button>
        <Button
          disabled={busy || !configured}
          onClick={() => synchronize("push")}
          variant="outline"
        >
          <UploadIcon className="size-4" />
          Push to Frappe
        </Button>
        <Button disabled={busy || !configured} onClick={() => synchronize("seed-demo")}>
          Seed 50 Frappe items
        </Button>
      </div>
    </Card>
  );
}

function sourceLabel(provider: CatalogDataSourceProvider) {
  return provider === "frappe" ? "Frappe Live" : "Local MariaDB";
}
