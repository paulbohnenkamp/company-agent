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
  httpServerAdapter: httpAdapter,
  dangerouslyAllowUnauthenticatedRequests: isLocalUnauthenticatedMode,
});
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
