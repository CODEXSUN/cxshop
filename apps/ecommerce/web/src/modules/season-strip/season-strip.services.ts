import type { CatalogSyncResult } from "../catalog-data-source";
import type {
  PromotionCardPayload,
  PromotionCardRecord
} from "../promotion-card/promotion-card.types";

type SeasonRecord = Omit<PromotionCardRecord, "promotionCode"> & { seasonCode: string };
type Envelope<T> = { data: T; success: true } | { error: { message: string }; success: false };
const base = "/api/platform/ecommerce/storefront/season-strips";

async function request<T>(url = base, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {})
    }
  });
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.success)
    throw new Error(body.success ? "Season Strip request failed." : body.error.message);
  return body.data;
}
const toPromotion = (record: SeasonRecord): PromotionCardRecord => ({
  ...record,
  promotionCode: record.seasonCode
});
const toSeason = (payload: PromotionCardPayload) => {
  const { promotionCode, ...rest } = payload;
  return { ...rest, seasonCode: promotionCode };
};
export const getSeasonStrips = async (search = "") =>
  (await request<SeasonRecord[]>(`${base}?search=${encodeURIComponent(search)}`)).map(toPromotion);
export const createSeasonStrip = async (payload: PromotionCardPayload) =>
  toPromotion(
    await request<SeasonRecord>(base, { method: "POST", body: JSON.stringify(toSeason(payload)) })
  );
export const updateSeasonStrip = async (id: number, payload: PromotionCardPayload) =>
  toPromotion(
    await request<SeasonRecord>(`${base}/${id}`, {
      method: "PUT",
      body: JSON.stringify(toSeason(payload))
    })
  );
export const changeSeasonStripStatus = async (id: number, status: "active" | "inactive") =>
  toPromotion(
    await request<SeasonRecord>(
      `${base}/${id}/${status === "active" ? "activate" : "deactivate"}`,
      { method: "POST" }
    )
  );
export const pullSeasonStripsFromFrappe = () =>
  request<CatalogSyncResult>("/api/platform/ecommerce/settings/data-source/sync/pull", {
    method: "POST"
  });
