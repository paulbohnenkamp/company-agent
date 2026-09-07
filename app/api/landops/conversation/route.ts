import { dotnetBaseUrl } from "../../../../src/landops/adapter";
import { upstreamHeaders } from "../../../../src/landops/proxy";

// Conversation stays behind the same-origin boundary and is scoped to one saved run.
export async function POST(request: Request): Promise<Response> {
  const base = dotnetBaseUrl();
  if (!base) return Response.json({ error: "LANDOPS_API_URL is not configured" }, { status: 503 });
  let body: { runId?: string; question?: string; history?: unknown[] };
  try {
    body = await request.json() as { runId?: string; question?: string; history?: unknown[] };
  } catch {
    return Response.json({ error: "request body must be valid JSON" }, { status: 400 });
  }
  if (!body.runId || !body.question?.trim()) return Response.json({ error: "runId and question are required" }, { status: 400 });
  const response = await fetch(`${base}/api/v1/cases/synthetic-wv-case-braxton-001/runs/${body.runId}/conversation`, { method: "POST", headers: upstreamHeaders(request, true), body: JSON.stringify({ question: body.question, history: body.history ?? [] }), cache: "no-store" });
  return new Response(await response.text(), { status: response.status, headers: { "content-type": "application/json" } });
}
