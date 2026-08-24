import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { StorefrontSliderStorage } from "./storefront-slider.storage.js";

export async function registerStorefrontSliderImageRoutes(app: FastifyInstance) {
  const storage = new StorefrontSliderStorage();
  app.get("/storefront/slider-images/:fileName", async (request, reply) => {
    const { fileName } = z
      .object({ fileName: z.string().min(1).max(255) })
      .parse(request.params);
    return reply
      .header("Cache-Control", "public, max-age=86400")
      .type("image/webp")
      .send(await storage.content(fileName));
  });
}
