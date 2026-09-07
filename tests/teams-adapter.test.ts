import assert from "node:assert/strict";
import test from "node:test";
import { formatTeamsReply, formatWorkroomActionReply, parseWorkroomAction, stripAgentMention, toWorkroomRequest, TeamsIdempotencyStore } from "../src/teams/landops-adapter";

test("strips only the LandOps bot mention", () => {
  assert.equal(stripAgentMention("<at>LandOps</at> review this", [{ type: "mention", text: "<at>LandOps</at>", mentioned: { id: "bot-1" } }], "bot-1"), "review this");
  assert.equal(stripAgentMention("<at>Alex</at> and <at>LandOps</at>", [{ type: "mention", text: "<at>Alex</at>", mentioned: { id: "user-1" } }, { type: "mention", text: "<at>LandOps</at>", mentioned: { id: "bot-1" } }], "bot-1"), "<at>Alex</at> and");
});

test("maps a channel message into a bounded Workroom request", () => {
  const mapped = toWorkroomRequest({ id: "activity-1", text: "<at>LandOps</at> check ownership", recipientId: "bot-1", entities: [{ type: "mention", text: "<at>LandOps</at>", mentioned: { id: "bot-1" } }], from: { id: "alex" }, channelData: { tenant: { id: "tenant-1" } }, conversation: { id: "conversation-1", conversationType: "channel" } }, { caseId: "case-1", scenarioId: "land-ownership-gaps", roleId: "land-analyst", requiredGroup: "title-curative-board" });
  assert.equal(mapped.channel, "channel");
  assert.equal(mapped.tenantId, "tenant-1");
  assert.equal(mapped.request.question, "check ownership");
  assert.equal(mapped.request.requestedBy, "alex");
});

test("suppresses duplicate activity IDs", () => {
  const store = new TeamsIdempotencyStore();
  assert.equal(store.has("a"), false);
  store.remember("a");
  assert.equal(store.has("a"), true);
});

test("formats the human boundary and delegation path", () => {
  const reply = formatTeamsReply({ threadId: "thread-1", status: "Ready", humanBoundary: "Human review required", steps: [{ agentId: "ownership-reviewer", kind: "requested", order: 1 }, { agentId: "title-chain-reviewer", kind: "delegated", order: 2, delegatedFrom: "ownership-reviewer" }] });
  assert.match(reply.text, /ownership-reviewer → title-chain-reviewer/);
  assert.match(reply.text, /Human review required/);
});

test("formats a bounded evidence-linked review for Teams", () => {
  const reply = formatTeamsReply(
    { threadId: "thread-1", status: "planned", humanBoundary: "Human review required", steps: [{ agentId: "ownership-reviewer", kind: "requested", order: 1 }] },
    { recordIds: ["record-1"], findings: [{ recordId: "record-1", subject: "ownership", assertion: "The ownership package is incomplete.", status: "inconclusive", confidence: "medium" }], unknowns: ["Missing recorded conveyance"], proposedRoute: "human-review", humanBoundary: "A person must approve title or payment actions." },
    "http://localhost:3000",
  );
  assert.match(reply.text, /Findings: 1 · Sources: 1 · Unknowns: 1/);
  assert.match(reply.text, /ownership: The ownership package is incomplete\./);
  assert.match(reply.text, /Review packet: http:\/\/localhost:3000\/teams\?threadId=thread-1/);
});

test("parses explicit human workroom actions", () => {
  assert.deepEqual(parseWorkroomAction("request evidence thread-1 because the recorded conveyance is missing"), {
    threadId: "thread-1",
    action: "request-evidence",
    reason: "the recorded conveyance is missing",
  });
  assert.deepEqual(parseWorkroomAction("assign thread-1 to land-analyst because Land should request the document"), {
    threadId: "thread-1",
    action: "assign-task",
    assignee: "land-analyst",
    reason: "Land should request the document",
  });
  assert.equal(parseWorkroomAction("what is the status?"), undefined);
  assert.match(formatWorkroomActionReply({ action: "request-evidence", actorId: "legal-1", reason: "Need the missing conveyance" }).text, /LandOps recorded request-evidence/);
});
