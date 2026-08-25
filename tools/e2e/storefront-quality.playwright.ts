import { expect, test } from "@playwright/test";

const viewports = [
  { height: 844, name: "mobile", width: 390 },
  { height: 1024, name: "tablet", width: 768 },
  { height: 800, name: "desktop", width: 1280 },
  { height: 960, name: "wide", width: 1536 }
] as const;

for (const viewport of viewports) {
  test(`storefront remains responsive at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page).toHaveScreenshot(`storefront-${viewport.name}.png`, {
      animations: "disabled",
      fullPage: true,
      mask: [page.locator("img")],
      maxDiffPixelRatio: 0.005
    });
  });
}

test("storefront exposes canonical and structured SEO metadata", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$/u);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/u);
  const schema = JSON.parse(
    (await page.locator("#tech-media-business-schema").textContent()) ?? "{}"
  ) as Record<string, unknown>;
  expect(schema["@context"]).toBe("https://schema.org");
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
  expect((await request.get("/sitemap.xml")).ok()).toBeTruthy();
  expect((await request.get("/llms.txt")).ok()).toBeTruthy();
});
