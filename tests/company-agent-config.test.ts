import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { ConfigurationError, createCleanupPlan, createDefaultEnvironmentBinding, createDeploymentPlan, createDeploymentState, createLifecyclePlan, createRollbackPlan, loadProductConfiguration } from "../scripts/company-agent-config.js";
import { buildReleaseCommandPlan, executePacCommand, type PacCommand, type PacRunner } from "../scripts/power-platform-adapter.js";

const catalogPath = "copilot-studio/company-agent/catalog.yaml";

async function writeMultiResourceFixture(directory: string, catalog: string): Promise<string> {
  await mkdir(join(directory, "department", "skills", "capability"), { recursive: true });
  await mkdir(join(directory, "impl", "r1"), { recursive: true });
  await mkdir(join(directory, "impl", "r2"), { recursive: true });
  await mkdir(join(directory, "contracts"), { recursive: true });
  await writeFile(join(directory, "department", "catalog.yaml"), "id: department\nversion: 1.0.0\nskills:\n  - id: capability\n    file: skills/capability/SKILL.md\nflows: []\n", "utf8");
  await writeFile(join(directory, "department", "skills", "capability", "SKILL.md"), "---\nname: capability\ndescription: test\nversion: 1.0.0\n---\n", "utf8");
  await writeFile(join(directory, "contracts", "c1.yaml"), "schemaVersion: 1\noperations:\n  operation1:\n    request: Request\n    response: Response\n", "utf8");
  await writeFile(join(directory, "contracts", "c2.yaml"), "schemaVersion: 1\noperations:\n  operation2:\n    request: Request\n    response: Response\n", "utf8");
  const catalogFile = join(directory, "catalog.yaml");
  await writeFile(catalogFile, catalog, "utf8");
  return catalogFile;
}

test("loads the product catalog and shares one resource across HR and Land", async () => {
  const configuration = await loadProductConfiguration({ catalogPath });
  assert.equal(configuration.catalog.product.key, "company-agent");
  assert.equal(configuration.graph.resourceReferenceCounts.companyAgentApi, 2);
  assert.deepEqual(configuration.graph.solutionOrder, ["company-agent-resources", "company-agent-agents"]);
  assert.equal(configuration.graph.nodes.filter((node) => node.id === "resource:companyAgentApi").length, 1);
});

test("creates a deterministic no-mutation plan and state", async () => {
  const configuration = await loadProductConfiguration({ catalogPath });
  const first = createDeploymentPlan(configuration, "companyagent-dev");
  const second = createDeploymentPlan(configuration, "companyagent-dev");
  assert.deepEqual(first, second);
  assert.ok(first.actions.every((action) => action.mutation === "none"));
  assert.equal(createDeploymentState(first).phase, "planned");
  assert.deepEqual(createDeploymentState(first).observed, {});
});

