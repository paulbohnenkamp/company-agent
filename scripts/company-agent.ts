import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { readAzdEnvironment } from "./read-azd-environment.js";

type Command = "env" | "deploy" | "verify" | "pull" | "undeploy" | "status" | "logs" | "retry";
type Department = "hr" | "land" | "all";

const args = process.argv.slice(2);
const command = args[0] as Command | undefined;
const subcommand = args[1];
const option = (name: string): string => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] ?? "" : ""; };
const environment = option("--env") || process.env.AZURE_ENV_NAME || "companyagent-dev";
const department = (option("--dep") || option("--department")) as Department | "";
const apply = args.includes("--apply");
const nonInteractive = args.includes("--non-interactive");
const confirmAll = args.includes("--confirm-all");
const configureExisting = args.includes("--configure-existing");
const root = join(".azure", environment, "company-agent");
const logPath = join(root, "lifecycle.jsonl");

// PAC child processes need the selected azd environment values as well as the
// wrapper. Shells do not automatically export values from .azure/<env>/.env.
const azdEnvironment = await readAzdEnvironment(environment);
for (const [key, value] of Object.entries(azdEnvironment)) {
  if (!process.env[key]) process.env[key] = value;
}

function requireCommand(): Command {
  if (!command || !["env", "deploy", "verify", "pull", "undeploy", "status", "logs", "retry"].includes(command)) {
    throw new Error("Usage: company-agent <env|deploy|verify|pull|undeploy|status|logs|retry> ...");
  }
  return command;
}

function requireDepartment(allowAll = false): Department {
  if (!department || !["hr", "land", "all"].includes(department) || (!allowAll && department === "all")) {
    throw new Error("This command requires --dep hr or --dep land. Use --dep all only explicitly.");
  }
  return department;
}

async function log(event: Record<string, unknown>): Promise<void> {
  await mkdir(root, { recursive: true });
  await appendFile(logPath, `${JSON.stringify({ timestamp: new Date().toISOString(), environment, ...event })}\n`);
}

async function run(script: string, scriptArgs: string[]): Promise<void> {
  await log({ event: "step.started", command: script, args: scriptArgs });
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npm", ["run", script, "--", ...scriptArgs], { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", async (code) => {
      if (code === 0) { await log({ event: "step.completed", command: script }); resolve(); }
      else { await log({ event: "step.failed", command: script, code, triage: `Inspect ${logPath} and rerun after correcting the reported PAC error.` }); reject(new Error(`${script} failed with exit code ${code ?? "unknown"}.`)); }
    });
  });
}

const selectedCommand = requireCommand();
if (selectedCommand === "env" && subcommand === "init") {
  const agentName = option("--agent-name");
  if (!agentName) throw new Error("env init requires --agent-name.");
  await run("deploy:copilot-studio", ["--mode", "init", "--agent-name", agentName, "--environment", environment, ...(apply ? ["--apply"] : []), ...(nonInteractive ? ["--non-interactive"] : []), ...(configureExisting ? ["--configure-existing"] : [])]);
} else if (selectedCommand === "deploy") {
  requireDepartment();
  if (department !== "hr") throw new Error("Only --dep hr is implemented in this first CLI slice.");
  const agentName = option("--agent-name");
  if (!agentName) throw new Error("deploy requires --agent-name.");
  console.log("Prerequisite: run `az login` first and select a tenant account authorized for Dataverse.");
  await run("deploy:copilot-studio", ["--mode", "bootstrap", "--agent-name", agentName, "--environment", environment, ...(apply ? ["--apply"] : []), ...(nonInteractive ? ["--non-interactive"] : [])]);
} else if (selectedCommand === "undeploy") {
  requireDepartment(true);
  if (department === "all" && !confirmAll) throw new Error("undeploy --dep all requires --confirm-all.");
  throw new Error("Undeploy is not enabled until dependency-safe deletion is implemented.");
} else if (selectedCommand === "retry") {
  requireDepartment();
  if (department !== "hr") throw new Error("Only --dep hr is implemented in this first CLI slice.");
  const agentName = option("--agent-name");
  if (!agentName) throw new Error("retry requires --agent-name.");
  await run("deploy:copilot-studio", ["--mode", "bootstrap", "--agent-name", agentName, "--environment", environment, ...(apply ? ["--apply"] : []), ...(nonInteractive ? ["--non-interactive"] : [])]);
} else if (["verify", "pull"].includes(selectedCommand)) {
  requireDepartment(true);
  throw new Error(`${selectedCommand} adapter is not wired yet; no tenant mutation was performed.`);
} else if (selectedCommand === "status" || selectedCommand === "logs") {
  try { console.log(await readFile(logPath, "utf8")); } catch { console.log(`No lifecycle log exists at ${logPath}.`); }
} else {
  throw new Error(`Unknown command: ${selectedCommand} ${subcommand ?? ""}`);
}
