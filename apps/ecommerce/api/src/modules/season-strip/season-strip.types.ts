import type {
  PromotionCardFilters,
  PromotionCardRecord,
  PromotionCardSaveInput
} from "../promotion-card/promotion-card.types.js";

export type SeasonStripRecord = Omit<PromotionCardRecord, "promotionCode"> & {
  seasonCode: string;
};

export type SeasonStripSaveInput = Omit<PromotionCardSaveInput, "promotionCode"> & {
  seasonCode: string;
};

export type SeasonStripFilters = PromotionCardFilters;
