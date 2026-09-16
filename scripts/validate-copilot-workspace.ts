/** Validates the source-controlled Copilot Studio workspace without contacting a tenant. */
import { access, readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { parse } from "yaml";

const projectDir = process.argv[2] ?? "copilot-studio/company-agent";
const actionsDir = join(projectDir, "agents", "Land Agent", "actions");
const hrActionsDir = join(projectDir, "agents", "HR Agent", "actions");
const connectorFiles = await readdir(join(projectDir, "connectors"), { withFileTypes: true });
const connectorDir = connectorFiles.find((entry) => entry.isDirectory());

if (!connectorDir) throw new Error(`${projectDir}: no connector directory found`);

const requiredFiles = [
  "agent.mcs.yml",
  "settings.mcs.yml",
  "connectionreferences.mcs.yml",
  "agents/Land Agent/agent.mcs.yml",
  "agents/HR Agent/agent.mcs.yml",
  "agents/HR Agent/actions/CompanyAgentApi-GetVacationPolicy.mcs.yml",
  join("connectors", connectorDir.name, "metadata.yml"),
  join("connectors", connectorDir.name, "openapidefinition.json"),
];
for (const file of requiredFiles) await access(join(projectDir, file));

const actionFiles = (await readdir(actionsDir)).filter((file) => file.endsWith(".mcs.yml"));
if (actionFiles.length === 0) throw new Error(`${actionsDir}: no Land Agent actions found`);
const hrActionFiles = (await readdir(hrActionsDir)).filter((file) => file.endsWith(".mcs.yml"));
if (hrActionFiles.length !== 1) throw new Error(`${hrActionsDir}: expected exactly one HR Agent action`);

const actionNames = new Set<string>();
const operationIds = new Set<string>();
const expectedNames: Record<string, string> = {
  getCompanyPortfolio: "Land Agent · Get Company Portfolio",
  listRoleScenarios: "Land Agent · List Role Scenarios",
  getScenarioPlan: "Land Agent · Get Scenario Plan",
  getLandCase: "Land Agent · Get Land Case",
  getCaseDataRoom: "Land Agent · Get Case Data Room",
  getCaseEvidence: "Land Agent · Get Case Evidence",
};

for (const file of actionFiles) {
  const path = join(actionsDir, file);
  const action = parse(await readFile(path, "utf8")) as {
    "mcs.metadata"?: { componentName?: unknown };
    action?: { operationId?: unknown };
  };
  const name = action["mcs.metadata"]?.componentName;
  const operationId = action.action?.operationId;
  if (typeof name !== "string" || name.trim().length === 0) throw new Error(`${path}: missing componentName`);
  if (actionNames.has(name)) throw new Error(`${path}: duplicate componentName ${name}`);
  actionNames.add(name);
  if (typeof operationId !== "string" || operationId.trim().length === 0) throw new Error(`${path}: missing operationId`);
  if (operationIds.has(operationId)) throw new Error(`${path}: duplicate operationId ${operationId}`);
  operationIds.add(operationId);
  if (expectedNames[operationId] !== name) throw new Error(`${path}: ${operationId} must use componentName ${expectedNames[operationId] ?? "an approved unique name"}`);
}

const hrActionPath = join(hrActionsDir, hrActionFiles[0]);
const hrAction = parse(await readFile(hrActionPath, "utf8")) as {
  "mcs.metadata"?: { componentName?: unknown };
  action?: { operationId?: unknown };
};
if (hrAction["mcs.metadata"]?.componentName !== "HR Agent · Get Vacation Policy") throw new Error(`${hrActionPath}: unexpected HR action name`);
if (hrAction.action?.operationId !== "getVacationPolicy") throw new Error(`${hrActionPath}: unexpected HR operation ID`);

for (const file of [
  join(projectDir, "agent.mcs.yml"),
  join(projectDir, "settings.mcs.yml"),
  join(projectDir, "connectionreferences.mcs.yml"),
  join(projectDir, "agents", "Land Agent", "agent.mcs.yml"),
  join(projectDir, "agents", "HR Agent", "agent.mcs.yml"),
]) {
  if (/Mountaineer/.test(await readFile(file, "utf8"))) throw new Error(`${file}: Mountaineer identity remains in Company Agent source.`);
}

const openApiPath = join(projectDir, "connectors", connectorDir.name, "openapidefinition.json");
const openApiSource = (await readFile(openApiPath, "utf8")).replace(/^\uFEFF/, "");
const openApi = JSON.parse(openApiSource) as { host?: unknown; info?: { title?: unknown }; paths?: Record<string, unknown> };
if (openApi.info?.title !== "Company Agent API v1 Land HR" || openApi.info.title.length > 30) throw new Error(`${openApiPath}: OpenAPI title must be the approved PAC-safe title (30 characters maximum).`);
if (openApi.host !== "${COMPANY_AGENT_API_HOST}" && typeof openApi.host !== "string") throw new Error(`${openApiPath}: host must be a valid host or the source placeholder.`);
if (!openApi.paths || Object.keys(openApi.paths).length !== actionFiles.length + hrActionFiles.length) {
  throw new Error(`${openApiPath}: OpenAPI path count must match Land and HR action count`);
}

const metadata = parse(await readFile(join(projectDir, "connectors", connectorDir.name, "metadata.yml"), "utf8")) as { displayname?: unknown; description?: unknown };
if (metadata.displayname !== "Company Agent API v1 - Land + HR") throw new Error("Connector display name changed unexpectedly; review before push.");
if (typeof metadata.description !== "string" || /Mountaineer/.test(metadata.description)) throw new Error("Connector metadata must use Company Agent vocabulary.");

console.log(`Validated Copilot workspace ${relative(process.cwd(), projectDir)}: ${actionFiles.length} uniquely named actions and ${Object.keys(openApi.paths).length} OpenAPI paths.`);
