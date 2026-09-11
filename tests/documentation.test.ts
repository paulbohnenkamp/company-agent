import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

test("README and documentation map expose the Copilot Studio Teams path", async () => {
  const readme = await readFile("README.md", "utf8");
  const repositoryGuide = await readFile("docs/repository-guide.md", "utf8");
  const map = await readFile("docs/README.md", "utf8");
  for (const required of ["Microsoft Teams", "Company Agent", "Land Agent"]) assert.match(readme, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const required of ["Microsoft Teams", "Copilot Studio", "dotnet/LandOps.Api", "API tools"]) assert.match(repositoryGuide, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const required of ["PROJECT_STATE.md", "teams-architecture.md", "teams-development.md", "azure-recreation.md", "teams-live-activation.md"]) assert.match(map, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  await access("docs/copilot-studio-integration.md");
});
