import { spawn } from "node:child_process";

export type PacCommand = {
  id: string;
  kind: "pack" | "create-settings" | "check" | "list" | "import" | "publish" | "upgrade";
  args: string[];
  cwd?: string;
  mutation: "none" | "requires-apply";
  dependsOn: string[];
};

export type PacResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export interface PacRunner {
  run(command: PacCommand): Promise<PacResult>;
}

export type SolutionCommandInputs = {
  resourceSolutionFolder: string;
  resourceSolutionZip: string;
  agentSolutionFolder: string;
  agentSolutionZip: string;
  resourceSettingsFile: string;
  agentSettingsFile: string;
  environment: string;
};

function command(input: Omit<PacCommand, "mutation" | "dependsOn"> & { mutation?: PacCommand["mutation"]; dependsOn?: string[] }): PacCommand {
  return { ...input, mutation: input.mutation ?? "none", dependsOn: input.dependsOn ?? [] };
}

export function buildReleaseCommandPlan(inputs: SolutionCommandInputs): PacCommand[] {
  const resourcePack = command({ id: "pack:resources", kind: "pack", args: ["solution", "pack", "--zipfile", inputs.resourceSolutionZip, "--folder", inputs.resourceSolutionFolder] });
  const agentPack = command({ id: "pack:agents", kind: "pack", args: ["solution", "pack", "--zipfile", inputs.agentSolutionZip, "--folder", inputs.agentSolutionFolder] });
  const resourceSettings = command({ id: "settings:resources", kind: "create-settings", args: ["solution", "create-settings", "--solution-zip", inputs.resourceSolutionZip, "--settings-file", inputs.resourceSettingsFile], dependsOn: [resourcePack.id] });
  const agentSettings = command({ id: "settings:agents", kind: "create-settings", args: ["solution", "create-settings", "--solution-zip", inputs.agentSolutionZip, "--settings-file", inputs.agentSettingsFile], dependsOn: [agentPack.id] });
  const resourceCheck = command({ id: "check:resources", kind: "check", args: ["solution", "check", "--path", inputs.resourceSolutionZip], dependsOn: [resourcePack.id] });
  const agentCheck = command({ id: "check:agents", kind: "check", args: ["solution", "check", "--path", inputs.agentSolutionZip], dependsOn: [agentPack.id] });
  const resourceImport = command({ id: "import:resources", kind: "import", args: ["solution", "import", "--environment", inputs.environment, "--path", inputs.resourceSolutionZip, "--settings-file", inputs.resourceSettingsFile], mutation: "requires-apply", dependsOn: [resourceSettings.id, resourceCheck.id] });
  const agentImport = command({ id: "import:agents", kind: "import", args: ["solution", "import", "--environment", inputs.environment, "--path", inputs.agentSolutionZip, "--settings-file", inputs.agentSettingsFile], mutation: "requires-apply", dependsOn: [agentSettings.id, agentCheck.id, resourceImport.id] });
  const publish = command({ id: "publish:product", kind: "publish", args: ["solution", "publish", "--environment", inputs.environment], mutation: "requires-apply", dependsOn: [agentImport.id] });
  return [resourcePack, agentPack, resourceSettings, agentSettings, resourceCheck, agentCheck, resourceImport, agentImport, publish].sort((left, right) => left.id.localeCompare(right.id));
}

export class LocalPacRunner implements PacRunner {
  public async run(commandToRun: PacCommand): Promise<PacResult> {
    return new Promise((resolve, reject) => {
      const child = spawn("pac", commandToRun.args, { cwd: commandToRun.cwd, stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
      child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
      child.once("error", reject);
      child.once("close", (exitCode) => resolve({ exitCode: exitCode ?? 1, stdout, stderr }));
    });
  }
}

export async function executePacCommand(options: { command: PacCommand; runner: PacRunner; apply: boolean }): Promise<PacResult> {
  if (options.command.mutation === "requires-apply" && !options.apply) {
    throw new Error(`Mutation command ${options.command.id} requires --apply.`);
  }
  return options.runner.run(options.command);
}

export function formatPacCommandPlan(commands: PacCommand[]): string {
  return commands.map((entry) => `${entry.id} [${entry.mutation}] pac ${entry.args.join(" ")}${entry.dependsOn.length > 0 ? ` <- ${entry.dependsOn.join(",")}` : ""}`).join("\n");
}
