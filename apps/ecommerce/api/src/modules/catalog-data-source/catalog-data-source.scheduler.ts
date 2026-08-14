import type { FastifyInstance } from "fastify";
import { isFrappeOperatingWindow } from "./catalog-data-source.availability.js";
import { CatalogDataSourceService } from "./catalog-data-source.service.js";

const refreshIntervalMilliseconds = 15 * 60 * 1_000;
const startupDelayMilliseconds = 10_000;

export function startCatalogCacheRefresh(
  app: FastifyInstance,
  service: CatalogDataSourceService
) {
  let refreshing = false;
  const refresh = async () => {
    if (refreshing || !isFrappeOperatingWindow(new Date())) return;
    refreshing = true;
    try {
      const result = await service.pullFromFrappe();
      console.info(
        `[ecommerce.catalog] local cache refreshed from Frappe: ${result.items} items, ${result.catalogs} catalogs`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Frappe catalog refresh failed.";
      console.warn(`[ecommerce.catalog] scheduled local cache refresh skipped: ${message}`);
    } finally {
      refreshing = false;
    }
  };
  const startupTimer = setTimeout(() => void refresh(), startupDelayMilliseconds);
  const refreshTimer = setInterval(() => void refresh(), refreshIntervalMilliseconds);
  app.addHook("onClose", async () => {
    clearTimeout(startupTimer);
    clearInterval(refreshTimer);
  });
}
