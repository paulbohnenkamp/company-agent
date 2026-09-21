/** Guided Company Agent bootstrap for the shared REST API and HR slice. */
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { readAzdEnvironment } from "./read-azd-environment.js";
import { ensureDataverseConnectionReference } from "./ensure-dataverse-connection-reference.js";

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
const powerAutomateEnvironment = `Default-${environmentId}`;
const apiConnectorDisplayName = "Company Agent API v1 Land HR";
const apiConnectionDisplayName = "Company Agent API v1 - Land + HR";
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
const workspace = join(root, "workspace");
let bindings: {
  agentName?: string;
  environmentName?: string;
  environmentId?: string;
  companyAgentId?: string;
  solutionName?: string;
  connectorId?: string;
  connectorName?: string;
  provider?: string;
  phase?: string;
};
try {
  bindings = JSON.parse(await readFile(join(root, "bootstrap-bindings.json"), "utf8"));
} catch {
  bindings = {};
}
const companyAgentId = bindings.companyAgentId ?? "";
const solutionName = bindings.solutionName ?? `ca_${agentName.replace(/[^A-Za-z0-9]/g, "")}`;
if (!companyAgentId) throw new Error(`Missing ${root}/bootstrap-bindings.json. Run --mode init first.`);
const dataverseEndpoint = JSON.parse(await readFile(join(workspace, ".mcs", "conn.json"), "utf8")) as { DataverseEndpoint?: string };
const tenantId = process.env.DATAVERSE_TENANT_ID || process.env.COPILOT_TENANT_ID || process.env.ENTRA_TENANT_ID || "";
if (!tenantId) throw new Error("Missing DATAVERSE_TENANT_ID or ENTRA_TENANT_ID for connection-reference provisioning.");

async function capture(command: string, commandArgs: string[]): Promise<string> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); process.stdout.write(chunk); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); process.stderr.write(chunk); });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve(output) : reject(new Error(`${command} failed with exit code ${code ?? "unknown"}.`)));
  });
}

async function pac(commandArgs: string[]): Promise<string> {
  return await capture("pac", commandArgs);
}

async function powerApps(commandArgs: string[], interactive = false, showOutput = true): Promise<string> {
  return await new Promise((resolve, reject) => {
    const child = spawn("npx", ["--no-install", "pa", ...commandArgs], {
      stdio: interactive ? "inherit" : ["ignore", "pipe", "pipe"],
      env: { ...process.env, POWERAPPS_CLI_ENABLE_BROWSER_CONNECTION: "true" },
    });
    let output = "";
    if (!interactive) {
      child.stdout?.on("data", (chunk) => { output += chunk.toString(); if (showOutput) process.stdout.write(chunk); });
      child.stderr?.on("data", (chunk) => { output += chunk.toString(); if (showOutput) process.stderr.write(chunk); });
    }
    child.once("error", reject);
    child.once("exit", (code) => code === 0
      ? resolve(output)
      : reject(new Error(`pa ${commandArgs.join(" ")} failed with exit code ${code ?? "unknown"}. ${output}`)));
  });
}

async function ensurePowerAppsAuth(): Promise<void> {
  const list = async (): Promise<string> => await powerApps(["connection", "list", "--environment-id", powerAutomateEnvironment, "--json"], false, false);
  try {
    await list();
  } catch (error) {
    if (!/not signed in|interactive sign-in is required/i.test(error instanceof Error ? error.message : String(error))) throw error;
    console.log("\nPower Apps CLI authentication is required. Complete the browser sign-in, then return to this terminal.");
    const account = process.env.COPILOT_LOGIN_HINT || process.env.DATAVERSE_LOGIN_HINT || "";
    await powerApps(["auth", "login", ...(account ? ["--account", account] : [])], true);
    await list();
  }
}

function getPowerAppsConnectorName(output: string, expectedDisplayName: string): string {
  let value: unknown;
  try {
    value = JSON.parse(output);
  } catch {
    return "";
  }
  if (typeof value !== "object" || value === null || !("items" in value) || !Array.isArray(value.items)) return "";
  for (const item of value.items) {
    if (typeof item !== "object" || item === null) continue;
    if (!("displayName" in item) || !("name" in item)) continue;
    if (item.displayName === expectedDisplayName && typeof item.name === "string") return item.name;
  }
  return "";
}

