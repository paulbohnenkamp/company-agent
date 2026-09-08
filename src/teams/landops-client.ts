import { ClientSecretCredential } from "@azure/identity";
import type { LandOpsClient, LandOpsWorkroomRequest, WorkroomActionRequest, WorkroomReviewPacket, LandOpsWorkroomResponse } from "./landops-adapter.js";

type WorkroomIdentity = { tenantId: string; userId: string };

type TokenProvider = () => Promise<string>;

/**
 * Creates the transport client used by the Teams adapter.
 *
 * Local mode may omit the workload credentials for deterministic adapter tests.
 * Deployed mode must provide all four credentials and sends a bearer token to
 * the API. Teams identity headers remain request context only; the API owns
 * authorization.
 */
export function createLandOpsClient(baseUrl: string, tokenProvider = createOptionalApiTokenProvider()): LandOpsClient {
  const endpoint = baseUrl.replace(/\/$/, "");
  const headers = async (identity: WorkroomIdentity, contentType = true): Promise<Record<string, string>> => ({
    ...(contentType ? { "content-type": "application/json" } : {}),
    ...(tokenProvider ? { authorization: `Bearer ${await tokenProvider()}` } : {}),
    // Diagnostic context only. These headers are not an authorization path.
    "x-landops-tenant": identity.tenantId,
    "x-landops-user": identity.userId,
  });

  return {
    async createWorkroom(request: LandOpsWorkroomRequest, identity: WorkroomIdentity): Promise<LandOpsWorkroomResponse> {
      const response = await fetch(`${endpoint}/api/v1/workroom/threads`, {
        method: "POST",
        headers: await headers(identity),
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`Business Agent review returned HTTP ${response.status}`);
      return await response.json() as LandOpsWorkroomResponse;
    },
    async runWorkroom(threadId: string, identity: WorkroomIdentity): Promise<WorkroomReviewPacket> {
      const response = await fetch(`${endpoint}/api/v1/workroom/threads/${encodeURIComponent(threadId)}/run`, {
        method: "POST",
        headers: await headers(identity),
      });
      if (!response.ok) throw new Error(`Business Agent review run returned HTTP ${response.status}`);
      return await response.json() as WorkroomReviewPacket;
    },
    async recordAction(request: WorkroomActionRequest, identity: WorkroomIdentity): Promise<{ action: string; actorId: string; assignee?: string; reason: string }> {
      const response = await fetch(`${endpoint}/api/v1/workroom/threads/${encodeURIComponent(request.threadId)}/actions`, {
        method: "POST",
        headers: await headers(identity),
        body: JSON.stringify({ action: request.action, reason: request.reason, assignee: request.assignee }),
      });
      if (!response.ok) throw new Error(`Business Agent review action returned HTTP ${response.status}`);
      return await response.json() as { action: string; actorId: string; assignee?: string; reason: string };
    },
  };
}

function createOptionalApiTokenProvider(): TokenProvider | undefined {
  const clientId = process.env.LANDOPS_API_CLIENT_ID;
  const clientSecret = process.env.LANDOPS_API_CLIENT_SECRET;
  const tenantId = process.env.LANDOPS_API_TENANT_ID;
  const scope = process.env.LANDOPS_API_SCOPE;
  const values = [clientId, clientSecret, tenantId, scope];
  if (values.every((value) => !value)) return undefined;
  if (values.some((value) => !value)) {
    throw new Error("LANDOPS_API_CLIENT_ID, LANDOPS_API_CLIENT_SECRET, LANDOPS_API_TENANT_ID, and LANDOPS_API_SCOPE must be configured together");
  }

  const credential = new ClientSecretCredential(tenantId!, clientId!, clientSecret!);
  return async () => {
    const token = await credential.getToken(scope!);
    if (!token?.token) throw new Error("Entra did not return a Business Agent API access token");
    return token.token;
  };
}
