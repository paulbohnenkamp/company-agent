import { NextRequest } from "next/server";
import { dotnetBaseUrl } from "../../../../../src/landops/adapter";
import { upstreamHeaders } from "../../../../../src/landops/proxy";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (typeof body.threadId !== "string" || !body.threadId.trim()) {
    return Response.json({ error: "threadId is required" }, { status: 400 });
  }
  const base = dotnetBaseUrl() ?? "http://127.0.0.1:5006";
  try {
    const response = await fetch(`${base}/api/v1/workroom/threads/${encodeURIComponent(body.threadId)}/run`, {
      method: "POST",
      headers: upstreamHeaders(request),
      cache: "no-store",
    });
    return new Response(await response.text(), { status: response.status, headers: { "content-type": "application/json" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Agent run failed." }, { status: 502 });
  }
}
