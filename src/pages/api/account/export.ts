/** GET /api/account/export: "Download my data" as a JSON file. Read-only, and only your own account. */
import { requireUser } from "../../../lib/authz";
import { getRoute, json, methodNotAllowed } from "../../../lib/api";
import { exportAccount } from "../../../lib/accounts";
export const prerender = false;

export const GET = getRoute(async ({ locals }) => {
  const { uid } = requireUser(locals);
  const data = await exportAccount(uid);
  const day = new Date().toISOString().slice(0, 10);
  return json(200, data, { "Content-Disposition": `attachment; filename="ark-my-data-${day}.json"` });
});

export const ALL = methodNotAllowed;
