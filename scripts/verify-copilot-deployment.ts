import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { readAzdEnvironment } from "./read-azd-environment.js";

const environmentName = process.env.AZURE_ENV_NAME ?? "companyagent-dev";
const azdEnvironment = await readAzdEnvironment(environmentName);
const environment = process.env.COPILOT_ENVIRONMENT_ID ?? azdEnvironment.COPILOT_ENVIRONMENT_ID;
const agent = process.env.COMPANY_AGENT_ID;
const apiUrl = process.env.COMPANY_AGENT_API_URL ?? azdEnvironment.COMPANY_AGENT_API_URL ?? azdEnvironment.apiUrl;
if (!environment || !agent || !apiUrl) {
  throw new Error("COPILOT_ENVIRONMENT_ID, COMPANY_AGENT_ID, and COMPANY_AGENT_API_URL are required.");
}
const expectedHost = new URL(apiUrl).hostname;

const outputDir = await mkdtemp(join(tmpdir(), "company-agent-verify-"));
const displayName = "CompanyAgentDeploymentVerification";

await new Promise<void>((resolve, reject) => {
  const child = spawn(
    "pac",
    [
      "copilot",
      "clone",
      "--bot",
      agent,
      "--display-name",
      displayName,
      "--output-dir",
      outputDir,
      "--environment",
      environment,
    ],
    { stdio: "inherit" },
  );
  child.once("error", reject);
  child.once("exit", (code) => (code === 0 ? resolve() : reject(new Error(`PAC clone failed with exit code ${code ?? "unknown"}.`))));
});

try {
  const workspace = join(outputDir, displayName);
  const files: string[] = [];
  async function collect(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await collect(path);
      else files.push(path);
    }
  }
  await collect(workspace);
  const contents = await Promise.all(files.map((path) => readFile(path, "utf8")));
  const combined = contents.join("\n");
  if (/Mountaineer|mountaineer|cr42d_/.test(combined)) {
    throw new Error("Deployed Company Agent still contains legacy Mountaineer connector identity.");
  }
  if (!combined.includes(expectedHost)) {
    throw new Error(`Deployed Company Agent does not reference expected API host ${expectedHost}.`);
  }
  if (!combined.includes("getVacationPolicy")) {
    throw new Error("Deployed Company Agent does not contain the governed HR vacation-policy operation.");
  }
  if (!combined.includes("HR Agent")) {
    throw new Error("Deployed Company Agent does not contain the HR Agent child.");
  }
  const actionNames = contents
    .flatMap((content) => [...content.matchAll(/componentName: (.+)/g)].map((match) => match[1].trim()))
    .filter((name) => name.length > 0);
  if (new Set(actionNames).size !== actionNames.length) {
    throw new Error("Deployed Company Agent contains duplicate action display names.");
  }
  console.log(`Verified deployed Company Agent ${agent}: ${actionNames.length} unique actions and API host ${expectedHost}.`);
} finally {
  await rm(outputDir, { recursive: true, force: true });
}
