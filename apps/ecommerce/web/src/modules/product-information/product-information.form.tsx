import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@cxshop/ui/components/button";
import { Card } from "@cxshop/ui/components/card";
import { Input } from "@cxshop/ui/components/input";
import { Label } from "@cxshop/ui/components/label";
import { Textarea } from "@cxshop/ui/components/textarea";
import { productInformationSchema } from "./product-information.schema";
import type {
  CoreBrandOption,
  CoreProductOption,
  ProductInformationPayload,
  ProductInformationRecord,
  PublicationStatus
} from "./product-information.types";

const empty: ProductInformationPayload = {
  coreProductId: 0,
  brandId: null,
  storefrontTitle: "",
  subtitle: "",
  slug: "",
  shortDescription: "",
  description: "",
  bulletPoints: [],
  material: "",
  countryOfOrigin: "",
  manufacturer: "",
  warranty: "",
  returnPolicy: "",
  shippingClass: "",
  weight: null,
  length: null,
  width: null,
  height: null,
  minimumOrderQuantity: 1,
  maximumOrderQuantity: null,
  seoTitle: "",
  seoDescription: "",
  publicationStatus: "draft",
  isFeatured: false
};
export function ProductInformationForm({
  brands,
  coreProducts,
  loading,
  onCancel,
  onSubmit,
  record
}: {
  brands: CoreBrandOption[];
  coreProducts: CoreProductOption[];
  loading: boolean;
  onCancel: () => void;
  onSubmit: (payload: ProductInformationPayload) => void;
  record: ProductInformationRecord | null;
}) {
  const [value, setValue] = useState<ProductInformationPayload>(record ? toPayload(record) : empty);
  const [error, setError] = useState("");
  useEffect(() => setValue(record ? toPayload(record) : empty), [record]);
  const update = <K extends keyof ProductInformationPayload>(
    key: K,
    next: ProductInformationPayload[K]
  ) => setValue((current) => ({ ...current, [key]: next }));
  const number = (raw: string) => (raw === "" ? null : Number(raw));
  const submit = () => {
    const parsed = productInformationSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the product details.");
      return;
    }
    setError("");
    onSubmit(parsed.data);
  };
  return (
    <Card
      title={record ? "Edit product details" : "New product details"}
      description="Storefront content and fulfilment details that extend a canonical Core product."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Core product">
          <Select
            value={value.coreProductId}
            onChange={(raw) => update("coreProductId", Number(raw))}
          >
            <option value={0}>Select a product</option>
            {coreProducts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Brand">
          <Select
            value={value.brandId ?? ""}
            onChange={(raw) => update("brandId", raw ? Number(raw) : null)}
          >
            <option value="">No brand</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Publication">
          <Select
            value={value.publicationStatus}
            onChange={(raw) => update("publicationStatus", raw as PublicationStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
        <TextField
          label="Storefront title"
          value={value.storefrontTitle}
          onChange={(raw) => update("storefrontTitle", raw)}
        />
        <TextField
          label="Subtitle"
          value={value.subtitle}
          onChange={(raw) => update("subtitle", raw)}
        />
        <TextField label="Slug" value={value.slug} onChange={(raw) => update("slug", raw)} />
        <TextField
          label="Material"
          value={value.material}
          onChange={(raw) => update("material", raw)}
        />
        <TextField
          label="Country of origin"
          value={value.countryOfOrigin}
          onChange={(raw) => update("countryOfOrigin", raw)}
        />
        <TextField
          label="Manufacturer"
          value={value.manufacturer}
          onChange={(raw) => update("manufacturer", raw)}
        />
        <TextField
          label="Shipping class"
          value={value.shippingClass}
          onChange={(raw) => update("shippingClass", raw)}
        />
        {(["weight", "length", "width", "height"] as const).map((key) => (
          <Field key={key} label={`${key[0]?.toUpperCase()}${key.slice(1)}`}>
            <Input
              min="0"
              step="0.001"
              type="number"
              value={value[key] ?? ""}
              onChange={(event) => update(key, number(event.target.value))}
            />
          </Field>
        ))}
        <Field label="Minimum order quantity">
          <Input
            min="1"
            type="number"
            value={value.minimumOrderQuantity}
            onChange={(event) => update("minimumOrderQuantity", Number(event.target.value))}
          />
        </Field>
        <Field label="Maximum order quantity">
          <Input
            min="1"
            type="number"
            value={value.maximumOrderQuantity ?? ""}
            onChange={(event) => update("maximumOrderQuantity", number(event.target.value))}
          />
        </Field>
        <TextField
          label="SEO title"
          value={value.seoTitle}
          onChange={(raw) => update("seoTitle", raw)}
        />
        <Field label="Short description">
          <Textarea
            value={value.shortDescription}
            onChange={(event) => update("shortDescription", event.target.value)}
          />
        </Field>
        <Field label="Full description">
          <Textarea
            value={value.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </Field>
        <Field label="Selling points (one per line)">
          <Textarea
            value={value.bulletPoints.join("\n")}
            onChange={(event) =>
              update(
                "bulletPoints",
                event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean)
              )
            }
          />
        </Field>
        <Field label="Warranty">
          <Textarea
            value={value.warranty}
            onChange={(event) => update("warranty", event.target.value)}
          />
        </Field>
        <Field label="Return policy">
          <Textarea
            value={value.returnPolicy}
            onChange={(event) => update("returnPolicy", event.target.value)}
          />
        </Field>
        <Field label="SEO description">
          <Textarea
            value={value.seoDescription}
            onChange={(event) => update("seoDescription", event.target.value)}
          />
        </Field>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          checked={value.isFeatured}
          type="checkbox"
          onChange={(event) => update("isFeatured", event.target.checked)}
        />
        Featured product
      </label>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={loading} onClick={submit}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </Card>
  );
}
function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function Select({
  children,
  onChange,
  value
}: {
  children: ReactNode;
  onChange: (value: string) => void;
  value: number | string;
}) {
  return (
    <select
      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  );
}
function TextField({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Field label={label}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}
function toPayload(record: ProductInformationRecord): ProductInformationPayload {
  const {
    id: _id,
    uuid: _uuid,
    coreProductName: _product,
    brandName: _brand,
    createdAt: _created,
    updatedAt: _updated,
    ...payload
  } = record;
  return payload;
}
