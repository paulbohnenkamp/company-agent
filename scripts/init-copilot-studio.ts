/** Creates the tenant-side Company Agent and its solution. */
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { readAzdEnvironment } from "./read-azd-environment.js";

const args = process.argv.slice(2);
const value = (name: string): string => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] ?? "" : ""; };
const agentName = value("--agent-name");
const environmentName = value("--environment") || process.env.AZURE_ENV_NAME || "companyagent-dev";
const configureExisting = args.includes("--configure-existing");
const environment = await readAzdEnvironment(environmentName);
const environmentId = process.env.COPILOT_ENVIRONMENT_ID || environment.COPILOT_ENVIRONMENT_ID || "";
if (!agentName || !environmentId) throw new Error("--agent-name and COPILOT_ENVIRONMENT_ID are required.");
if (!args.includes("--apply")) { console.log(`mode=init\nagentName=${agentName}\nenvironment=${environmentName}\nNo tenant mutation performed.`); process.exit(0); }
if (process.env.COPILOT_PUSH_APPROVED !== "true") throw new Error("Set COPILOT_PUSH_APPROVED=true for tenant mutations.");
const root = join(".azure", environmentName, "hr-bootstrap");
const workspace = join(root, "workspace");
const schemaName = `ca_${agentName.replace(/[^A-Za-z0-9]/g, "")}`;
await mkdir(root, { recursive: true });
const run = (command: string, commandArgs: string[]) => new Promise<string>((resolve, reject) => {
  const child = spawn(command, commandArgs, { stdio: ["ignore", "pipe", "pipe"] }); let output = "";
  child.stdout.on("data", (c) => { output += c.toString(); process.stdout.write(c); }); child.stderr.on("data", (c) => { output += c.toString(); process.stderr.write(c); });
  child.once("error", reject); child.once("exit", (code) => code === 0 ? resolve(output) : reject(new Error(`${command} failed with exit code ${code ?? "unknown"}.`)));
});
const existing = await run("pac", ["copilot", "list", "--environment", environmentId]);
const existingLine = existing.split("\n").find((line) => line.startsWith(`${agentName} `));
if (existingLine && !configureExisting) throw new Error(`Agent ${agentName} already exists; refusing to duplicate it. Use --configure-existing only to apply source-controlled metadata.`);
let companyAgentId = existingLine?.slice(agentName.length).trim().split(/\s+/)[0] ?? "";
if (!existingLine) {
  await rm(workspace, { recursive: true, force: true });
  await run("pac", ["copilot", "init", "--name", agentName, "--publisher-prefix", "ca", "--schema-name", schemaName, "--project-dir", workspace, "--environment", environmentId]);
}
const sourceAgent = "copilot-studio/company-agent";
let parentDefinition = await readFile(join(sourceAgent, "agent.mcs.yml"), "utf8");
parentDefinition = parentDefinition.replace(/componentName: Company Agent\b/g, `componentName: ${agentName}`)
  .replace(/displayName: Company Agent\b/g, `displayName: ${agentName}`)
  .replace(/displayName Company Agent\b/g, `displayName ${agentName}`);
await writeFile(join(workspace, "agent.mcs.yml"), parentDefinition);
await run("pac", ["copilot", "push", "--project-dir", workspace]);
const listed = await run("pac", ["copilot", "list", "--environment", environmentId]);
const line = listed.split("\n").find((candidate) => candidate.startsWith(`${agentName} `));
companyAgentId = line?.slice(agentName.length).trim().split(/\s+/)[0] ?? companyAgentId;
if (!companyAgentId) throw new Error(`Could not find newly created agent ${agentName}.`);
await writeFile(join(root, "bootstrap-bindings.json"), `${JSON.stringify({ agentName, environmentName, environmentId, companyAgentId, solutionName: schemaName }, null, 2)}\n`);
if (!args.includes("--non-interactive")) console.log(`\nVERIFY\nVerify “${agentName}” in Copilot Studio: https://copilotstudio.microsoft.com/environments/${environmentId}/agents\nThe command has completed; continue after visual verification.`);
console.log(`Initialization completed. Agent ID: ${companyAgentId}\nBindings: ${join(root, "bootstrap-bindings.json")}`);
