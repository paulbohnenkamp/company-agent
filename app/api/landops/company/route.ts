import { dotnetBaseUrl, mapCompany } from "../../../../src/landops/adapter";

// Keep the company portfolio request same-origin while the C# API runs separately.
export async function GET(): Promise<Response> {
  const base = dotnetBaseUrl();
  if (!base) return Response.json({ error: "LANDOPS_API_URL is not configured" }, { status: 503 });
  const response = await fetch(`${base}/api/v1/company`, { cache: "no-store" });
  if (!response.ok) return Response.json({ error: "LandOps API company request failed" }, { status: response.status });
  return Response.json(mapCompany(await response.json()));
}

