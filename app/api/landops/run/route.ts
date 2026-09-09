import { dotnetBaseUrl, mapCase, mapRun } from "../../../../src/business-agent/adapter";

// The browser starts a run through this proxy. The C# API owns the workflow.
export async function POST(): Promise<Response> {
  try {
    const base = dotnetBaseUrl();
    if (!base) return Response.json({ error: "LANDOPS_API_URL is not configured" }, { status: 503 });
    const runResponse = await fetch(`${base}/api/v1/cases/synthetic-wv-case-braxton-001/runs`, { method: "POST", cache: "no-store" });
    if (!runResponse.ok) return Response.json({ error: "Business Agent API run request failed" }, { status: runResponse.status });
    const started = await runResponse.json() as { runId?: string };
    if (!started.runId) return Response.json({ error: "Business Agent API returned no run identifier" }, { status: 502 });
    const [runResponseBody, evidenceResponse, caseResponse] = await Promise.all([
      fetch(`${base}/api/v1/cases/synthetic-wv-case-braxton-001/runs/${started.runId}`, { cache: "no-store" }),
      fetch(`${base}/api/v1/cases/synthetic-wv-case-braxton-001/evidence`, { cache: "no-store" }),
      fetch(`${base}/api/v1/cases/synthetic-wv-case-braxton-001`, { cache: "no-store" })
    ]);
    if (!runResponseBody.ok || !evidenceResponse.ok || !caseResponse.ok) return Response.json({ error: "Business Agent API returned an incomplete run response" }, { status: 502 });
    const [run, evidence, caseData] = await Promise.all([runResponseBody.json(), evidenceResponse.json(), caseResponse.json()]);
    return Response.json({ ...mapRun(run), caseData: mapCase(caseData, evidence.evidence ?? []) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Business Agent API run request failed" }, { status: 502 });
  }
}
