export type CatalogStatus = "draft" | "active" | "archived";

export function catalogEventName(resource: "category" | "product", status: CatalogStatus): string {
  return status === "active" ? `catalog.${resource}.published` : `catalog.${resource}.created`;
}
