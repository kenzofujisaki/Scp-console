import { test, expect } from "@playwright/test";

/**
 * Golden-path e2e smoke tests.
 *
 * Each test seeds the Acme Outdoor Co. reference merchant via /api/init,
 * then exercises a key user journey in a real browser.
 */

let merchantId: string;

test.beforeEach(async ({ request }) => {
  const res = await request.post("/api/init");
  const body = (await res.json()) as { merchant?: { id: string } };
  merchantId = body.merchant?.id ?? "";
});

test("landing page redirects straight to the Acme dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard\?merchantId=/);
  await expect(
    page.getByText("Shopper Context Protocol endpoint governance dashboard"),
  ).toBeVisible();
});

test("dashboard overview shows all four stat cards", async ({ page }) => {
  await page.goto(`/dashboard?merchantId=${merchantId}`);
  await expect(page.getByText("Total Audit Events")).toBeVisible();
  await expect(page.getByText("Last 24 Hours")).toBeVisible();
  await expect(page.getByText("Scopes Exposed")).toBeVisible();
  await expect(page.getByText("Test Shoppers")).toBeVisible();
});

test("scope controls: orders is exposed and offers is blocked by default", async ({ page }) => {
  await page.goto(`/dashboard/scopes?merchantId=${merchantId}`);
  await expect(page.locator("h2", { hasText: "Scope Controls" })).toBeVisible();

  const ordersSwitch = page.getByRole("switch", { name: "Toggle Orders" });
  await expect(ordersSwitch).toBeChecked();

  const offersSwitch = page.getByRole("switch", { name: "Toggle Offers" });
  await expect(offersSwitch).not.toBeChecked();
});

test("toggling offers on and off updates the switch state", async ({ page }) => {
  await page.goto(`/dashboard/scopes?merchantId=${merchantId}`);
  const offersSwitch = page.getByRole("switch", { name: "Toggle Offers" });
  await expect(offersSwitch).not.toBeChecked();

  await offersSwitch.click();
  await expect(offersSwitch).toBeChecked();

  // Toggle back off
  await offersSwitch.click();
  await expect(offersSwitch).not.toBeChecked();
});

test("audit log page shows Export CSV button", async ({ page }) => {
  await page.goto(`/dashboard/audit?merchantId=${merchantId}`);
  await expect(page.locator("h2", { hasText: "Audit Log" })).toBeVisible();
  await expect(page.getByRole("button", { name: /export/i })).toBeVisible();
});

test("context browser fetches live data through the SCP client and reference server", async ({
  page,
}) => {
  // Exercises the full data path: app → @scp/client → reference server RPC → merged response
  await page.goto(`/dashboard/context?merchantId=${merchantId}`);
  await page.getByRole("button", { name: "Fetch Context" }).click();
  await expect(page.getByText("HTTP 200")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/"orders"/)).toBeVisible();
});
