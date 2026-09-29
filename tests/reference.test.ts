import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  normalizeRequest,
  serviceRequestIdFromSharePointItemId,
} from "../it-request-workflow/src/normalize.js";

test("normalizes an IT request without changing controlled values", () => {
  assert.deepEqual(normalizeRequest({
    employeeName: "  Alex Morgan ",
    requestType: "Access",
    description: "  Need portal access. ",
    isUrgent: true,
  }), {
    employeeName: "Alex Morgan",
    requestType: "Access",
    description: "Need portal access.",
    isUrgent: true,
  });
});

test("rejects incomplete agent-flow input", () => {
  assert.throws(() => normalizeRequest({
    employeeName: "   ",
    requestType: "Access",
    description: "Need portal access.",
    isUrgent: false,
  }), /employeeName is required/);
});

test("keeps the SharePoint ID convention deterministic", () => {
  assert.equal(serviceRequestIdFromSharePointItemId(4), "SR-004");
  assert.throws(() => serviceRequestIdFromSharePointItemId(0), /positive integer/);
});

test("describes the separate Copilot Studio Agent flow contract", () => {
  const contract = JSON.parse(readFileSync("it-request-workflow/agent-flow.contract.json", "utf8"));
  assert.deepEqual(Object.keys(contract.trigger.inputs), ["employeeName", "requestType", "description", "isUrgent"]);
  assert.equal(contract.resourcePolicy.doNotModifyFormsFlow, true);
  assert.equal(contract.verification.tenantStatus, "not-verified");
});
