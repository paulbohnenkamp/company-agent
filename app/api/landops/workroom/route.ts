import { dotnetBaseUrl } from "../../../../src/business-agent/adapter";
import { upstreamHeaders } from "../../../../src/business-agent/proxy";

export async function POST(request: Request) {
  const base = dotnetBaseUrl();
  if (!base) return Response.json({ error: "Business Agent API is not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const response = await fetch(`${base}/api/v1/workroom/threads`, { method: "POST", headers: upstreamHeaders(request, true), body: JSON.stringify(body), cache: "no-store" });
    const payload = await response.json().catch(() => ({ error: "The Business Agent API returned an invalid response." }));
    return Response.json(payload, { status: response.status });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Agent request failed." }, { status: 502 });
  }
}
