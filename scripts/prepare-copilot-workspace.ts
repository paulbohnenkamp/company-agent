/** Merges reviewed repository artifacts into an initialized PAC sync workspace. */
import { access, cp, mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { readAzdEnvironment } from "./read-azd-environment.js";

const sourceDir = process.argv[2] ?? "copilot-studio/company-agent";
const targetDir = process.argv[3] ?? ".azure/companyagent-dev/copilot-workspace";

await access(join(sourceDir, "agent.mcs.yml"));
await access(join(targetDir, ".mcs", "conn.json"));

async function moveToStale(targetPath: string, staleRoot: string, relativePath: string): Promise<void> {
  let destination = join(staleRoot, relativePath);
  try {
    await access(destination);
    destination = join(staleRoot, `${relativePath}-${Date.now()}`);
  } catch {
    // The stale destination is available.
  }
  await mkdir(dirname(destination), { recursive: true });
  await rename(targetPath, destination);
}

async function quarantineExtras(sourcePath: string, targetPath: string, staleRoot: string, relativePath = ""): Promise<void> {
  const sourceEntries = new Set((await readdir(sourcePath, { withFileTypes: true })).map((entry) => entry.name));
  for (const entry of await readdir(targetPath, { withFileTypes: true })) {
    if (entry.name === ".mcs" || entry.name.startsWith(".stale-")) continue;
    const targetEntryPath = join(targetPath, entry.name);
    const sourceEntryPath = join(sourcePath, entry.name);
    const entryRelativePath = relativePath ? join(relativePath, entry.name) : entry.name;
    if (!sourceEntries.has(entry.name)) {
      await moveToStale(targetEntryPath, staleRoot, entryRelativePath);
    } else if (entry.isDirectory()) {
      const sourceEntry = (await readdir(sourcePath, { withFileTypes: true })).find((candidate) => candidate.name === entry.name);
      if (sourceEntry?.isDirectory()) await quarantineExtras(sourceEntryPath, targetEntryPath, staleRoot, entryRelativePath);
    }
  }
}

await quarantineExtras(sourceDir, targetDir, join(targetDir, ".stale-source-files"));

for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
  if (entry.name === ".mcs") continue;
  await cp(join(sourceDir, entry.name), join(targetDir, entry.name), { recursive: true, force: true });
}

const agentRoot = join(targetDir, "agents");
const sourceAgentRoot = join(sourceDir, "agents");
const sourceAgentDirectories = new Set(
  (await readdir(sourceAgentRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
);
const staleAgentRoot = join(targetDir, ".stale-agents");
await mkdir(staleAgentRoot, { recursive: true });
for (const entry of await readdir(agentRoot, { withFileTypes: true })) {
  if (entry.isDirectory() && !sourceAgentDirectories.has(entry.name)) {
    let stalePath = join(staleAgentRoot, entry.name);
    try {
      await access(stalePath);
      stalePath = join(staleAgentRoot, `${entry.name}-${Date.now()}`);
    } catch {
      // The stale destination is available.
    }
    await rename(join(agentRoot, entry.name), stalePath);
  }
}

const connectorRoot = join(targetDir, "connectors");
const sourceConnectorRoot = join(sourceDir, "connectors");
const sourceConnectorDirectories = new Set(
  (await readdir(sourceConnectorRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
);
const staleRoot = join(targetDir, ".stale-connectors");
await mkdir(staleRoot, { recursive: true });
for (const entry of await readdir(connectorRoot, { withFileTypes: true })) {
  if (entry.isDirectory() && !sourceConnectorDirectories.has(entry.name)) {
    let stalePath = join(staleRoot, entry.name);
    try {
      await access(stalePath);
      stalePath = join(staleRoot, `${entry.name}-${Date.now()}`);
    } catch {
      // The stale destination is available.
    }
    await rename(join(connectorRoot, entry.name), stalePath);
  }
}
const connectorDirectory = (await readdir(connectorRoot, { withFileTypes: true })).find((entry) => entry.isDirectory());
if (!connectorDirectory) throw new Error(`${targetDir}: no connector directory found after merge.`);
const openApiPath = join(connectorRoot, connectorDirectory.name, "openapidefinition.json");
const azdEnvironment = await readAzdEnvironment();
const apiUrl = process.env.COMPANY_AGENT_API_URL ?? azdEnvironment.COMPANY_AGENT_API_URL ?? azdEnvironment.apiUrl ?? "";
if (!apiUrl) throw new Error("COMPANY_AGENT_API_URL is required to materialize the deployment workspace.");
const host = new URL(apiUrl).hostname;
const openApi = (await readFile(openApiPath, "utf8")).replace(/^\uFEFF/, "");
await writeFile(openApiPath, openApi.replaceAll("${COMPANY_AGENT_API_HOST}", host));

console.log(`Merged ${sourceDir} into PAC sync workspace ${targetDir}; preserved target .mcs metadata.`);
