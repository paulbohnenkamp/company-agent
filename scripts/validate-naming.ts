/** Checks presentation consistency without changing routing IDs or business rules. */
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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

const agentRoot = "domains/land-administration/agents";
for (const file of (await readdir(agentRoot)).filter((name) => name.endsWith(".agent.yaml"))) {
  const document: unknown = parse(await readFile(`${agentRoot}/${file}`, "utf8"));
  assert.ok(document && typeof document === "object" && "name" in document && "displayName" in document);
  assert.ok(typeof document.name === "string" && typeof document.displayName === "string");
  assert.ok(document.displayName.endsWith(" Agent"), `${file}: missing Agent suffix`);
  if (agents.has(document.name)) assert.equal(document.displayName, agents.get(document.name), `${file}: catalog label drift`);
}

const catalog = JSON.parse(await readFile("config/identity/personas.json", "utf8"));
assert.equal(catalog.emailDomain, "sampleenergy.example");
for (const person of catalog.personas) {
  assert.match(person.displayName, /^[A-Za-z]+ [A-Za-z]+ \([A-Za-z ]+\)$/);
  assert.doesNotMatch(person.displayName, / Agent\b/);
}
for (const obsoletePath of ["src/landops", "src/business-agent", "src/teams", "teams-app", "teams.Dockerfile", "src/teams/landops-adapter.ts", "src/teams/landops-client.ts"]) {
  await access(obsoletePath).then(() => { throw new Error(`Obsolete active path remains: ${obsoletePath}`); }).catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  });
}
console.log(`Verified ${agents.size} agent labels, ${catalog.personas.length} people, and Copilot Studio naming boundaries.`);
