import { dotnetBaseUrl } from "../../../../src/business-agent/adapter";

export async function GET() {
  const base = dotnetBaseUrl();
  if (!base) return Response.json({ error: "LANDOPS_API_URL is not configured" }, { status: 503 });
  const response = await fetch(`${base}/api/v1/cases/synthetic-blue-ridge-lease-001/data-room`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({ error: "Business Agent API returned an invalid data-room response." }));
  return Response.json(payload, { status: response.status });
}
