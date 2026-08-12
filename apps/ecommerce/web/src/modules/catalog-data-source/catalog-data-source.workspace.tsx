import { DatabaseIcon, DownloadIcon, RefreshCwIcon, ServerIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@cxshop/ui/components/button";
import { Card } from "@cxshop/ui/components/card";
import { RadioGroup, RadioGroupItem } from "@cxshop/ui/components/radio-group";
import { WorkspacePage } from "@cxshop/ui/workspace/page";
import { WorkspaceStatusBadge } from "@cxshop/ui/workspace/status";
import { useCatalogDataSource } from "./catalog-data-source.hooks";
import type {
  CatalogDataSourceModule,
  CatalogDataSourceProvider,
  CatalogModuleDataSource
} from "./catalog-data-source.types";

export function CatalogDataSourceWorkspace() {
  const { save, settings, sync, test } = useCatalogDataSource();
  const value = settings.data;
  const busy = save.isPending || sync.isPending || test.isPending;

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
      <div className="grid gap-4">
        <Card
          title="Module data routing"
          description="Choose one live read source per module. Changes apply immediately to storefront requests."
        >
          <DataSourceTable
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
    </WorkspacePage>
  );
}

function DataSourceTable({
  busy,
  frappeConfigured,
  modules,
  onChange
}: {
  busy: boolean;
  frappeConfigured: boolean;
  modules: CatalogModuleDataSource[];
  onChange: (module: CatalogDataSourceModule, provider: CatalogDataSourceProvider) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/35 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Module</th>
            <th className="px-4 py-3 font-semibold">Purpose</th>
            <th className="w-44 px-4 py-3 text-center font-semibold">Local MariaDB</th>
            <th className="w-44 px-4 py-3 text-center font-semibold">Frappe Live</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((item) => (
            <DataSourceRow
              busy={busy}
              frappeConfigured={frappeConfigured}
              item={item}
              key={item.module}
              onChange={onChange}
            />
          ))}
        </tbody>
      </table>
      {!frappeConfigured ? (
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">
          Configure and verify Frappe in Super Admin before selecting a Frappe Live radio option.
        </p>
      ) : null}
    </div>
  );
}

function DataSourceRow({
  busy,
  frappeConfigured,
  item,
  onChange
}: {
  busy: boolean;
  frappeConfigured: boolean;
  item: CatalogModuleDataSource;
  onChange: (module: CatalogDataSourceModule, provider: CatalogDataSourceProvider) => void;
}) {
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/20">
      <td className="px-4 py-4">
        <strong className="font-medium">{item.label}</strong>
        <div className="pt-1">
          <WorkspaceStatusBadge
            label={item.provider === "own" ? "Local priority" : "Live from Frappe"}
            tone={item.provider === "own" ? "success" : "info"}
          />
        </div>
      </td>
      <td className="px-4 py-4 text-muted-foreground">{item.description}</td>
      <td colSpan={2} className="px-4 py-4">
        <RadioGroup
          aria-label={`${item.label} data source`}
          className="grid grid-cols-2 gap-4"
          disabled={busy}
          onValueChange={(provider) => onChange(item.module, provider as CatalogDataSourceProvider)}
          value={item.provider}
        >
          <SourceOption icon={DatabaseIcon} label="Local" value="own" />
          <SourceOption
            disabled={!frappeConfigured}
            icon={ServerIcon}
            label="Frappe"
            value="frappe"
          />
        </RadioGroup>
      </td>
    </tr>
  );
}

function SourceOption({
  disabled = false,
  icon: Icon,
  label,
  value
}: {
  disabled?: boolean;
  icon: typeof DatabaseIcon;
  label: string;
  value: CatalogDataSourceProvider;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 transition-colors hover:bg-accent/60 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-45">
      <RadioGroupItem disabled={disabled} value={value} />
      <Icon className="size-4" />
      <span>{label}</span>
    </label>
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
