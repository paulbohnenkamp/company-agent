import assert from "node:assert/strict";
import { test } from "node:test";
import { mapRun } from "../src/landops/adapter";

test("LandOps adapter maps structured C# run JSON", () => {
  const result = mapRun({
    runId: "run-1",
    steps: [{ agentId: "land-case-intake", order: 1, status: "succeeded", artifactJson: "{}" }],
    findings: [{ id: "finding-1", subject: "well identity", assertion: "supported", status: "supported", confidence: "high", evidenceIdsJson: '["evidence-1"]', conflictIdsJson: "[]", unknownIdsJson: "[]", provenanceJson: '{"stepId":"land-well-reconciler","producerVersion":"test"}' }],
    conflicts: [],
    unknowns: [],
    synthesis: { summary: "Review the evidence.", proposedRoute: "human-review" },
  });

  assert.equal(result.runId, "run-1");
  assert.equal(result.result.findings[0]?.evidenceIds[0], "evidence-1");
  assert.equal(result.result.synthesis?.proposedRoute, "human-review");
});

test("LandOps adapter rejects malformed structured JSON", () => {
  assert.throws(() => mapRun({
    runId: "run-1",
    steps: [],
    findings: [{ id: "finding-1", subject: "well identity", assertion: "supported", status: "supported", confidence: "high", evidenceIdsJson: "not-json", conflictIdsJson: "[]", unknownIdsJson: "[]", provenanceJson: "{}" }],
    conflicts: [],
    unknowns: [],
  }), /invalid finding evidence references/);
});
