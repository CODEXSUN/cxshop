import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "@cxshop/framework/env";
import { z } from "zod";

export const ecommerceEnv = loadEnv(
  z.object({
    DB_HOST: z.string().min(1),
    DB_MASTER_NAME: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_USER: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    ECOMMERCE_SLIDER_IMAGE_MAX_BYTES: z.coerce.number().int().positive().default(8 * 1024 * 1024),
    ECOMMERCE_SLIDER_IMAGE_ROOT: z
      .string()
      .min(1)
      .default(
        resolve(
          fileURLToPath(new URL("../../../..", import.meta.url)),
          "storage",
          "app",
          "public",
          "images",
          "slider"
        )
      )
  })
);
