/** Validates the repository's canonical agent files before they reach Foundry tooling. */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

const root = "domains/land-administration/agents";
const files = (await readdir(root)).filter((file) => file.endsWith(".agent.yaml")).sort();
if (files.length === 0) throw new Error("No canonical .agent.yaml files were found.");

for (const file of files) {
  const path = join(root, file);
  const document = parse(await readFile(path, "utf8")) as Record<string, unknown>;
  const metadata = (document.metadata as Record<string, unknown> | undefined)?.businessAgent as Record<string, unknown> | undefined;
  if (!String(document.$schema ?? "").includes("AgentSchema/main/schemas/v1.0/PromptAgent.yaml")) throw new Error(`${path}: missing Microsoft AgentSchema PromptAgent schema`);
  if (document.kind !== "prompt") throw new Error(`${path}: kind must be prompt`);
  for (const field of ["name", "description", "model", "instructions"]) if (typeof document[field] !== "string" || !document[field]) throw new Error(`${path}: missing ${field}`);
  if (!metadata || typeof metadata.version !== "string" || !/^\d+\.\d+\.\d+$/.test(metadata.version)) throw new Error(`${path}: metadata.businessAgent.version must use SemVer`);
}

console.log(`Validated ${files.length} Microsoft AgentSchema prompt agents.`);
