import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import personas from "../config/identity/personas.json";

test("identity catalog uses current product and fictional organization names", () => {
  const values = JSON.stringify(personas);
  for (const name of ["Taylor Kim (Legal)", "Jordan Lee (Land)", "Casey Morgan (Compliance)", "sampleenergy.example"]) assert.ok(values.includes(name), name);
  assert.doesNotMatch(values, /legal\.demo|land\.demo|blueridge|onmicrosoft/);
});

test("persona dry-run uses dotted aliases and never prints a configured password", () => {
  const password = "sentinel-password-must-not-print";
  const output = execFileSync(process.execPath, ["--import", "tsx", "scripts/provision-entra-personas.ts"], { encoding: "utf8", env: { ...process.env, LANDOPS_TEMP_PASSWORD: password } });
  assert.ok(output.includes("taylor.kim@sampleenergy.example"));
  assert.ok(output.includes("Taylor Kim (Legal)"));
  assert.ok(!output.includes(password));
});

test("legacy HTTP identifiers remain transport contracts while product copy is current", async () => {
  const client = await readFile("src/teams/business-agent-client.ts", "utf8");
  assert.ok(client.includes("/api/v1/workroom/threads"));
  const naming = await readFile("docs/product-naming.md", "utf8");
  assert.match(naming, /Microsoft Teams is where people collaborate/);
});
