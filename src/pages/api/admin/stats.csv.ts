/** GET /api/admin/stats.csv?source=&from=&to=: the admin impact numbers as a CSV download. Admins only; aggregates only. */
import { requireRole } from "../../../lib/authz";
import { errorResponse, methodNotAllowed } from "../../../lib/api";
import { filterFrom, impactCsv, impactReport } from "../../../lib/impact";
import type { APIRoute } from "astro";
export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    requireRole(locals, "admin");
    const report = await impactReport(filterFrom(url.searchParams));
    const name = ["ark-impact", report.filter.source, report.filter.from, report.filter.to].filter(Boolean).join("_");
    return new Response(impactCsv(report), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${name}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
};

export const ALL = methodNotAllowed;
