/**
 * Real Microsoft Teams channel entrypoint.
 *
 * Run this service separately from Next.js. The web app is the portfolio
 * surface; this process is the Bot Framework/Teams transport surface.
 */
import { App, ExpressAdapter } from "@microsoft/teams.apps";
import type { Request, Response } from "express";
import { formatTeamsReply, formatWorkroomActionReply, parseWorkroomAction, TeamsIdempotencyStore, toWorkroomRequest, type TeamsActivity } from "./landops-adapter.js";
import { createLandOpsClient } from "./landops-client.js";

const isLocalUnauthenticatedMode = process.env.DANGEROUSLY_ALLOW_UNAUTHENTICATED_REQUESTS === "true";
if (!isLocalUnauthenticatedMode && (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET)) {
  throw new Error("CLIENT_ID and CLIENT_SECRET are required unless DANGEROUSLY_ALLOW_UNAUTHENTICATED_REQUESTS=true for local testing");
}

const httpAdapter = new ExpressAdapter();
httpAdapter.get("/health", (_request: Request, response: Response) => response.status(200).json({ status: "ok", service: "landops-teams-adapter" }));
const app = new App({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  // The bot app is single-tenant. Without an explicit tenant, the Teams SDK
  // can fall back to the Bot Framework directory when it fetches send tokens.
  tenantId: process.env.TENANT_ID,
  httpServerAdapter: httpAdapter,
  dangerouslyAllowUnauthenticatedRequests: isLocalUnauthenticatedMode,
});
const idempotency = new TeamsIdempotencyStore();
const landOpsClient = createLandOpsClient(process.env.LANDOPS_API_URL ?? "http://127.0.0.1:5006");

app.on("message", async ({ send, activity }) => {
  const normalized = activity as unknown as TeamsActivity;
  const mapped = toWorkroomRequest(normalized, {
    // Keep the Teams demo aligned with the API's canonical Business Agent
    // review seed. The well number belongs in evidence records, not as a
    // second case ID.
    caseId: process.env.LANDOPS_TEAMS_CASE_ID ?? "synthetic-blue-ridge-lease-001",
    scenarioId: process.env.LANDOPS_TEAMS_SCENARIO_ID ?? "land-ownership-gaps",
    roleId: process.env.LANDOPS_TEAMS_ROLE_ID ?? "land-analyst",
    requiredGroup: process.env.LANDOPS_TEAMS_GROUP ?? "case-management",
  });
  console.info(`[teams] received message activity ${mapped.activityId} (${mapped.channel})`);
  if (idempotency.has(mapped.activityId)) return;
  idempotency.remember(mapped.activityId);
  try {
    await send({ type: "typing" });
    const action = parseWorkroomAction(mapped.request.question);
    if (action) {
      const result = await landOpsClient.recordAction(action, { tenantId: mapped.tenantId, userId: mapped.userId });
      await send(formatWorkroomActionReply(result).text);
      return;
    }
    await send("_Business Agent is reviewing the evidence and coordinating the agent path…_");
    const response = await landOpsClient.createWorkroom(mapped.request, { tenantId: mapped.tenantId, userId: mapped.userId });
    const packet = await landOpsClient.runWorkroom(response.threadId, { tenantId: mapped.tenantId, userId: mapped.userId });
    await send(formatTeamsReply(response, packet).text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown adapter failure";
    console.error(`[teams] Business Agent request failed: ${message}`);
    await send("Business Agent could not complete this review. The request was not completed; please retry after the service recovers.");
  }
});

const port = Number(process.env.TEAMS_PORT ?? 3978);
app.start(port).catch((error: unknown) => {
  console.error("Failed to start the LandOps Teams adapter", error);
  process.exitCode = 1;
});
