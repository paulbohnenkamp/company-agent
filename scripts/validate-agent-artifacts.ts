/** Validates the repository's canonical agent files before they reach Foundry tooling. */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

const root = "copilot-studio";

async function findAgentFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findAgentFiles(path));
    else if (entry.name === "agent.yaml" || entry.name === "agent.manifest.yaml") files.push(path);
  }
  return files;
}

const files = await findAgentFiles(root).catch((error: unknown) => {
  if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
  throw error;
});
if (files.length === 0) {
  console.log("No source-controlled Copilot Studio agent manifests found; domain specialists are skills.");
  process.exit(0);
}

for (const path of files.sort()) {
  const document = parse(await readFile(path, "utf8")) as Record<string, unknown>;
  const metadata = (document.metadata as Record<string, unknown> | undefined)?.businessAgent as Record<string, unknown> | undefined;
  if (!String(document.$schema ?? "").includes("AgentSchema/main/schemas/v1.0/PromptAgent.yaml")) throw new Error(`${path}: missing Microsoft AgentSchema PromptAgent schema`);
  if (document.kind !== "prompt") throw new Error(`${path}: kind must be prompt`);
  for (const field of ["name", "description", "model", "instructions"]) if (typeof document[field] !== "string" || !document[field]) throw new Error(`${path}: missing ${field}`);
  if (!metadata || typeof metadata.version !== "string" || !/^\d+\.\d+\.\d+$/.test(metadata.version)) throw new Error(`${path}: metadata.businessAgent.version must use SemVer`);
}

console.log(`Validated ${files.length} Microsoft AgentSchema prompt agents.`);
