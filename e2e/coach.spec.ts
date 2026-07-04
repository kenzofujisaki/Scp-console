import { test, expect } from "@playwright/test";

/**
 * The first-run coach-mark is the product's "aha": it lands the demo user on the
 * scope toggle and walks them through flipping it.
 */

let merchantId: string;

test.beforeAll(async ({ request }) => {
  const res = await request.post("/api/init");
  merchantId = ((await res.json()) as { merchant: { id: string } }).merchant.id;
  // Ensure the default policy (offers blocked) so the coach-mark opens on beat 1,
  // regardless of any state left by a prior run against the same database
  await request.patch("/api/scopes", {
    data: { merchantId, dataType: "offers", exposed: false },
  });
});

test.afterAll(async ({ request }) => {
  // Restore the default policy (offers blocked) so other specs see a clean state
  await request.patch("/api/scopes", {
    data: { merchantId, dataType: "offers", exposed: false },
  });
});

test("coach-mark is an accessible dialog dismissible with Escape", async ({ page, request }) => {
  await request.patch("/api/scopes", { data: { merchantId, dataType: "offers", exposed: false } });
  await page.goto(`/dashboard/scopes?merchantId=${merchantId}&coach=1`);

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(page.getByText("you're in control")).toBeVisible();

  // Keyboard users can dismiss with Escape
  await page.keyboard.press("Escape");
  await expect(page.getByText("you're in control")).toBeHidden();
});

test("coach-mark guides the first flip and persists dismissal", async ({ page }) => {
  await page.goto(`/dashboard/scopes?merchantId=${merchantId}&coach=1`);

  // Beat 1 — before the flip, it explains the control
  await expect(page.getByText("you're in control")).toBeVisible();
  await expect(page.getByText("Personalised offers are switched off.")).toBeVisible();

  // Flip offers on → beat 2 lands the payoff and points at the Request Tester
  await page.getByRole("switch", { name: "Toggle Offers" }).click();
  await expect(page.getByText("Offers are now live to AI.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Open the Request Tester/ })).toBeVisible();

  // Dismiss, then reload — it must not reappear (dismissal persisted)
  await page.getByRole("button", { name: "Got it" }).click();
  await expect(page.getByText("Offers are now live to AI.")).toBeHidden();

  await page.reload();
  await expect(page.getByText("you're in control")).toHaveCount(0);
  await expect(page.getByText("Offers are now live to AI.")).toHaveCount(0);
});
