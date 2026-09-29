import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "agents");
const workspaceRoot = join(root, "deployment", "pac");

function instructions(source) {
  const lines = source.split("\n");
  const start = lines.indexOf("instructions: |");
  if (start < 0) throw new Error("Missing instructions block in agent definition");

  const block = [];
  for (const line of lines.slice(start + 1)) {
    if (line === "") {
      block.push(line);
      continue;
    }
    if (!/^ {2,}/.test(line)) break;
    block.push(line);
  }

  if (block.length === 0) throw new Error("Empty instructions block in agent definition");
  return block
    .map((line) => line.replace(/^ {2}/, ""))
    .join("\n")
    .trim();
}

function yamlBlock(value) {
  return value.split("\n").map((line) => `            ${line}`).join("\n");
}

const agentDirectories = readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const directory of agentDirectories) {
  const sourcePath = join(sourceRoot, directory, "agent.yaml");
  const workspacePath = join(workspaceRoot, directory);
  const settingsPath = join(workspacePath, "settings.mcs.yml");
  if (!existsSync(sourcePath) || !existsSync(settingsPath)) {
    throw new Error(`Expected source and PAC settings for ${directory}`);
  }

  const source = readFileSync(sourcePath, "utf8");
  const settings = readFileSync(settingsPath, "utf8").replaceAll("\r\n", "\n");
  const displayName = directory.split("-").map((part) => {
    if (part === "hr" || part === "it") return part.toUpperCase();
    return `${part[0].toUpperCase()}${part.slice(1)}`;
  }).join(" ");
  const sourceInstructions = instructions(source);
  const markerMatch = settings.match(/          value: (?:""|>-)[^\n]*\n/);
  const markerIndex = markerMatch?.index ?? -1;
  const markerEnd = markerIndex + (markerMatch?.[0].length ?? 0);
  const templateIndex = settings.indexOf("template:", markerEnd);
  if (markerIndex < 0 || templateIndex < 0) {
    throw new Error(`Unsupported PAC settings shape for ${directory}`);
  }

  const updated = `${settings.slice(0, markerIndex)}          value: >-\n${yamlBlock(sourceInstructions)}\n${settings.slice(templateIndex)}`
    .replace(/^displayName: .*$/m, `displayName: "${displayName}"`);
  mkdirSync(workspacePath, { recursive: true });
  writeFileSync(settingsPath, updated);
  console.log(`Generated ${settingsPath}`);
}
