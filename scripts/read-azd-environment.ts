import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type AzdEnvironment = Readonly<Record<string, string>>;

export async function readAzdEnvironment(environmentName = process.env.AZURE_ENV_NAME ?? "companyagent-dev"): Promise<AzdEnvironment> {
  try {
    const source = await readFile(join(".azure", environmentName, ".env"), "utf8");
    return Object.fromEntries(
      source
        .split(/\r?\n/)
        .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(?:"([^"]*)"|'([^']*)'|(.*))$/))
        .filter((match): match is RegExpMatchArray => match !== null)
        .map((match) => [match[1], match[2] ?? match[3] ?? match[4] ?? ""]),
    );
  } catch {
    return {};
  }
}
