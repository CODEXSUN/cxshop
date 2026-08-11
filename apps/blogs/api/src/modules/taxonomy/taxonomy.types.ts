export type TaxonomyKind = "category" | "tag";
export type TaxonomyStatus = "active" | "inactive";
export type TaxonomyRecord = {
  id: number;
  uuid: string;
  kind: TaxonomyKind;
  name: string;
  slug: string;
  description: string;
  status: TaxonomyStatus;
  createdAt: string;
  updatedAt: string;
};
export type TaxonomySaveInput = Pick<
  TaxonomyRecord,
  "kind" | "name" | "slug" | "description" | "status"
>;
