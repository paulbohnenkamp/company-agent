import { dotnetBaseUrl } from "../../../../src/business-agent/adapter";
import { upstreamHeaders } from "../../../../src/business-agent/proxy";

export async function POST(request: Request) {
  const base = dotnetBaseUrl();
  if (!base) return Response.json({ error: "LANDOPS_API_URL is not configured" }, { status: 503 });
  try {
    const body = await request.json();
    const response = await fetch(`${base}/api/v1/cases/${encodeURIComponent(body.caseId)}/scenario-runs`, { method: "POST", headers: upstreamHeaders(request, true), body: JSON.stringify({ scenarioId: body.scenarioId }), cache: "no-store" });
    const payload = await response.json().catch(() => ({ error: "Business Agent API returned an invalid review packet." }));
    return Response.json(payload, { status: response.status });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Seeded review failed." }, { status: 502 });
  }
}
