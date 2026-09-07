/**
 * Real Microsoft Teams channel entrypoint.
 *
 * Run this service separately from Next.js. The web app is the portfolio
 * surface; this process is the Bot Framework/Teams transport surface.
 */
import { App } from "@microsoft/teams.apps";
import { formatTeamsReply, formatWorkroomActionReply, parseWorkroomAction, TeamsIdempotencyStore, toWorkroomRequest, type LandOpsClient, type TeamsActivity } from "./landops-adapter.js";

const app = new App();
const idempotency = new TeamsIdempotencyStore();
const landOpsClient = createLandOpsClient(process.env.LANDOPS_API_URL ?? "http://127.0.0.1:5006");

app.on("message", async ({ send, activity }) => {
  const normalized = activity as unknown as TeamsActivity;
  const mapped = toWorkroomRequest(normalized, {
    caseId: process.env.LANDOPS_TEAMS_CASE_ID ?? "case-braxton-4700701733",
    scenarioId: process.env.LANDOPS_TEAMS_SCENARIO_ID ?? "land-ownership-gaps",
    roleId: process.env.LANDOPS_TEAMS_ROLE_ID ?? "land-analyst",
    requiredGroup: process.env.LANDOPS_TEAMS_GROUP ?? "title-curative-board",
  });
  if (idempotency.has(mapped.activityId)) return;
  idempotency.remember(mapped.activityId);
  await send({ type: "typing" });
  const action = parseWorkroomAction(mapped.request.question);
  if (action) {
    const result = await landOpsClient.recordAction(action, { tenantId: mapped.tenantId, userId: mapped.userId });
    await send(formatWorkroomActionReply(result).text);
    return;
  }
  const response = await landOpsClient.createWorkroom(mapped.request, { tenantId: mapped.tenantId, userId: mapped.userId });
  const packet = await landOpsClient.runWorkroom(response.threadId, { tenantId: mapped.tenantId, userId: mapped.userId });
  await send(formatTeamsReply(response, packet, process.env.LANDOPS_WEB_URL).text);
});

const port = Number(process.env.TEAMS_PORT ?? 3978);
app.start(port).catch((error: unknown) => {
  console.error("Failed to start the LandOps Teams adapter", error);
  process.exitCode = 1;
});

function createLandOpsClient(baseUrl: string): LandOpsClient {
  return {
    async createWorkroom(request, identity) {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/workroom/threads`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-landops-tenant": identity.tenantId, "x-landops-user": identity.userId },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`LandOps Workroom returned HTTP ${response.status}`);
      return await response.json() as Awaited<ReturnType<LandOpsClient["createWorkroom"]>>;
    },
    async runWorkroom(threadId, identity) {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/workroom/threads/${encodeURIComponent(threadId)}/run`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-landops-tenant": identity.tenantId, "x-landops-user": identity.userId },
      });
      if (!response.ok) throw new Error(`LandOps Workroom run returned HTTP ${response.status}`);
      return await response.json() as Awaited<ReturnType<LandOpsClient["runWorkroom"]>>;
    },
    async recordAction(request, identity) {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/workroom/threads/${encodeURIComponent(request.threadId)}/actions`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-landops-tenant": identity.tenantId, "x-landops-user": identity.userId },
        body: JSON.stringify({ action: request.action, reason: request.reason, assignee: request.assignee }),
      });
      if (!response.ok) throw new Error(`LandOps Workroom action returned HTTP ${response.status}`);
      return await response.json() as Awaited<ReturnType<LandOpsClient["recordAction"]>>;
    },
  };
}
