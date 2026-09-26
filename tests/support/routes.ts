import type { Page } from "@playwright/test";
import type { Route } from "../routes";
import { account, signInBrowser } from "./firebase";

/** Signs the page's browser in first when the route needs an account. */
export async function prepare(page: Page, route: Route) {
  if (!route.auth) return;
  const acct =
    route.auth === "parent" ? await account("parent") : await account("learner", route.auth === "learner" ? {} : { role: route.auth });
  await signInBrowser(page.context(), acct);
}
