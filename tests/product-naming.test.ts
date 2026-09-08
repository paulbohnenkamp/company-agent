import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { TeamsCollaborationView } from "../src/landops/TeamsCollaborationView";
import { PeopleDirectory } from "../src/landops/PeopleDirectory";
import personas from "../config/identity/personas.json";

test("rendered Teams example identifies people and agent contributions without claiming activation", () => {
  const html = renderToStaticMarkup(createElement(TeamsCollaborationView));
  for (const label of ["Business Agent", "Sample Energy Company", "Taylor Kim (Legal)", "Jordan Lee (Land)", "Ownership Agent", "Title Review Agent", "Case Synthesis Agent", "General", "Land", "Legal", "Compliance", "Accounting", "Operations", "Illustrated example"]) assert.ok(html.includes(label), label);
  assert.doesNotMatch(html, /LandOps|Workroom|Blue Ridge|Entra protected|Fictional Energy/);
});

test("people directory renders short names and reserved example email addresses", () => {
  const html = renderToStaticMarkup(createElement(PeopleDirectory, { catalog: personas }));
  for (const name of ["Taylor Kim (Legal)", "Jordan Lee (Land)", "Casey Morgan (Compliance)", "taylor.kim", "jordan.lee", "sampleenergy.example"]) assert.ok(html.includes(name), name);
  assert.doesNotMatch(html, /legal\.demo|land\.demo|blueridge|onmicrosoft/);
});

test("persona dry-run uses dotted aliases and never prints a configured password", () => {
  const password = "sentinel-password-must-not-print";
  const output = execFileSync(process.execPath, ["--import", "tsx", "scripts/provision-entra-personas.ts"], { encoding: "utf8", env: { ...process.env, LANDOPS_TEMP_PASSWORD: password } });
  assert.ok(output.includes("taylor.kim@sampleenergy.example"));
  assert.ok(output.includes("Taylor Kim (Legal)"));
  assert.ok(!output.includes(password));
});

test("legacy HTTP identifiers remain transport contracts while product copy is current", async () => {
  const client = await readFile("src/teams/landops-client.ts", "utf8");
  assert.ok(client.includes("/api/v1/workroom/threads"));
  const naming = await readFile("docs/product-naming.md", "utf8");
  assert.match(naming, /Microsoft Teams is where people collaborate/);
});
