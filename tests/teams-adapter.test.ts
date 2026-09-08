import assert from "node:assert/strict";
import test from "node:test";
import { formatTeamsReply, formatWorkroomActionReply, parseWorkroomAction, stripAgentMention, toWorkroomRequest, TeamsIdempotencyStore } from "../src/teams/landops-adapter";

test("strips only the Business Agent bot mention", () => {
  assert.equal(stripAgentMention("<at>Business Agent</at> review this", [{ type: "mention", text: "<at>Business Agent</at>", mentioned: { id: "bot-1" } }], "bot-1"), "review this");
  assert.equal(stripAgentMention("<at>Taylor</at> and <at>Business Agent</at>", [{ type: "mention", text: "<at>Taylor</at>", mentioned: { id: "user-1" } }, { type: "mention", text: "<at>Business Agent</at>", mentioned: { id: "bot-1" } }], "bot-1"), "<at>Taylor</at> and");
});

test("maps a channel message into a bounded Workroom request", () => {
  const mapped = toWorkroomRequest({ id: "activity-1", text: "<at>Business Agent</at> check ownership", recipientId: "bot-1", entities: [{ type: "mention", text: "<at>Business Agent</at>", mentioned: { id: "bot-1" } }], from: { id: "taylor", aadObjectId: "aad-taylor" }, channelData: { tenant: { id: "tenant-1" } }, conversation: { id: "conversation-1", conversationType: "channel" } }, { caseId: "case-1", scenarioId: "land-ownership-gaps", roleId: "land-analyst", requiredGroup: "title-curative-board" });
  assert.equal(mapped.channel, "channel");
  assert.equal(mapped.tenantId, "tenant-1");
  assert.equal(mapped.request.question, "check ownership");
  assert.equal(mapped.request.requestedBy, "taylor");
  assert.deepEqual(mapped.request.actor, { tenantId: "tenant-1", userId: "taylor", aadObjectId: "aad-taylor" });
});

test("suppresses duplicate activity IDs", () => {
  const store = new TeamsIdempotencyStore();
  assert.equal(store.has("a"), false);
  store.remember("a");
  assert.equal(store.has("a"), true);
});

test("formats the human boundary and delegation path", () => {
  const reply = formatTeamsReply({ threadId: "thread-1", status: "Ready", humanBoundary: "Human review required", steps: [{ agentId: "ownership-reviewer", agentName: "Ownership Agent", kind: "requested", order: 1 }, { agentId: "title-chain-reviewer", agentName: "Title Review Agent", kind: "delegated", order: 2, delegatedFrom: "ownership-reviewer" }] });
  assert.match(reply.text, /Ownership Agent → Title Review Agent/);
  assert.match(reply.text, /_\*Human review required:\* /);
});

test("formats a bounded evidence-linked review for Teams", () => {
  const reply = formatTeamsReply(
    { threadId: "thread-1", status: "planned", humanBoundary: "Human review required", steps: [{ agentId: "ownership-reviewer", agentName: "Ownership Agent", kind: "requested", order: 1 }] },
    { scenarioId: "land-ownership-gaps", question: "Is the ownership evidence sufficient?", recordIds: ["record-1"], findings: [{ recordId: "record-1", subject: "ownership", assertion: "The ownership package is incomplete.", status: "inconclusive", confidence: "medium" }], unknowns: ["Missing recorded conveyance"], contributions: [{ agentId: "ownership-reviewer", agentName: "Ownership Agent", summary: "Reviewed ownership evidence.", recordIds: ["record-1"], unknowns: ["Missing recorded conveyance"] }], proposedRoute: "human-review", humanBoundary: "A person must approve title or payment actions." },
  );
  assert.match(reply.text, /- Findings: 1/);
  assert.match(reply.text, /- Records reviewed: 1/);
  assert.doesNotMatch(reply.text, /Disclaimers|Open questions/);
  assert.match(reply.text, /Ownership — The ownership package is incomplete\./);
  assert.match(reply.text, /Agent contributions/);
  assert.match(reply.text, /Ownership Agent.*Reviewed ownership evidence/);
  assert.match(reply.text, /Review request/);
  assert.match(reply.text, /Harrison South Unit \/ Tract 14/);
  assert.match(reply.text, /requesting missing title or ownership records/);
  assert.match(reply.text, /Human review required/);
});

test("older API responses remain readable without exposing routing IDs as names", () => {
  const reply = formatTeamsReply({ threadId: "thread-1", status: "planned", humanBoundary: "Human review", steps: [{ agentId: "ownership-reviewer", kind: "requested", order: 1 }] });
  assert.match(reply.text, /Business Agent review planned/);
  assert.match(reply.text, /Agent path:\*\* Agent/);
  assert.doesNotMatch(reply.text, /ownership-reviewer|LandOps|workroom/i);
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
  assert.match(formatWorkroomActionReply({ action: "request-evidence", actorId: "legal-1", reason: "Need the missing conveyance" }).text, /Business Agent recorded request-evidence/);
});
