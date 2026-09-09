import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

test("README and documentation map expose the Teams-first path", async () => {
  const readme = await readFile("README.md", "utf8");
  const map = await readFile("docs/README.md", "utf8");
  for (const required of ["Microsoft Teams", "dotnet/LandOps.Api", "npm run teams:dev", "teams-app/manifest.template.json"]) assert.match(readme, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const required of ["PROJECT_STATE.md", "teams-architecture.md", "teams-development.md", "azure-recreation.md", "teams-live-activation.md"]) assert.match(map, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  await access("src/teams/server.ts");
});
