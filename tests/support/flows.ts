/** Browser steps shared by the sign-up, sign-in, and progress tests. */
import { expect, type Page } from "@playwright/test";
import { BASE, oobCodeFor } from "./firebase";
import { hydrated } from "./hydration";

export const PASSWORD = "correct-horse-battery";

/** Answers the sign-up age screen with a birth month this many years ago. */
export async function chooseBirth(page: Page, yearsAgo: number, month = 1) {
  await hydrated(page);
  await page.getByLabel("Month").selectOption(String(month));
  await page.getByLabel("Year").selectOption(String(new Date().getFullYear() - yearsAgo));
  await page.getByRole("button", { name: "Continue" }).click();
}

/** Opens the emulator's verification link, as clicking it in the email would, then goes on to sign in. */
export async function confirmEmail(page: Page, email: string, next: string) {
  const code = await oobCodeFor(email, "VERIFY_EMAIL");
  const continueUrl = `${BASE}/signin?verified=1&next=${encodeURIComponent(next)}`;
  await page.goto(`/auth/callback?mode=verifyEmail&oobCode=${code}&continueUrl=${encodeURIComponent(continueUrl)}`);
  await expect(page.getByRole("heading", { name: "Your email is confirmed" })).toBeVisible();
  await page.locator("#main").getByRole("link", { name: "Sign in" }).click();
  await expect(page.getByText("Your email is confirmed. Sign in to continue.")).toBeVisible();
}

export async function signInWithForm(page: Page, email: string, password = PASSWORD) {
  await hydrated(page);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}
