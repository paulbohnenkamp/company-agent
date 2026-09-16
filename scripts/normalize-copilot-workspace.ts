/** Applies the reviewed Company Agent identity to a captured PAC source snapshot. */
import { access, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.argv[2] ?? "copilot-studio/company-agent";
const textExtensions = new Set([".json", ".mcs.yml", ".yml"]);
const oldConnectorDirectory = "cr42d_5Fland-20read-20api-20preview-20v5-942329f3-93d5-4265-8670-11202d1e07a7";
const newConnectorDirectory = "new_land-20read-20api-20preview-20v5-6f9cfa63-1bb1-f111-aaac-7ced8d05c994";
const oldConnectorId = "942329f3-93d5-4265-8670-11202d1e07a7";
const newConnectorId = "6f9cfa63-1bb1-f111-aaac-7ced8d05c994";
const oldConnectorName = "cr42d_5Fland-20read-20api-20preview-20v5";
const newConnectorName = "new_land-20read-20api-20preview-20v5";
const oldConnectorInternalId = "shared_cr42d-5Fland-20read-20api-20preview-20v5-5F10d5d3eec5c5bdb0";
const newConnectorInternalId = "shared_new-5Fland-20read-20api-20preview-20v5";
const previousConnectorDirectory = "ca_5Fcompany-20agent-20land-20api-0b4bd0a4-2a5d-4bb3-8c4b-7f4a6aa0c2d";
const previousConnectorId = "0b4bd0a4-2a5d-4bb3-8c4b-7f4a6aa0c2d";
const previousConnectorName = "ca_5Fcompany-20agent-20land-20api";
const previousConnectorInternalId = "shared_ca-5Fcompany-20agent-20land-20api-5F0b4bd0a42a5d4bb";
const oldConnectorProviderId = "shared_cr42d-5fland-20read-20api-20preview-20v5-5f10d5d3eec5c5bdb0";
const newConnectorProviderId = "shared_new-5fland-20read-20api-20preview-20v5";

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesIn(path)));
    else if ([...textExtensions].some((extension) => entry.name.endsWith(extension))) files.push(path);
  }
  return files;
}

for (const connectorDirectory of [oldConnectorDirectory, previousConnectorDirectory]) {
  const oldConnectorPath = join(root, "connectors", connectorDirectory);
  const newConnectorPath = join(root, "connectors", newConnectorDirectory);
  try {
    await access(oldConnectorPath);
    await rename(oldConnectorPath, newConnectorPath);
    break;
  } catch {
    // The workspace may already have been normalized.
  }
}

for (const path of await filesIn(root)) {
  const source = await readFile(path, "utf8");
  const normalized = source
    .replaceAll("cr42d_Mountaineer", "ca_CompanyAgent")
    .replaceAll("Mountaineer", "Company Agent")
    .replaceAll(oldConnectorInternalId, newConnectorInternalId)
    .replaceAll(oldConnectorName, newConnectorName)
    .replaceAll(oldConnectorId, newConnectorId)
    .replaceAll(oldConnectorDirectory, newConnectorDirectory)
    .replaceAll(previousConnectorInternalId, newConnectorInternalId)
    .replaceAll(previousConnectorName, newConnectorName)
    .replaceAll(previousConnectorId, newConnectorId)
    .replaceAll(previousConnectorDirectory, newConnectorDirectory)
    .replaceAll(oldConnectorProviderId, newConnectorProviderId);
  if (normalized !== source) await writeFile(path, normalized);
}

console.log(`Normalized Company Agent identity in ${root}.`);
