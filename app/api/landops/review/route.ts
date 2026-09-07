import { dotnetBaseUrl } from "../../../../src/landops/adapter";
import { upstreamHeaders } from "../../../../src/landops/proxy";

// Review decisions are written by the C# API, not by the browser or this proxy.
export async function POST(request: Request): Promise<Response> {
  const base = dotnetBaseUrl();
  if (!base) return Response.json({ error: "LANDOPS_API_URL is not configured" }, { status: 503 });
  let body: { runId?: string; decision?: string; reviewerId?: string; reason?: string };
  try {
    body = await request.json() as { runId?: string; decision?: string; reviewerId?: string; reason?: string };
  } catch {
    return Response.json({ error: "request body must be valid JSON" }, { status: 400 });
  }
  if (!body.runId || !body.decision || !body.reviewerId || !body.reason) return Response.json({ error: "runId, decision, reviewerId, and reason are required" }, { status: 400 });
  const response = await fetch(`${base}/api/v1/cases/synthetic-wv-case-braxton-001/runs/${body.runId}/review`, { method: "POST", headers: upstreamHeaders(request, true), body: JSON.stringify({ decision: body.decision, reviewerId: body.reviewerId, reason: body.reason }), cache: "no-store" });
  return new Response(await response.text(), { status: response.status, headers: { "content-type": "application/json" } });
}
