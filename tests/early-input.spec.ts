/**
 * Typing into an island before its JavaScript arrives (a slow connection) isn't lost when it
 * hydrates. The auth forms are covered in auth.spec.ts.
 */
import { test, expect } from "@playwright/test";
import { beforeHydration } from "./support/hydration";

test("a reflection typed before the page finishes loading is kept and saved on this device", async ({ page }) => {
  const text = "Why do you sometimes sound so sure?";
  const box = page.getByLabel("What's one thing you'd like to ask an AI tool, and why?");
  await beforeHydration(page, "/dev/components", () => box.fill(text));
  await expect(page.getByText("Saved on this device.", { exact: true })).toBeVisible();
  await expect(box).toHaveValue(text);
  const saved = await page.evaluate(() => Object.entries(localStorage).find(([k]) => k.startsWith("ark.reflect.v1:") && k.endsWith(":style-guide"))?.[1]);
  expect(saved).toBe(text);
});

test("a custom gift amount typed before the page finishes loading is kept", async ({ page }) => {
  const amount = page.getByLabel("Or enter an amount");
  await beforeHydration(page, "/donate", () => amount.fill("75"));
  await expect(page.getByRole("link", { name: "Donate $75" })).toBeVisible();
  await expect(amount).toHaveValue("75");
});