test("rejects a solution cycle", async () => {
  const directory = await mkdtemp(join(tmpdir(), "company-agent-config-"));
  try {
    const path = join(directory, "catalog.yaml");
    await writeFile(path, `schemaVersion: 1\nproduct:\n  key: test\n  version: 1.0.0\n  displayName: Test\n  rootAgent: root\npackages: {}\nagents:\n  root:\n    source: .\ncontracts: {}\nresources: {}\noperations: {}\nsolutions:\n  a:\n    key: a\n    kind: resource\n    dependsOn: [b]\n  b:\n    key: b\n    kind: agent\n    dependsOn: [a]\n`, "utf8");
    await assert.rejects(() => loadProductConfiguration({ catalogPath: path, repositoryRoot: directory }), (error: unknown) => error instanceof ConfigurationError && error.issues.some((entry) => entry.code === "solution-cycle"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("changes the desired-state hash when the environment changes", async () => {
  const configuration = await loadProductConfiguration({ catalogPath });
  const dev = createDeploymentPlan(configuration, "dev");
  const testEnvironment = createDeploymentPlan(configuration, "test");
  assert.notEqual(dev.desiredStateHash, testEnvironment.desiredStateHash);
});

test("plan output contains no credential-shaped fields", async () => {
  const configuration = await loadProductConfiguration({ catalogPath });
  const plan = createDeploymentPlan(configuration, "companyagent-dev");
  const serialized = await readFile(catalogPath, "utf8");
  assert.doesNotMatch(serialized, /clientSecret|password|accessToken|privateKey/i);
  assert.doesNotMatch(JSON.stringify(plan), /clientSecret|password|accessToken|privateKey/i);
});

test("supports one department consuming multiple resources", async () => {
  const directory = await mkdtemp(join(tmpdir(), "company-agent-config-"));
  try {
    const path = await writeMultiResourceFixture(directory, `schemaVersion: 1
product:
  key: test
  version: 1.0.0
  displayName: Test
  rootAgent: root
packages:
  department:
    path: department
agents:
  root:
    source: .
contracts:
  c1:
    version: 1.0.0
    source: contracts/c1.yaml
  c2:
    version: 1.0.0
    source: contracts/c2.yaml
resources:
  r1:
    contract: c1
    implementation:
      kind: product-managed
      source: impl/r1
  r2:
    contract: c2
    implementation:
      kind: customer-supplied
      source: impl/r2
operations:
  operation1:
    package: department
    capability: capability
    resource: r1
    contractOperation: operation1
  operation2:
    package: department
    capability: capability
    resource: r2
    contractOperation: operation2
solutions:
  resources:
    key: resources
    kind: resource
  agents:
    key: agents
    kind: agent
    dependsOn: [resources]
`);
    const configuration = await loadProductConfiguration({ catalogPath: path, repositoryRoot: directory });
    assert.deepEqual(configuration.graph.resourceReferenceCounts, { r1: 1, r2: 1 });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("reports path escapes, contract mismatches, and secret-shaped configuration", async () => {
  const directory = await mkdtemp(join(tmpdir(), "company-agent-config-"));
  try {
    const path = await writeMultiResourceFixture(directory, `schemaVersion: 1
product:
  key: test
  version: 1.0.0
  displayName: Test
  rootAgent: root
clientSecret: forbidden
packages:
  department:
    path: ../outside
agents:
  root:
    source: .
contracts: {}
resources: {}
operations: {}
solutions: {}
`);
    await assert.rejects(() => loadProductConfiguration({ catalogPath: path, repositoryRoot: directory }), (error: unknown) => error instanceof ConfigurationError && error.issues.some((entry) => entry.code === "secret-shaped-value"));
    await writeFile(path, `schemaVersion: 1
product:
  key: test
  version: 1.0.0
  displayName: Test
  rootAgent: root
packages:
  department:
    path: ../outside
agents:
  root:
    source: .
contracts: {}
resources: {}
operations: {}
solutions: {}
`, "utf8");
    await assert.rejects(() => loadProductConfiguration({ catalogPath: path, repositoryRoot: directory }), (error: unknown) => error instanceof ConfigurationError && error.issues.some((entry) => entry.code === "path-escape"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }

  const mismatchDirectory = await mkdtemp(join(tmpdir(), "company-agent-config-"));
  try {
    const path = await writeMultiResourceFixture(mismatchDirectory, `schemaVersion: 1
product:
  key: test
  version: 1.0.0
  displayName: Test
  rootAgent: root
packages:
  department:
    path: department
agents:
  root:
    source: .
contracts:
  c1:
    version: 1.0.0
    source: contracts/c1.yaml
resources:
  r1:
    contract: c1
    implementation:
      kind: product-managed
      source: impl/r1
operations:
  operation1:
    package: department
    capability: capability
    resource: r1
    contractOperation: missing
solutions: {}
`);
    await assert.rejects(() => loadProductConfiguration({ catalogPath: path, repositoryRoot: mismatchDirectory }), (error: unknown) => error instanceof ConfigurationError && error.issues.some((entry) => entry.code === "missing-contract-operation"));
  } finally {
    await rm(mismatchDirectory, { recursive: true, force: true });
  }
});

test("rejects duplicate YAML keys at the parsing boundary", async () => {
  const directory = await mkdtemp(join(tmpdir(), "company-agent-config-"));
  try {
    const path = join(directory, "catalog.yaml");
    await writeFile(path, "schemaVersion: 1\nschemaVersion: 1\n", "utf8");
    await assert.rejects(() => loadProductConfiguration({ catalogPath: path, repositoryRoot: directory }), (error: unknown) => error instanceof ConfigurationError && error.issues.some((entry) => entry.code === "yaml-parse"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("builds distinct bootstrap and release lifecycle plans without mutation", async () => {
  const configuration = await loadProductConfiguration({ catalogPath });
  const environmentBinding = createDefaultEnvironmentBinding(configuration, "companyagent-dev");
  const bootstrap = createLifecyclePlan({ configuration, environmentBinding, mode: "bootstrap" });
  const release = createLifecyclePlan({ configuration, environmentBinding, mode: "release" });
  assert.equal(bootstrap.mode, "bootstrap");
  assert.equal(release.mode, "release");
  assert.notDeepEqual(bootstrap.actions[0], release.actions[0]);
  assert.ok(release.actions.every((action) => action.mutation === "none"));
  assert.ok(release.actions.some((action) => action.id === "solution-import:company-agent-agents" && action.dependsOn.includes("solution-import:company-agent-resources")));
  assert.deepEqual(createCleanupPlan(configuration), []);
});

test("creates a rollback selection without changing the current plan", async () => {
  const configuration = await loadProductConfiguration({ catalogPath });
  const plan = createDeploymentPlan(configuration, "companyagent-dev");
  const target = `sha256:${"a".repeat(64)}`;
  const action = createRollbackPlan(plan, target);
  assert.equal(action.kind, "rollback-selection");
  assert.equal(action.mutation, "none");
  assert.equal(plan.planHash.startsWith("sha256:"), true);
});

test("builds ordered PAC commands with an explicit mutation boundary", () => {
  const commands = buildReleaseCommandPlan({
    resourceSolutionFolder: "resources",
    resourceSolutionZip: "resources.zip",
    agentSolutionFolder: "agents",
    agentSolutionZip: "agents.zip",
    resourceSettingsFile: "resource-settings.json",
    agentSettingsFile: "agent-settings.json",
    environment: "environment-id",
  });
  const resourceImport = commands.find((entry) => entry.id === "import:resources");
  const agentImport = commands.find((entry) => entry.id === "import:agents");
  assert.equal(resourceImport?.mutation, "requires-apply");
  assert.ok(agentImport?.dependsOn.includes("import:resources"));
  assert.ok(commands.find((entry) => entry.id === "pack:resources")?.args.includes("resources.zip"));
});

test("prevents mutation commands from reaching the PAC runner without apply", async () => {
  const calls: PacCommand[] = [];
  const runner: PacRunner = { run: async (command) => { calls.push(command); return { exitCode: 0, stdout: "", stderr: "" }; } };
  const command: PacCommand = { id: "import:test", kind: "import", args: ["solution", "import"], mutation: "requires-apply", dependsOn: [] };
  await assert.rejects(() => executePacCommand({ command, runner, apply: false }), /requires --apply/);
  assert.deepEqual(calls, []);
  await executePacCommand({ command, runner, apply: true });
  assert.deepEqual(calls.map((entry) => entry.id), ["import:test"]);
});
