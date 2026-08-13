import { Card } from "@cxshop/ui/components/card";
import { WorkspacePage } from "@cxshop/ui/workspace/page";
import { Button } from "@cxshop/ui/components/button";
const capabilities = [
  "Core product extensions",
  "Storefront publication",
  "SEO content",
  "Multi-vendor offers",
  "Variants and media",
  "Catalog channels"
];
export function CatalogOverviewWorkspace() {
  return (
    <WorkspacePage
      title="Ecommerce"
      description="Manage the company catalog and storefront publication flow."
    >
      <div className="flex justify-end">
        <Button onClick={() => window.open("/shop", "_blank", "noopener,noreferrer")}>
          Open Storefront
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {capabilities.map((capability) => (
          <Card
            key={capability}
            title={capability}
            description={
              capability === "Core product extensions"
                ? "Available in Product Information."
                : "Defined as a separate Ecommerce owner in the feature specification."
            }
          />
        ))}
      </div>
    </WorkspacePage>
  );
}
