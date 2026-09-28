/** GET /api/admin/stats?source=&from=&to=: the admin impact numbers as JSON. Admins only; aggregates only. */
import { requireRole } from "../../../lib/authz";
import { getRoute, methodNotAllowed } from "../../../lib/api";
import { filterFrom, impactReport } from "../../../lib/impact";
export const prerender = false;

export const GET = getRoute(async ({ locals, url }) => {
  requireRole(locals, "admin");
  return impactReport(filterFrom(url.searchParams));
});

export const ALL = methodNotAllowed;
