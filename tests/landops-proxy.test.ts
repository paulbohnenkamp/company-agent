import assert from "node:assert/strict";
import { test } from "node:test";
import { upstreamHeaders } from "../src/landops/proxy";

test("LandOps proxy forwards the caller bearer token and JSON content type", () => {
  const request = new Request("http://localhost/api/landops/workroom", {
    headers: { authorization: "Bearer example-token" },
  });

  const headers = upstreamHeaders(request, true);

  assert.equal(headers.get("authorization"), "Bearer example-token");
  assert.equal(headers.get("content-type"), "application/json");
});

test("LandOps proxy does not invent an identity header", () => {
  const request = new Request("http://localhost/api/landops/workroom");

  assert.equal(upstreamHeaders(request).get("authorization"), null);
});
