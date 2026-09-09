import { dotnetBaseUrl, mapScenarios } from "../../../../src/business-agent/adapter";

/** Returns the role-aware question catalog through the same-origin boundary. */
export async function GET(): Promise<Response> {
  const base = dotnetBaseUrl();
  if (!base) return Response.json({ error: "LANDOPS_API_URL is not configured" }, { status: 503 });
  const response = await fetch(`${base}/api/v1/scenarios`, { cache: "no-store" });
  if (!response.ok) return Response.json({ error: "Business Agent API scenario request failed" }, { status: response.status });
  return Response.json(mapScenarios(await response.json()));
}
