import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const environmentFlag = process.argv.indexOf("--environment");
const environment = environmentFlag >= 0 ? process.argv[environmentFlag + 1] : undefined;
const dryRun = process.argv.includes("--dry-run");

if (!environment) {
  throw new Error("Usage: node scripts/bootstrap-agents.mjs --environment <dataverse-url> [--dry-run]");
}

function instructions(source) {
  const match = source.match(/^instructions: \|\n((?: {2,}.+\n?)+)/m);
  if (!match) throw new Error("Missing instructions block in agent definition");
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^ {2}/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function displayName(directory) {
  return directory.split("-").map((part) => {
    if (part === "hr" || part === "it") return part.toUpperCase();
    return `${part[0].toUpperCase()}${part.slice(1)}`;
  }).join(" ");
}

const listOutput = execFileSync("pac", ["copilot", "list", "--environment", environment], { encoding: "utf8" });
const existing = new Set(
  listOutput.split("\n").map((line) => line.trim()).filter(Boolean),
);
const agentDirectories = ["hr-agent", "customer-agent", "it-request-agent", "company-agent"];

for (const directory of agentDirectories) {
  const name = displayName(directory);
  const sourcePath = join(root, "agents", directory, "agent.yaml");
  const workspacePath = join(root, "deployment", "pac", "bootstrap", directory);
  const source = readFileSync(sourcePath, "utf8");

  if ([...existing].some((line) => line.startsWith(`${name} `))) {
    console.log(`SKIP existing: ${name}`);
    continue;
  }

  const args = [
    "copilot", "init",
    "--name", name,
    "--publisher-prefix", "nstar",
    "--project-dir", workspacePath,
    "--authoring-mode", "cli-copilot",
    "--environment", environment,
    "--instructions", instructions(source),
  ];

  if (dryRun) {
    console.log(`CREATE missing: ${name}`);
    continue;
  }

  if (existsSync(workspacePath) && readdirSync(workspacePath).length > 0) {
    throw new Error(`Refusing to initialize non-empty workspace: ${workspacePath}`);
  }
  mkdirSync(workspacePath, { recursive: true });
  execFileSync("pac", args, { stdio: "inherit" });
}
