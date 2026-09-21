import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createDeploymentPlan, createDeploymentState, formatPlanSummary, loadProductConfiguration } from "./company-agent-config.js";

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const catalogPath = option("--catalog") ?? "copilot-studio/company-agent/catalog.yaml";
const environmentKey = option("--env") ?? "companyagent-dev";
const configuration = await loadProductConfiguration({ catalogPath });
const plan = createDeploymentPlan(configuration, environmentKey);
const state = createDeploymentState(plan);
const outputDirectory = join(".azure", environmentKey, "company-agent", "configuration");
await mkdir(outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, "plan.json"), `${JSON.stringify(plan, null, 2)}\n`, "utf8");
await writeFile(join(outputDirectory, "state.json"), `${JSON.stringify(state, null, 2)}\n`, "utf8");
console.log(formatPlanSummary(plan));
console.log(`Wrote local plan and state to ${outputDirectory}; no provider was contacted.`);
