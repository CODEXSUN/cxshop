import { z } from "zod";

export const catalogDataSourceProviderSchema = z.enum(["own", "frappe"]);
export const catalogDataSourceModuleSchema = z.enum([
  "categories",
  "brands",
  "products",
  "product-details",
  "variants",
  "product-images"
]);

export const frappeConnectionSchema = z.object({
  apiKey: z.string().trim().max(2000),
  apiSecret: z.string().trim().max(2000),
  connectionName: z.string().trim().min(1, "Enter a connection name.").max(160),
  enabled: z.boolean(),
  url: z
    .string()
    .trim()
    .url("Enter a valid Frappe URL.")
    .max(500)
    .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
      message: "Frappe URL must use HTTP or HTTPS."
    })
});