async function resolvePowerAppsConnectorName(): Promise<string> {
  await ensurePowerAppsAuth();
  const output = await powerApps(["connector", "list", "--environment-id", powerAutomateEnvironment, "--search", apiConnectorDisplayName, "--json"], false, false);
  const resolved = getPowerAppsConnectorName(output, apiConnectorDisplayName);
  if (!resolved) throw new Error(`Power Apps CLI could not find the shared connector named ${apiConnectorDisplayName} in ${powerAutomateEnvironment}.`);
  return resolved;
}

async function ensurePowerAppsConnection(): Promise<void> {
  await ensurePowerAppsAuth();
  const list = async (): Promise<string> => await powerApps(["connection", "list", "--environment-id", powerAutomateEnvironment, "--json"], false, false);
  let connectionOutput = await list();
  if (connectionOutput.includes(provider)) return;

  console.log(`\nCreating the Power Platform connection for ${provider} with the Power Apps CLI...`);
  try {
    await powerApps(["connection", "create", "--environment-id", powerAutomateEnvironment, "--connector", provider, "--display-name", apiConnectionDisplayName, "--json"], true);
  } catch (error) {
    throw new Error(`Power Apps CLI could not create the connector connection for ${provider}. Open https://make.powerautomate.com/environments/${powerAutomateEnvironment}/home and create it under Connections, then retry. ${error instanceof Error ? error.message : String(error)}`);
  }
  connectionOutput = await list();
  if (!connectionOutput.includes(provider)) {
    throw new Error(`Power Apps CLI returned success, but ${provider} is not listed as connected. Open https://make.powerautomate.com/environments/${powerAutomateEnvironment}/home and verify the connection, then retry.`);
  }
}

async function findConnectorName(connectorId: string): Promise<string> {
  const output = await pac(["connector", "list", "--environment", environmentId]);
  const line = output.split("\n").find((candidate) => candidate.includes(connectorId));
  const fields = line?.trim().split(/\s+/) ?? [];
  return fields[1] ?? "";
}
async function findExistingConnector(displayName: string): Promise<{ id: string; name: string } | undefined> {
  const output = await pac(["connector", "list", "--environment", environmentId]);
  const line = output.split("\n").find((candidate) => candidate.includes(displayName));
  if (!line) return undefined;
  const fields = line.trim().split(/\s+/);
  return fields[0] && fields[1] ? { id: fields[0], name: fields[1] } : undefined;
}
const sourceOpenApiPath = "copilot-studio/company-agent/connectors/new_land-20read-20api-20preview-20v5-6f9cfa63-1bb1-f111-aaac-7ced8d05c994/openapidefinition.json";
const source = JSON.parse((await readFile(sourceOpenApiPath, "utf8")).replace(/^\uFEFF/, "")) as Record<string, unknown>;
const openApiPath = join(root, "api-openapi.json");
await writeFile(openApiPath, `${JSON.stringify({ ...source, host: new URL(apiUrl).host }, null, 2)}\n`);

async function saveBindings(phase: string): Promise<void> {
  bindings = {
    ...bindings,
    agentName,
    environmentName,
    environmentId,
    companyAgentId,
    solutionName,
    connectorId: connectorId || bindings.connectorId,
    connectorName: connectorName || bindings.connectorName,
    provider: provider || bindings.provider,
    phase,
  };
  await writeFile(join(root, "bootstrap-bindings.json"), `${JSON.stringify(bindings, null, 2)}\n`);
}
let connectorId = "";
let connectorName = "";
let provider = "";
const existing = await findExistingConnector(apiConnectorDisplayName);
if (existing) {
  console.log(`\n1. Reusing shared Company Agent API connector ${existing.id}...`);
  connectorId = existing.id;
  connectorName = existing.name;
} else {
  console.log(`\n1. Creating the shared Company Agent API connector in ${solutionName}...`);
  const connectorOutput = await pac(["connector", "create", "--environment", environmentId, "--api-definition-file", openApiPath, "--api-properties-file", join(".azure", environmentName, "connector-create", "apiProperties.json"), "--icon-file", join(".azure", environmentName, "connector-create", "connector-icon.png"), "--solution-unique-name", solutionName]);
  connectorId = connectorOutput.match(/Connector created with ID ([0-9a-f-]+)/i)?.[1] ?? "";
  if (!connectorId) throw new Error("PAC did not return a connector ID.");
  connectorName = await findConnectorName(connectorId);
  if (!connectorName) throw new Error(`Could not find connector ${connectorId} after creation.`);
}
provider = await resolvePowerAppsConnectorName();
await saveBindings("connector-created");

