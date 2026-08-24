import { Button } from "@cxshop/ui/components/button";
import { WorkspaceStatusBadge } from "@cxshop/ui/workspace/status";
import type { PromotionCardRecord } from "./promotion-card.types";

export function PromotionCardList({
  loading,
  onEdit,
  onStatus,
  records
}: {
  loading: boolean;
  onEdit: (record: PromotionCardRecord) => void;
  onStatus: (record: PromotionCardRecord) => void;
  records: PromotionCardRecord[];
}) {
  if (loading || records.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        {loading ? "Loading promotion cards..." : "No promotion cards found."}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[920px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left">Preview</th>
            <th className="px-4 py-3 text-left">Promotion</th>
            <th className="px-4 py-3 text-left">Frappe item</th>
            <th className="px-4 py-3 text-left">Order</th>
            <th className="px-4 py-3 text-left">Publication</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr className="border-b" key={record.id}>
              <td className="px-4 py-3">
                {record.imageUrl ? (
                  <img
                    alt={record.title}
                    className="h-12 w-20 rounded border bg-muted/20 object-contain p-1"
                    src={record.imageUrl}
                  />
                ) : (
                  <span className="text-muted-foreground">No image</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">{record.title}</div>
                <div className="text-xs text-muted-foreground">{record.promotionCode}</div>
              </td>
              <td className="px-4 py-3">{record.ishopItem || "Not linked"}</td>
              <td className="px-4 py-3">{record.offerPrice.toLocaleString()}</td>
              <td className="px-4 py-3">{record.displayOrder}</td>
              <td className="px-4 py-3">{record.published ? "Published" : "Draft"}</td>
              <td className="px-4 py-3">
                <WorkspaceStatusBadge
                  label={record.status}
                  tone={record.status === "active" ? "success" : "neutral"}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="outline" onClick={() => onEdit(record)}>
                  Edit
                </Button>{" "}
                <Button size="sm" variant="outline" onClick={() => onStatus(record)}>
                  {record.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
