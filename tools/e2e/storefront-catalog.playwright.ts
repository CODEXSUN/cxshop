import { expect, test } from "@playwright/test";

test("Frappe iShop product is visible and searchable on the storefront", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Acer Aspire 5 15", { exact: true }).first()).toBeVisible();

  await page.keyboard.press("Control+K");
  const search = page.getByRole("textbox", { name: "Search the full catalog" });
  await expect(search).toBeVisible();
  await search.fill("Acer Aspire 5 15");
  await expect(page.getByText("Acer Aspire 5 15", { exact: true }).last()).toBeVisible();
});
