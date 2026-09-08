import { dotnetBaseUrl, mapCase } from "../../../../src/landops/adapter";

// Keep browser traffic same-origin while the C# API runs on its own local port.
export async function GET(): Promise<Response> {
  const base = dotnetBaseUrl();
  if (!base) return Response.json({ error: "LANDOPS_API_URL is not configured" }, { status: 503 });
  const response = await fetch(`${base}/api/v1/cases/synthetic-wv-case-braxton-001`, { cache: "no-store" });
  if (!response.ok) return Response.json({ error: "Business Agent API case request failed" }, { status: response.status });
  return Response.json(mapCase(await response.json()));
}
