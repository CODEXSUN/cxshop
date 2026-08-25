import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@cxshop/ui/components/button";
import { WorkspaceFilters } from "@cxshop/ui/workspace/filters";
import { WorkspacePage } from "@cxshop/ui/workspace/page";
import { StorefrontSectionSwitch } from "../catalog-data-source";
import { PromotionCardForm } from "../promotion-card/promotion-card.form";
import { PromotionCardList } from "../promotion-card/promotion-card.list";
import { invalidateStorefrontClientCache } from "../storefront";
import type {
  PromotionCardPayload,
  PromotionCardRecord
} from "../promotion-card/promotion-card.types";
import {
  changeSeasonStripStatus,
  createSeasonStrip,
  getSeasonStrips,
  pullSeasonStripsFromFrappe,
  updateSeasonStrip
} from "./season-strip.services";

const queryKey = ["ecommerce", "season-strips"] as const;
export function SeasonStripWorkspace() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PromotionCardRecord | null | undefined>();
  const query = useQuery({
    queryKey: [...queryKey, search],
    queryFn: () => getSeasonStrips(search)
  });
  const refresh = () => {
    invalidateStorefrontClientCache();
    return client.invalidateQueries({ queryKey });
  };
  const save = useMutation({
    mutationFn: (value: PromotionCardPayload) =>
      editing ? updateSeasonStrip(editing.id, value) : createSeasonStrip(value),
    onSuccess: async () => {
      await refresh();
      setEditing(undefined);
      toast.success("Season strip saved");
    },
    onError: (error) => toast.error(error.message)
  });
  const changeStatus = useMutation({
    mutationFn: (record: PromotionCardRecord) =>
      changeSeasonStripStatus(record.id, record.status === "active" ? "inactive" : "active"),
    onSuccess: refresh,
    onError: (error) => toast.error(error.message)
  });
  const pull = useMutation({
    mutationFn: pullSeasonStripsFromFrappe,
    onSuccess: async (result) => {
      await refresh();
      toast.success(`Stored ${result.seasonStrips} season strips locally`);
    },
    onError: (error) => toast.error(error.message)
  });
  if (editing !== undefined)
    return (
      <PromotionCardForm
        kind="season"
        loading={save.isPending}
        record={editing}
        onCancel={() => setEditing(undefined)}
        onSubmit={(value) => save.mutate(value)}
      />
    );
  return (
    <WorkspacePage
      title="Season Strips"
      description="Manage the two seasonal storefront banners separately from promotion cards."
      actions={
        <div className="flex flex-wrap gap-2">
          <StorefrontSectionSwitch module="season-strips" />
          <Button variant="outline" disabled={pull.isPending} onClick={() => pull.mutate()}>
            <Download className="size-4" />
            {pull.isPending ? "Pulling..." : "Pull from Frappe"}
          </Button>
          <Button variant="outline" onClick={() => void query.refetch()}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button onClick={() => setEditing(null)}>
            <Plus className="size-4" />
            New
          </Button>
        </div>
      }
    >
      <WorkspaceFilters
        searchPlaceholder="Search season code, title, or Frappe item"
        searchValue={search}
        onSearchValueChange={setSearch}
      />
      <PromotionCardList
        kind="season"
        loading={query.isLoading}
        records={query.data ?? []}
        onEdit={setEditing}
        onStatus={(record) => changeStatus.mutate(record)}
      />
    </WorkspacePage>
  );
}
