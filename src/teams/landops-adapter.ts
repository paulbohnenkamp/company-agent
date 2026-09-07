/**
 * Transport-neutral Microsoft Teams adapter for LandOps Workbench.
 *
 * This module deliberately contains no land rules. It translates a Teams
 * activity into the existing Workroom API contract and formats the bounded
 * result for a human conversation.
 */

export type TeamsChannel = "personal" | "groupChat" | "channel";

export type TeamsActivity = {
  id?: string;
  text?: string;
  timestamp?: string;
  recipientId?: string;
  entities?: unknown;
  from?: { id?: string };
  channelData?: { tenant?: { id?: string } };
  conversation?: { id?: string; conversationType?: string };
};

export type LandOpsWorkroomRequest = {
  caseId: string;
  scenarioId: string;
  question: string;
  requestedBy: string;
  roleId: string;
  groups: string[];
  threadMessages: { messageId: string; authorRole: string; content: string }[];
};

export type LandOpsWorkroomResponse = {
  threadId: string;
  status: string;
  humanBoundary: string;
  steps: { agentId: string; kind: string; order: number; delegatedFrom?: string | null }[];
};

export type WorkroomReviewPacket = {
  threadId?: string;
  caseId?: string;
  scenarioId?: string;
  question?: string;
  recordIds: string[];
  findings: { recordId: string; subject: string; assertion: string; status: string; confidence: string }[];
  unknowns: string[];
  proposedRoute: string;
  humanBoundary?: string;
};

export type LandOpsClient = {
  createWorkroom(request: LandOpsWorkroomRequest, identity: { tenantId: string; userId: string }): Promise<LandOpsWorkroomResponse>;
  runWorkroom(threadId: string, identity: { tenantId: string; userId: string }): Promise<WorkroomReviewPacket>;
  recordAction(request: WorkroomActionRequest, identity: { tenantId: string; userId: string }): Promise<{ action: string; actorId: string; assignee?: string; reason: string }>;
};

export type TeamsReply = { text: string };
export type WorkroomActionRequest = { threadId: string; action: "approve-next-step" | "request-evidence" | "reject-recommendation" | "assign-task"; reason: string; assignee?: string };

/** Maps Bot Framework conversation metadata to the three supported Teams scopes. */
export function conversationChannel(value: string | undefined): TeamsChannel {
  if (value === "channel") return "channel";
  if (value === "groupChat") return "groupChat";
  return "personal";
}

/** Removes only mentions that target this bot, leaving other mentions intact. */
export function stripAgentMention(text: string | undefined, entities: unknown, recipientId = ""): string {
  let instruction = text ?? "";
  if (!Array.isArray(entities)) return instruction.trim();
  for (const entity of entities as Array<{ type?: string; text?: string; mentioned?: { id?: string } }>) {
    if (entity.type !== "mention") continue;
    if (recipientId && entity.mentioned?.id && entity.mentioned.id !== recipientId) continue;
    if (entity.text) instruction = instruction.replace(entity.text, "");
  }
  return instruction.trim();
}

/** Records activity IDs for the lifetime of one adapter replica. */
export class TeamsIdempotencyStore {
  private readonly seen = new Set<string>();

  has(activityId: string): boolean { return this.seen.has(activityId); }
  remember(activityId: string): void { this.seen.add(activityId); }
}

/** Converts a Teams activity into the bounded LandOps request contract. */
export function toWorkroomRequest(activity: TeamsActivity, options: { caseId: string; scenarioId: string; roleId: string; requiredGroup: string }): { activityId: string; tenantId: string; userId: string; channel: TeamsChannel; request: LandOpsWorkroomRequest } {
  const activityId = String(activity.id ?? `${activity.timestamp ?? Date.now()}:${activity.text ?? ""}`);
  const tenantId = String(activity.channelData?.tenant?.id ?? "unknown-tenant");
  const userId = String(activity.from?.id ?? "unknown-user");
  const channel = conversationChannel(activity.conversation?.conversationType);
  const question = stripAgentMention(activity.text, activity.entities, String(activity.recipientId ?? ""));
  return {
    activityId,
    tenantId,
    userId,
    channel,
    request: {
      caseId: options.caseId,
      scenarioId: options.scenarioId,
      question: question || "Please review this case.",
      requestedBy: userId,
      roleId: options.roleId,
      groups: [options.requiredGroup],
      threadMessages: [{ messageId: activityId, authorRole: roleIdForChannel(channel), content: question || "Please review this case." }],
    },
  };
}

/** Formats a Workroom result for a concise, safe Teams message. */
export function formatTeamsReply(response: LandOpsWorkroomResponse, packet?: WorkroomReviewPacket, webBaseUrl = ""): TeamsReply {
  const path = response.steps.map((step) => step.agentId).join(" → ");
  const lines = [
    `LandOps workroom ${packet ? "completed" : response.status.toLowerCase()}.`,
    `Agents: ${path}`,
    packet ? `Findings: ${packet.findings.length} · Sources: ${packet.recordIds.length} · Unknowns: ${packet.unknowns.length}` : `Thread: ${response.threadId}`,
  ];
  if (packet?.findings.length) {
    lines.push(...packet.findings.slice(0, 3).map((finding) => `- ${finding.subject}: ${finding.assertion}`));
  }
  if (packet?.unknowns.length) lines.push(`Open questions: ${packet.unknowns.slice(0, 3).join("; ")}`);
  lines.push(`Recommendation: ${packet?.proposedRoute ?? "human review required"}.`);
  lines.push(`Human boundary: ${packet?.humanBoundary ?? response.humanBoundary}`);
  if (webBaseUrl.trim()) lines.push(`Review packet: ${webBaseUrl.replace(/\/$/, "")}/teams?threadId=${encodeURIComponent(response.threadId)}`);
  return { text: lines.join("\n") };
}

function roleIdForChannel(channel: TeamsChannel): string {
  return channel === "channel" ? "teams-channel-requester" : channel === "groupChat" ? "teams-group-requester" : "teams-user";
}

/** Parses explicit, auditable action commands used by the local adapter. */
export function parseWorkroomAction(text: string | undefined): WorkroomActionRequest | undefined {
  const value = text?.trim() ?? "";
  const match = value.match(/^(approve|reject|request evidence|assign)\s+([a-z0-9-]+)(?:\s+to\s+([a-z0-9-]+))?(?:\s+because\s+(.+))?$/i);
  if (!match) return undefined;
  const action = match[1].toLowerCase() === "approve" ? "approve-next-step" : match[1].toLowerCase() === "reject" ? "reject-recommendation" : match[1].toLowerCase() === "request evidence" ? "request-evidence" : "assign-task";
  return { threadId: match[2], action, ...(match[3] ? { assignee: match[3] } : {}), reason: match[4]?.trim() || "Action requested from the Teams workroom." };
}

export function formatWorkroomActionReply(action: { action: string; actorId: string; assignee?: string; reason: string }): TeamsReply {
  const assignment = action.assignee ? ` Assigned to ${action.assignee}.` : "";
  return { text: `LandOps recorded ${action.action}.${assignment}\nActor: ${action.actorId}\nReason: ${action.reason}` };
}
