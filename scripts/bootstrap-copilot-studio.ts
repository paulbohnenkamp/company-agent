/** Guided HR-only bootstrap. Tenant UI checkpoints are intentional. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { readAzdEnvironment } from "./read-azd-environment.js";

const args = process.argv.slice(2);
const value = (name: string): string => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? "" : "";
};
const agentName = value("--agent-name");
const environmentName = value("--environment") || process.env.AZURE_ENV_NAME || "companyagent-dev";
const apply = args.includes("--apply");
const azd = await readAzdEnvironment(environmentName);
const environmentId = process.env.COPILOT_ENVIRONMENT_ID || azd.COPILOT_ENVIRONMENT_ID || "";
const apiUrl = process.env.COMPANY_AGENT_API_URL || azd.COMPANY_AGENT_API_URL || azd.apiUrl || "";
if (!agentName) throw new Error("--agent-name is required.");
if (!environmentId) throw new Error(`Missing COPILOT_ENVIRONMENT_ID for ${environmentName}.`);
if (!apiUrl) throw new Error(`Missing COMPANY_AGENT_API_URL for ${environmentName}.`);
if (!apply) {
  console.log(`mode=bootstrap\nagentName=${agentName}\nenvironment=${environmentName}\n` +
    "No tenant mutation performed. Re-run with --apply after the tenant cleanup is complete.");
  process.exit(0);
}
if (process.env.COPILOT_PUSH_APPROVED !== "true") throw new Error("Set COPILOT_PUSH_APPROVED=true for bootstrap tenant mutations.");

const root = join(".azure", environmentName, "hr-bootstrap");
await mkdir(root, { recursive: true });
const source = JSON.parse((await readFile("copilot-studio/company-agent/connectors/new_land-20read-20api-20preview-20v5-6f9cfa63-1bb1-f111-aaac-7ced8d05c994/openapidefinition.json", "utf8")).replace(/^\uFEFF/, "")) as {
  info: Record<string, unknown>;
  paths: Record<string, unknown>;
};
const hrDefinition = {
  ...source,
  info: {
    ...source.info,
    title: `${agentName} HR v1`.slice(0, 30),
    version: "1.0.0",
    description: `HR-only read-only API for ${agentName}. Synthetic public-safe policy guidance only.`,
  },
  paths: Object.fromEntries(Object.entries(source.paths).filter(([path]) => path === "/api/v1/hr/policies/vacation")),
};
const openApiPath = join(root, "hr-openapi.json");
await writeFile(openApiPath, `${JSON.stringify(hrDefinition, null, 2)}\n`);

async function run(command: string, commandArgs: string[]): Promise<string> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); process.stdout.write(chunk); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); process.stderr.write(chunk); });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve(output) : reject(new Error(`${command} failed with exit code ${code ?? "unknown"}.`)));
  });
}
async function checkpoint(message: string): Promise<void> {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  await prompt.question(`\nCHECKPOINT\n${message}\nWhen complete, press Enter.\n`);
  prompt.close();
}

console.log(`\n1. Creating HR-only connector for ${agentName}...`);
const connectorOutput = await run("pac", ["connector", "create", "--environment", environmentId, "--api-definition-file", openApiPath, "--api-properties-file", join(".azure", environmentName, "connector-create", "apiProperties.json"), "--icon-file", join(".azure", environmentName, "connector-create", "connector-icon.png"), "--solution-unique-name", "ca_CompanyAgent"]);
const connectorId = connectorOutput.match(/Connector created with ID ([0-9a-f-]+)/i)?.[1] ?? "";
if (!connectorId) throw new Error("PAC did not return a connector ID.");
await writeFile(join(root, "bootstrap-bindings.json"), `${JSON.stringify({ agentName, environmentName, environmentId, apiUrl, connectorId }, null, 2)}\n`);

await checkpoint(`2. Open Copilot Studio: https://copilotstudio.microsoft.com/environments/${environmentId}/agents\nCreate a blank agent named “${agentName}”.`);
await checkpoint("3. In that agent, create HR Agent as a child agent. Do not add Land Agent.");
await checkpoint("4. In HR Agent, create the HR vacation-policy connector tool using the newly created HR-only connector.");
await checkpoint(`5. Open Power Automate: https://make.powerautomate.com/environments/${environmentId}/connections/custom\nCreate and authorize the connection for the newest HR connector.`);
await checkpoint("6. Publish the agent in Copilot Studio, then return here.");
console.log(`7. Pulling the clean result will be the next command after you confirm the published agent ID.\nConnector ID: ${connectorId}`);
