import { test, expect } from "@playwright/test";

/**
 * Onboarding is the first impression and the funnel into the product, so the
 * two paths through it (demo + connect) are covered end-to-end.
 */

test("welcome screen leads with the value proposition and both paths", async ({ page }) => {
  await page.goto("/onboarding");
  await expect(
    page.getByRole("heading", { name: /You decide what customer data AI can see/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Explore the live demo/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /I already have an SCP server/ })).toBeVisible();
  // The live posture preview mirrors the real dashboard
  await expect(page.getByText("What AI can access")).toBeVisible();
  await expect(page.getByText("Withheld")).toBeVisible();
});

test("demo path seeds the reference store and lands on the scope toggle", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: /Explore the live demo/ }).click();
  await expect(page.getByRole("heading", { name: /Your demo store is ready/ })).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: /Open the dashboard/ }).click();
  // Demo users land directly on Scope Controls with the coach-mark flag
  await expect(page).toHaveURL(/\/dashboard\/scopes\?merchantId=.*coach=1/);
});

test("connect path shows the form and can return to the demo", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: /I already have an SCP server/ }).click();
  await expect(
    page.getByRole("heading", { name: /Point the Console at your SCP server/ }),
  ).toBeVisible();
  await expect(page.getByLabel("SCP endpoint URL")).toBeVisible();
  // Escape hatch returns to the welcome screen
  await page.getByText("Explore the demo instead").click();
  await expect(
    page.getByRole("heading", { name: /You decide what customer data AI can see/ }),
  ).toBeVisible();
});
