/** Validates department catalogs, skills, and flows without contacting external services. */
import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

type Catalog = {
  id: string;
  version: string;
  skills: Array<{ id: string; file: string }>;
  flows: Array<{ id: string; file: string }>;
};

const root = "departments/land";
const catalogPath = join(root, "catalog.yaml");
const catalog = parse(await readFile(catalogPath, "utf8")) as Catalog;
if (!/^\d+\.\d+\.\d+$/.test(catalog.version)) throw new Error("Land department catalog version must use SemVer.");

for (const [kind, entries] of [["skill", catalog.skills], ["flow", catalog.flows]] as const) {
  const ids = new Set<string>();
  for (const entry of entries) {
    if (ids.has(entry.id)) throw new Error(`Duplicate department ${kind} id: ${entry.id}`);
    ids.add(entry.id);
  }
}
for (const entry of [...catalog.skills, ...catalog.flows]) {
  await access(join(root, entry.file));
}

for (const entry of catalog.skills) {
  const source = await readFile(join(root, entry.file), "utf8");
  const frontMatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!frontMatter) throw new Error(`${entry.file}: missing YAML front matter`);
  const skill = parse(frontMatter[1]) as Record<string, unknown>;
  if (skill.name !== entry.id) throw new Error(`${entry.file}: front matter name must match ${entry.id}`);
  if (typeof skill.description !== "string" || skill.description.length === 0) throw new Error(`${entry.file}: missing description`);
  if (!/^\d+\.\d+\.\d+$/.test(String(skill.version))) throw new Error(`${entry.file}: version must use SemVer`);
}

for (const entry of catalog.flows) {
  const source = await readFile(join(root, entry.file), "utf8");
  const frontMatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!frontMatter) throw new Error(`${entry.file}: missing YAML front matter`);
  const flow = parse(frontMatter[1]) as Record<string, unknown>;
  if (flow.id !== entry.id) throw new Error(`${entry.file}: front matter id must match ${entry.id}`);
  const referencedSkills = Array.isArray(flow.skills) ? flow.skills : [];
  for (const skillId of referencedSkills) {
    if (typeof skillId !== "string" || !catalog.skills.some((skill) => skill.id === skillId)) {
      throw new Error(`${entry.file}: unknown skill reference ${String(skillId)}`);
    }
  }
}

const skillDirectories = await readdir(join(root, "skills"), { withFileTypes: true });
const unlistedSkills = skillDirectories
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !catalog.skills.some((skill) => skill.id === name));
if (unlistedSkills.length > 0) throw new Error(`Unlisted Land skills: ${unlistedSkills.join(", ")}`);

const flowFiles = (await readdir(join(root, "flows"))).filter((file) => file.endsWith(".flow.md"));
const unlistedFlows = flowFiles
  .map((file) => file.replace(/\.flow\.md$/, ""))
  .filter((id) => !catalog.flows.some((flow) => flow.id === id));
if (unlistedFlows.length > 0) throw new Error(`Unlisted Land flows: ${unlistedFlows.join(", ")}`);

console.log(`Validated ${catalog.skills.length} Land skills and ${catalog.flows.length} Land flows.`);
