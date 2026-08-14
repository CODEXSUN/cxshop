import { DatabaseIcon, ServerIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@cxshop/ui/components/radio-group";
import { WorkspaceStatusBadge } from "@cxshop/ui/workspace/status";
import type {
  CatalogDataSourceModule,
  CatalogDataSourceProvider,
  CatalogModuleDataSource
} from "./catalog-data-source.types";

export function CatalogDataSourceList({
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
          Save and verify the Frappe connector above before selecting Frappe Live.
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
