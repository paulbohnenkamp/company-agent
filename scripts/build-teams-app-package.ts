import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const templatePath = resolve("teams-app/manifest.template.json");
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Options = {
  appId?: string;
  botAppId?: string;
  endpoint?: string;
  webUrl?: string;
  colorIcon?: string;
  outlineIcon?: string;
  output?: string;
  validateOnly: boolean;
};

function main(): void {
  const options = parseOptions(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const manifest = renderManifest(options);
  validateManifest(manifest);
  validateHttpsUrl(options.endpoint!, "endpoint");
  validatePng(options.colorIcon!, "color icon");
  validatePng(options.outlineIcon!, "outline icon");

  if (options.validateOnly) {
    console.log("Teams app manifest and icon inputs are valid.");
    return;
  }

  const output = resolve(options.output ?? "dist/landops-teams-app.zip");
  const staging = mkdtempSync(join(tmpdir(), "landops-teams-app-"));
  try {
    writeFileSync(join(staging, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    copyFileSync(resolve(options.colorIcon!), join(staging, "color.png"));
    copyFileSync(resolve(options.outlineIcon!), join(staging, "outline.png"));
    mkdirSync(dirname(output), { recursive: true });
    execFileSync("zip", ["-q", "-j", output, "manifest.json", "color.png", "outline.png"], { cwd: staging });
    console.log(`Teams app package written to ${output}`);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

function parseOptions(args: string[]): Options & { help: boolean } {
  const values = new Map<string, string>();
  let validateOnly = false;
  let help = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--validate-only") {
      validateOnly = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (!arg.startsWith("--") || index + 1 >= args.length) {
      throw new Error(`Unknown or incomplete option: ${arg}`);
    }
    values.set(arg.slice(2), args[++index]);
  }
  if (help) return { validateOnly, help };
  return {
    appId: required(values, "app-id"),
    botAppId: required(values, "bot-app-id"),
    endpoint: required(values, "endpoint"),
    webUrl: required(values, "web-url"),
    colorIcon: required(values, "color-icon"),
    outlineIcon: required(values, "outline-icon"),
    output: values.get("output"),
    validateOnly,
    help,
  };
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name);
  if (!value) throw new Error(`Missing required option: --${name}`);
  return value;
}

function renderManifest(options: Options): Record<string, unknown> {
  const template = readFileSync(templatePath, "utf8");
  return JSON.parse(template
    .replaceAll("{{TEAMS_APP_ID}}", options.appId!)
    .replaceAll("{{TEAMS_BOT_APP_ID}}", options.botAppId!)
    .replaceAll("{{LANDOPS_WEB_URL}}", options.webUrl!));
}

function validateManifest(manifest: Record<string, unknown>): void {
  const appId = manifest.id;
  const developer = manifest.developer as Record<string, unknown>;
  const bots = manifest.bots as Array<Record<string, unknown>>;
  const botId = bots?.[0]?.botId;
  if (typeof appId !== "string" || !uuidPattern.test(appId)) throw new Error("Teams app ID must be a GUID");
  if (typeof botId !== "string" || !uuidPattern.test(botId)) throw new Error("Teams bot app ID must be a GUID");
  for (const field of ["websiteUrl", "privacyUrl", "termsOfUseUrl"]) {
    validateHttpsUrl(developer?.[field], field);
  }
  const scopes = bots?.[0]?.scopes;
  if (!Array.isArray(scopes) || !["personal", "team", "groupchat"].every((scope) => scopes.includes(scope))) {
    throw new Error("The bot must declare personal, team, and groupchat scopes");
  }
}

function validateHttpsUrl(value: unknown, label: string): void {
  if (typeof value !== "string" || !value.startsWith("https://")) throw new Error(`${label} must be an HTTPS URL`);
  try {
    new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL`);
  }
}

function validatePng(filePath: string, label: string): void {
  const resolved = resolve(filePath);
  if (!existsSync(resolved)) throw new Error(`${label} does not exist: ${filePath}`);
  const header = readFileSync(resolved).subarray(0, 8);
  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!header.equals(pngHeader)) throw new Error(`${label} is not a PNG file: ${filePath}`);
}

function printHelp(): void {
  console.log(`Build the minimal LandOps Teams app package.

Required options:
  --app-id <guid>          Teams app ID
  --bot-app-id <guid>      Entra bot application ID
  --endpoint <https-url>   Public bot messaging endpoint
  --web-url <https-url>    LandOps web URL
  --color-icon <path>      Color PNG icon
  --outline-icon <path>    Outline PNG icon

Optional:
  --output <path>          ZIP output (default: dist/landops-teams-app.zip)
  --validate-only          Validate inputs without creating a ZIP
  --help                   Show this help
`);
}

main();
