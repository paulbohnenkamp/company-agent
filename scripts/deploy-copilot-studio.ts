/** Plans or explicitly executes a PAC push for the Company Agent workspace. */
import { access, appendFile, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { readAzdEnvironment } from "./read-azd-environment.js";

const positionalArguments = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
const projectDir = positionalArguments[0] ?? "copilot-studio/company-agent";
const sourceProjectDir = process.env.COPILOT_SOURCE_PROJECT_DIR ?? "copilot-studio/company-agent";
const apply = process.argv.includes("--apply");
const waitForConnection = process.argv.includes("--wait-for-connection");
const publish = process.argv.includes("--publish");
const testE2e = process.argv.includes("--test-e2e");
const environmentName = process.env.AZURE_ENV_NAME ?? "companyagent-dev";

const azdEnvironment = await readAzdEnvironment(environmentName);
const environmentId = process.env.COPILOT_ENVIRONMENT_ID ?? azdEnvironment.COPILOT_ENVIRONMENT_ID ?? "";
const apiUrl = process.env.COMPANY_AGENT_API_URL ?? azdEnvironment.COMPANY_AGENT_API_URL ?? azdEnvironment.apiUrl ?? "";
const companyAgentId = process.env.COMPANY_AGENT_ID ?? azdEnvironment.COMPANY_AGENT_ID ?? "";
const connectorRoot = join(projectDir, "connectors");
let hasSyncMetadata = true;
try {
  await access(join(projectDir, ".mcs", "conn.json"));
} catch {
  hasSyncMetadata = false;
}

if (!environmentId) throw new Error(`Missing COPILOT_ENVIRONMENT_ID for ${environmentName}.`);
if (!apiUrl) throw new Error(`Missing COMPANY_AGENT_API_URL for ${environmentName}.`);
if (/mountaineer/i.test(apiUrl) || /mountaineer/i.test(environmentId)) throw new Error("Refusing a Mountaineer deployment target.");

async function runCommand(command: string, args: string[], label: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${label} failed with exit code ${code ?? "unknown"}.`))));
  });
}

async function runPac(args: string[], label: string): Promise<void> {
  await runCommand("pac", args, label);
}

async function capturePac(args: string[], label: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const child = spawn("pac", args, { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); process.stdout.write(chunk); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); process.stderr.write(chunk); });
    child.once("error", reject);
    child.once("exit", (code) => (code === 0 ? resolve(output) : reject(new Error(`${label} failed with exit code ${code ?? "unknown"}.`))));
  });
}

if (apply && projectDir.startsWith(".azure/")) {
  await runCommand("npm", ["run", "prepare:copilot-workspace", "--", sourceProjectDir, projectDir], "PAC workspace synchronization");
}

await new Promise<void>((resolve, reject) => {
  const child = spawn("npm", ["run", "validate:copilot-workspace", "--", projectDir], { stdio: "inherit" });
  child.once("error", reject);
  child.once("exit", (code) => (code === 0 ? resolve() : reject(new Error(`Workspace validation failed with exit code ${code ?? "unknown"}.`))));
});

const command = `pac copilot push --project-dir ${projectDir}`;
const logPath = join(".azure", environmentName, "copilot-push.log");
await mkdir(dirname(logPath), { recursive: true });
const plan = [
  `environment=${environmentName}`,
  `environmentId=${environmentId}`,
  `apiUrl=${apiUrl}`,
  `projectDir=${projectDir}`,
  `workspaceSyncMetadata=${hasSyncMetadata ? "present" : "missing"}`,
  `publish=${publish ? "requested" : "not-requested"}`,
  `testE2e=${testE2e ? "requested" : "not-requested"}`,
  `command=${command}`,
].join("\n");

if (!apply) {
  console.log(`${plan}\nmode=plan\nNo tenant mutation performed. Re-run with --apply only after reviewing the target and PAC workspace.`);
  resolveLog(plan);
} else {
  if (process.env.COPILOT_PUSH_APPROVED !== "true") throw new Error("Set COPILOT_PUSH_APPROVED=true for the explicit tenant mutation.");
  if (testE2e && !publish) throw new Error("--test-e2e requires --publish so the conversation test runs after this deployment publishes.");
  if (!hasSyncMetadata) throw new Error("Workspace has no .mcs/conn.json. Initialize or clone a new Company Agent workspace before pushing.");
  const connectorDirectory = (await readdir(connectorRoot, { withFileTypes: true })).find((entry) => entry.isDirectory());
  if (!connectorDirectory) throw new Error(`${projectDir}: no connector directory found.`);
  const connectorPath = join(connectorRoot, connectorDirectory.name);
  const metadata = JSON.parse((await readFile(join(connectorPath, "metadata.yml"), "utf8")).replace(/^\uFEFF/, "")) as { connectorid?: unknown; connectorinternalid?: unknown; displayname?: unknown };
  if (typeof metadata.connectorid !== "string" || metadata.connectorid.length === 0) throw new Error(`${connectorPath}/metadata.yml: connectorid is required for an idempotent update.`);
  if (typeof metadata.connectorinternalid !== "string" || metadata.connectorinternalid.length === 0) throw new Error(`${connectorPath}/metadata.yml: connectorinternalid is required for connection verification.`);
  if (metadata.displayname !== "Company Agent API v1 - Land + HR") throw new Error(`${connectorPath}/metadata.yml: unexpected connector display name.`);
  await runCommand("npm", ["run", "prepare:copilot-connector"], "Connector bootstrap preparation");
  await runPac(["connector", "update", "--environment", environmentId, "--connector-id", metadata.connectorid, "--api-definition-file", join(connectorPath, "openapidefinition.json"), "--api-properties-file", join(".azure", environmentName, "connector-create", "apiProperties.json"), "--icon-file", join(".azure", environmentName, "connector-create", "connector-icon.png"), "--solution-unique-name", "ca_CompanyAgent"], "PAC connector update");
  const liveConnectorDir = await mkdtemp(join(tmpdir(), "company-agent-connector-"));
  try {
    await runPac(["connector", "download", "--environment", environmentId, "--connector-id", metadata.connectorid, "--outputDirectory", liveConnectorDir], "PAC live connector download");
    const liveFiles: string[] = [];
    async function collect(directory: string): Promise<void> {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await collect(path);
        else liveFiles.push(path);
      }
    }
    await collect(liveConnectorDir);
    const liveContent = (await Promise.all(liveFiles.map((path) => readFile(path, "utf8")))).join("\n");
    if (!liveContent.includes("Company Agent API v1 Land HR") || !liveContent.includes("getVacationPolicy") || /Mountaineer|mountaineer|cr42d_/.test(liveContent)) {
      throw new Error("Live connector does not match Company Agent API v1 - Land + HR; refusing to push stale tool references.");
    }
  } finally {
    await rm(liveConnectorDir, { recursive: true, force: true });
  }
  const providerName = metadata.connectorinternalid;
  let connectionOutput = await capturePac(["connection", "list"], "PAC connection list");
  if (!connectionOutput.includes(providerName) && waitForConnection) {
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    await prompt.question(`\nAction required in Power Platform:\nCreate/authorize a connection for ${providerName} in environment ${environmentId}.\nAfter the connection shows Connected, press Enter here to continue.\n`);
    prompt.close();
    connectionOutput = await capturePac(["connection", "list"], "PAC connection list");
  }
  if (!connectionOutput.includes(providerName)) {
    throw new Error(`No active connection exists for ${providerName}. Re-run with --wait-for-connection after creating the connection, or create it once in Power Platform. PAC push cannot create user-consented connector connections.`);
  }
  await appendFile(logPath, `${new Date().toISOString()}\n${plan}\nmode=apply\n`);
  await runPac(["copilot", "push", "--project-dir", projectDir], "PAC push");
  if (publish) {
    if (!companyAgentId) throw new Error("--publish requires COMPANY_AGENT_ID in the AZD environment or shell.");
    await runPac(["copilot", "publish", "--environment", environmentId, "--bot", companyAgentId], "PAC publish");
    await runPac(["copilot", "status", "--environment", environmentId, "--bot-id", companyAgentId], "PAC publish status");
  }
  if (testE2e) {
    await runCommand("npm", ["run", "test:copilot-e2e"], "Copilot Studio conversation E2E");
  }
  console.log(`PAC push${publish ? " and publish" : ""} completed. Output was recorded in ${logPath}.`);
}

function resolveLog(planText: string): void {
  void appendFile(logPath, `${new Date().toISOString()}\n${planText}\nmode=plan\n`);
}
