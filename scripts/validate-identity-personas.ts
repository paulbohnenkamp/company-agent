/** Validates the synthetic employee catalog used by local identity scenarios. */
import { readFile } from "node:fs/promises";

type Catalog = { schemaVersion: string; companyId: string; synthetic: boolean; emailDomain: string; personas: Persona[] };
type Persona = { id: string; displayName: string; jobTitle: string; departmentId: string; roleIds: string[]; groupIds: string[] };

const departments = new Set(["land", "land-administration", "legal", "compliance", "accounting", "operations", "it-platform"]);
const roles = new Set(["land-analyst", "land-administrator", "legal-reviewer", "compliance-reviewer", "accounting-reviewer", "operations-reviewer", "case-manager", "platform-admin"]);
const groups = new Set(["title-curative-board", "division-order-review", "lease-compliance-review", "development-readiness"]);
const catalog = JSON.parse(await readFile("config/identity/personas.json", "utf8")) as Catalog;
if (!catalog.synthetic || catalog.companyId !== "blue-ridge-energy-resources") throw new Error("Identity catalog must match the stable synthetic company ID.");
if (!/^\d+\.\d+\.\d+$/.test(catalog.schemaVersion)) throw new Error("Identity catalog schemaVersion must use SemVer.");
if (!catalog.emailDomain.endsWith(".example")) throw new Error("Synthetic personas must use a reserved .example email domain.");
const ids = new Set<string>();
for (const persona of catalog.personas) {
  if (ids.has(persona.id)) throw new Error(`Duplicate persona id: ${persona.id}`);
  ids.add(persona.id);
  if (!departments.has(persona.departmentId)) throw new Error(`${persona.id}: unknown department ${persona.departmentId}`);
  for (const role of persona.roleIds) if (!roles.has(role)) throw new Error(`${persona.id}: unknown role ${role}`);
  for (const group of persona.groupIds) if (!groups.has(group)) throw new Error(`${persona.id}: unknown group ${group}`);
  if (persona.id.includes("@") || persona.displayName.trim() === "") throw new Error(`${persona.id}: invalid synthetic identity`);
}
console.log(`Validated ${catalog.personas.length} synthetic identity personas.`);
