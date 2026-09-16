/** Checks presentation consistency without changing routing IDs or business rules. */
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { parse } from "yaml";

const portfolio = await readFile("dotnet/LandOps.Application/CompanyPortfolio.cs", "utf8");
assert.match(portfolio, /"Sample Energy Company"/);
const agentsSection = portfolio.slice(portfolio.indexOf('new("land-case-intake"'), portfolio.indexOf('new("wv-land-well-reconciliation"'));
const agents = new Map([...agentsSection.matchAll(/new\("([^"]+)", "([^"]+)"/g)].map((match) => [match[1], match[2]]));
assert.ok(agents.size > 0, "Company agent catalog must be discoverable");
assert.equal(new Set(agents.values()).size, agents.size, "Agent labels must be distinct");
for (const label of agents.values()) {
  assert.ok(label.endsWith(" Agent"), `Agent label needs its Agent suffix: ${label}`);
  assert.ok(label.length <= 26, `Keep agent labels short: ${label}`);
}

const catalog = JSON.parse(await readFile("config/identity/personas.json", "utf8"));
assert.equal(catalog.emailDomain, "sampleenergy.example");
for (const person of catalog.personas) {
  assert.match(person.displayName, /^[A-Za-z]+ [A-Za-z]+ \([A-Za-z ]+\)$/);
  assert.doesNotMatch(person.displayName, / Agent\b/);
}
for (const obsoletePath of ["teams-app", "teams.Dockerfile"]) {
  await access(obsoletePath).then(() => { throw new Error(`Obsolete active path remains: ${obsoletePath}`); }).catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  });
}
console.log(`Verified ${agents.size} compatibility agent labels, ${catalog.personas.length} people, and Copilot Studio naming boundaries.`);
