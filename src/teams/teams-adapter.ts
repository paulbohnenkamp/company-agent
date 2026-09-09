/**
 * Transport-neutral Microsoft Teams adapter for Business Agent.
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
  from?: { id?: string; aadObjectId?: string };
  channelData?: { tenant?: { id?: string } };
  conversation?: { id?: string; conversationType?: string };
};

export type BusinessAgentWorkroomRequest = {
  caseId: string;
  scenarioId: string;
  question: string;
  requestedBy: string;
  roleId: string;
  groups: string[];
  threadMessages: { messageId: string; authorRole: string; content: string }[];
  actor: { tenantId: string; userId: string; aadObjectId: string | null };
};

export type BusinessAgentWorkroomResponse = {
  threadId: string;
  status: string;
  humanBoundary: string;
  steps: { agentName?: string; agentId: string; kind: string; order: number; delegatedFrom?: string | null }[];
};

export type WorkroomReviewPacket = {
  threadId?: string;
  caseId?: string;
  scenarioId?: string;
  question?: string;
  recordIds: string[];
  findings: { recordId: string; subject: string; assertion: string; status: string; confidence: string }[];
  unknowns: string[];
  contributions?: { agentId: string; agentName: string; summary: string; recordIds: string[]; unknowns: string[] }[];
  proposedRoute: string;
  humanBoundary?: string;
};

export type BusinessAgentClient = {
  createWorkroom(request: BusinessAgentWorkroomRequest, identity: { tenantId: string; userId: string }): Promise<BusinessAgentWorkroomResponse>;
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
export function toWorkroomRequest(activity: TeamsActivity, options: { caseId: string; scenarioId: string; roleId: string; requiredGroup: string }): { activityId: string; tenantId: string; userId: string; channel: TeamsChannel; request: BusinessAgentWorkroomRequest } {
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
      actor: { tenantId, userId, aadObjectId: activity.from?.aadObjectId ?? null },
    },
  };
}

/** Formats a Workroom result for a concise, safe Teams message. */
export function formatTeamsReply(response: BusinessAgentWorkroomResponse, packet?: WorkroomReviewPacket): TeamsReply {
  const path = response.steps.map((step) => step.agentName ?? "Agent").join(" → ");
  const lines = [
    `**Business Agent review ${packet ? "completed" : response.status.toLowerCase()}**`,
    "",
    `**Agent path:** ${path}`,
  ];
  if (packet?.contributions?.length) {
    lines.push(
      "",
      "**Agent contributions**",
      ...packet.contributions.map((contribution, index) => `${index + 1}. **${contribution.agentName}** — ${contribution.summary}`),
    );
  }
  if (packet) {
    lines.push(
      "",
      ...(packet.question ? ["**Review request:**", packet.question, ""] : []),
      ...(reviewContextFor(packet) ? ["**Matter:**", reviewContextFor(packet)!, ""] : []),
      "**Review summary**",
      `- Findings: ${packet.findings.length}`,
      `- Records reviewed: ${packet.recordIds.length}`,
      "",
      "**Key findings**",
    );
  } else {
    lines.push(`**Thread:** ${response.threadId}`);
  }
  if (packet?.findings.length) {
    lines.push(...packet.findings.map((finding, index) => `${index + 1}. ${humanizeSubject(finding.subject)} — ${humanizeAssertion(finding.assertion)}`));
  }
  lines.push(
    "",
    `**Recommendation:** ${recommendationFor(packet, response)}`,
    `_*Human review required:* ${humanBoundaryFor(packet, response)}_`,
  );
  return { text: lines.join("\n") };
}

function recommendationFor(packet: WorkroomReviewPacket | undefined, response: BusinessAgentWorkroomResponse): string {
  if (packet?.scenarioId === "land-ownership-gaps") {
    return "Have a person decide whether the Harrison South Unit / Tract 14 evidence supports requesting missing title or ownership records before relying on the recorded interest.";
  }
  if (packet?.proposedRoute === "human-review" || !packet) {
    return "Have a person review the evidence before taking a consequential action.";
  }
  return `${packet.proposedRoute}.`;
}

function reviewContextFor(packet: WorkroomReviewPacket): string | undefined {
  if (packet.scenarioId === "land-ownership-gaps") {
    return "Harrison South Unit / Tract 14 — ownership evidence and recorded interest";
  }
  return undefined;
}

function humanBoundaryFor(packet: WorkroomReviewPacket | undefined, response: BusinessAgentWorkroomResponse): string {
  if (packet?.scenarioId === "land-ownership-gaps") {
    return "This review organizes evidence for the ownership question. It does not issue a title opinion, change payment status, or approve development.";
  }
  return packet?.humanBoundary ?? response.humanBoundary;
}

function humanizeSubject(subject: string): string {
  if (subject.toLowerCase() === "ocr") return "OCR";
  return subject
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function humanizeAssertion(assertion: string): string {
  const separator = assertion.indexOf(":");
  if (separator < 1) return assertion;
  const key = assertion.slice(0, separator).replace(/([a-z])([A-Z])/g, "$1 $2");
  return `${key.charAt(0).toUpperCase()}${key.slice(1)}:${assertion.slice(separator + 1)}`;
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
  return { threadId: match[2], action, ...(match[3] ? { assignee: match[3] } : {}), reason: match[4]?.trim() || "Action requested in Teams." };
}

export function formatWorkroomActionReply(action: { action: string; actorId: string; assignee?: string; reason: string }): TeamsReply {
  const assignment = action.assignee ? ` Assigned to ${action.assignee}.` : "";
  return { text: `Business Agent recorded ${action.action}.${assignment}\nActor: ${action.actorId}\nReason: ${action.reason}` };
}
