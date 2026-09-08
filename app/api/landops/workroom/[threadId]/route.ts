import { dotnetBaseUrl } from "../../../../../src/landops/adapter";
import { upstreamHeaders } from "../../../../../src/landops/proxy";

export async function GET(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const base = dotnetBaseUrl();
  if (!base) return Response.json({ error: "Business Agent API is not configured." }, { status: 503 });
  const { threadId } = await params;
  try {
    const response = await fetch(`${base}/api/v1/workroom/threads/${encodeURIComponent(threadId)}`, { headers: upstreamHeaders(request), cache: "no-store" });
    return new Response(await response.text(), { status: response.status, headers: { "content-type": "application/json" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Agent request could not be loaded." }, { status: 502 });
  }
}
