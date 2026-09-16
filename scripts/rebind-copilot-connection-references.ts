import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.argv[2] ?? "copilot-studio/company-agent";
const oldProviderName = "shared_cr42d-5fland-20read-20api-20preview-20v5-5f10d5d3eec5c5bdb0";
const newProviderName = "shared_new-5fland-20read-20api-20preview-20v5";

async function filesIn(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesIn(path)));
    else if (entry.name.endsWith(".mcs.yml")) files.push(path);
  }
  return files;
}

for (const path of await filesIn(root)) {
  const source = await readFile(path, "utf8");
  const rebound = source
    .split("\n")
    .map((line) =>
      line.includes("connectionReference")
        ? line.replaceAll(newProviderName, oldProviderName)
        : line,
    )
    .join("\n");
  if (rebound !== source) await writeFile(path, rebound);
}

console.log(`Rebound Company Agent connection references in ${root}.`);
