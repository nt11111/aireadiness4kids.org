/** GET /api/admin/stats: running totals for the admin page (Phase 5 builds the full dashboard). Admins only. */
import { requireRole } from "../../../lib/authz";
import { getRoute, methodNotAllowed } from "../../../lib/api";
import { db } from "../../../lib/firebase-admin";
export const prerender = false;

export const GET = getRoute(async ({ locals }) => {
  requireRole(locals, "admin");
  const snap = await db().doc("stats/global").get();
  return { global: snap.exists ? snap.data() : {} };
});

export const ALL = methodNotAllowed;
