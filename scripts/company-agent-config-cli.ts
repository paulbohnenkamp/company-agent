import { readFile } from "node:fs/promises";
import { createCleanupPlan, createDefaultEnvironmentBinding, createLifecyclePlan, createRollbackPlan, loadEnvironmentBinding, loadProductConfiguration } from "./company-agent-config.js";
import { buildReleaseCommandPlan, formatPacCommandPlan } from "./power-platform-adapter.js";

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const command = process.argv[2];
const catalogPath = option("--catalog") ?? "copilot-studio/company-agent/catalog.yaml";
const environmentKey = option("--env") ?? "companyagent-dev";
const configuration = await loadProductConfiguration({ catalogPath });

if (command === "validate") {
  console.log(`Validated ${configuration.catalog.product.key}: ${configuration.graph.nodes.length} graph nodes, ${configuration.graph.edges.length} graph edges.`);
} else if (command === "plan") {
  const settingsPath = option("--settings");
  const environmentBinding = settingsPath ? await loadEnvironmentBinding({ path: settingsPath, expectedEnvironmentKey: environmentKey }) : createDefaultEnvironmentBinding(configuration, environmentKey);
  const mode = option("--mode") === "bootstrap" ? "bootstrap" : "release";
  const lifecyclePlan = createLifecyclePlan({ configuration, environmentBinding, mode });
  console.log(JSON.stringify(lifecyclePlan, null, 2));
} else if (command === "status") {
  const statePath = option("--state");
  if (!statePath) throw new Error("status requires --state <path>");
  console.log(await readFile(statePath, "utf8"));
} else if (command === "rollback-plan") {
  const planPath = option("--plan");
  const target = option("--target");
  if (!planPath || !target) throw new Error("rollback-plan requires --plan <path> and --target <plan-hash>");
  const plan: unknown = JSON.parse(await readFile(planPath, "utf8"));
  if (typeof plan !== "object" || plan === null || !("planHash" in plan) || typeof plan.planHash !== "string") throw new Error("plan file does not contain a valid planHash");
  const action = createRollbackPlan({ planHash: plan.planHash }, target);
  console.log(JSON.stringify(action, null, 2));
} else if (command === "cleanup-plan") {
  const actions = createCleanupPlan(configuration);
  console.log(JSON.stringify(actions, null, 2));
} else if (command === "pac-plan") {
  const commands = buildReleaseCommandPlan({
    resourceSolutionFolder: option("--resource-folder") ?? ".azure/companyagent-dev/company-agent/solutions/resources",
    resourceSolutionZip: option("--resource-zip") ?? ".azure/companyagent-dev/company-agent/solutions/resources.zip",
    agentSolutionFolder: option("--agent-folder") ?? ".azure/companyagent-dev/company-agent/solutions/agents",
    agentSolutionZip: option("--agent-zip") ?? ".azure/companyagent-dev/company-agent/solutions/agents.zip",
    resourceSettingsFile: option("--resource-settings") ?? ".azure/companyagent-dev/company-agent/settings/resources.json",
    agentSettingsFile: option("--agent-settings") ?? ".azure/companyagent-dev/company-agent/settings/agents.json",
    environment: option("--environment-url") ?? "${COPILOT_ENVIRONMENT_ID}",
  });
  console.log(formatPacCommandPlan(commands));
} else {
  throw new Error("Usage: company-agent-config <validate|plan|status|rollback-plan|cleanup-plan|pac-plan> [options]");
}