await saveBindings(bindings.phase ?? "connector-created");
await ensurePowerAppsConnection();

const sourceAgent = "copilot-studio/company-agent";
const solutionPrefix = solutionName;
let parentDefinition = await readFile(join(sourceAgent, "agent.mcs.yml"), "utf8");
parentDefinition = parentDefinition.replace(/componentName: Company Agent\b/g, `componentName: ${agentName}`)
  .replace(/displayName: Company Agent\b/g, `displayName: ${agentName}`)
  .replace(/displayName Company Agent\b/g, `displayName ${agentName}`);
await writeFile(join(workspace, "agent.mcs.yml"), parentDefinition);
await cp(join(sourceAgent, "settings.mcs.yml"), join(workspace, "settings.mcs.yml"));
await cp(join(sourceAgent, "connectionreferences.mcs.yml"), join(workspace, "connectionreferences.mcs.yml"));
await cp(join(sourceAgent, "agents", "HR Agent"), join(workspace, "agents", "HR Agent"), { recursive: true });
const hrAgentPath = join(workspace, "agents", "HR Agent", "agent.mcs.yml");
let hrAgentText = await readFile(hrAgentPath, "utf8");
hrAgentText = hrAgentText.replace(/schemaName: ca_CompanyAgent\./, `schemaName: ${solutionPrefix}.`);
await writeFile(hrAgentPath, hrAgentText);
const hrAction = join(workspace, "agents", "HR Agent", "actions", "CompanyAgentApi-GetVacationPolicy.mcs.yml");
let actionText = await readFile(hrAction, "utf8");
actionText = actionText.replace(/ca_CompanyAgent\.shared_[^\.\s]+\.[A-Za-z0-9]+/g, `${solutionPrefix}.${provider}.api`)
  .replaceAll("ca_CompanyAgent.", `${solutionPrefix}.`)
  .replace(/aIPluginOperationExportKey:.*\n/g, "");
await writeFile(hrAction, actionText);
await writeFile(join(workspace, "connectionreferences.mcs.yml"), `connectionReferences:\n  - connectionReferenceLogicalName: ${solutionPrefix}.${provider}.api\n    connectorId: /providers/Microsoft.PowerApps/apis/${provider}\n`);

console.log(`\n3. Ensuring the Dataverse connection reference exists...`);
const connectionReferenceId = await ensureDataverseConnectionReference({
  dataverseUrl: dataverseEndpoint.DataverseEndpoint ?? "",
  tenantId,
  solutionName,
  logicalName: `${solutionPrefix}.${provider}.api`,
  displayName: apiConnectionDisplayName,
  provider,
});
await saveBindings(bindings.phase ?? "connection-reference-created");
console.log(`Connection reference ID: ${connectionReferenceId}`);

if (!["pushed", "agent-verified", "published", "pulled"].includes(bindings.phase ?? "")) {
  console.log(`\n2. Pushing the HR child agent and HR connector tool...`);
  await pac(["copilot", "push", "--project-dir", workspace]);
  await saveBindings("pushed");
}

if (bindings.phase === "pushed") {
  await saveBindings("agent-verified");
}

if (bindings.phase !== "published" && bindings.phase !== "pulled") {
  console.log(`\n4. Publishing ${agentName}...`);
  await pac(["copilot", "publish", "--environment", environmentId, "--bot", companyAgentId]);
  // PAC 2.12.2 queries an unavailable bot componentstate attribute for both
  // list/status in this tenant. The publish command is the supported result;
  // verification continues through Copilot Studio and the pulled workspace.
  await saveBindings("published");
}

if (bindings.phase === "published") {
  console.log(`\n5. Pulling the clean result into ${workspace}...`);
  await pac(["copilot", "pull", "--project-dir", workspace]);
  await saveBindings("pulled");
}
console.log(`Bootstrap completed.\nAgent ID: ${companyAgentId}\nConnector ID: ${connectorId}\nBindings: ${join(root, "bootstrap-bindings.json")}`);
