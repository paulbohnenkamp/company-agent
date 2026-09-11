/**
 * Provisions the synthetic employee catalog into Entra using Azure CLI.
 *
 * Safe default: prints a plan only. Real creation requires --apply,
 * --tenant-id, --upn-domain, and LANDOPS_TEMP_PASSWORD. Never put the
 * password in JSON or source control. The catalog's .example domain is
 * intentionally valid for demos only and is rejected for real creation.
 */
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

type Catalog = { emailDomain: string; personas: Array<{ id: string; displayName: string; jobTitle: string; groupIds: string[] }> };
const catalog = JSON.parse(await readFile("config/identity/personas.json", "utf8")) as Catalog;
const apply = process.argv.includes("--apply");
const tenantIndex = process.argv.indexOf("--tenant-id");
const tenantId = tenantIndex >= 0 ? process.argv[tenantIndex + 1] : process.env.LANDOPS_ENTRA_TENANT_ID;
const domainIndex = process.argv.indexOf("--upn-domain");
const upnDomain = domainIndex >= 0 ? process.argv[domainIndex + 1] : catalog.emailDomain;
const password = process.env.LANDOPS_TEMP_PASSWORD;
if (apply && (!tenantId || !password || !upnDomain || upnDomain.endsWith(".example"))) {
  throw new Error("Apply requires --tenant-id (or LANDOPS_ENTRA_TENANT_ID), --upn-domain for a verified tenant domain, and LANDOPS_TEMP_PASSWORD.");
}

const run = (args: string[]) => {
  if (!apply) { console.log(`az ${args.map((arg) => JSON.stringify(arg)).join(" ")}`); return "dry-run-id"; }
  return execFileSync("az", args, { encoding: "utf8" }).trim();
};

const lookup = (args: string[]) => apply ? execFileSync("az", args, { encoding: "utf8" }).trim() : "<resolved-id-in-apply-mode>";

if (apply) {
  const currentTenant = execFileSync("az", ["account", "show", "--query", "tenantId", "-o", "tsv"], { encoding: "utf8" }).trim();
  if (currentTenant !== tenantId) throw new Error(`Azure CLI is logged into tenant ${currentTenant}, not requested tenant ${tenantId}.`);
  console.log(`Target tenant: ${tenantId}`);
}
for (const persona of catalog.personas) {
  const upn = `${persona.id.replaceAll("-", ".")}@${upnDomain}`;
  if (apply) {
    try { lookup(["ad", "user", "show", "--id", upn, "--query", "id", "-o", "tsv"]); }
    catch { run(["ad", "user", "create", "--display-name", persona.displayName, "--user-principal-name", upn, "--password", password ?? "", "--force-change-password-next-sign-in", "true", "--mail-nickname", persona.id]); }
  } else run(["ad", "user", "create", "--display-name", persona.displayName, "--user-principal-name", upn, "--password", "<LANDOPS_TEMP_PASSWORD>", "--force-change-password-next-sign-in", "true", "--mail-nickname", persona.id]);
  const userId = lookup(["ad", "user", "show", "--id", upn, "--query", "id", "-o", "tsv"]);
  for (const groupId of persona.groupIds) {
    const groupName = `Company Agent ${groupId}`;
    if (apply) {
      try { lookup(["ad", "group", "show", "--group", groupName, "--query", "id", "-o", "tsv"]); }
      catch { run(["ad", "group", "create", "--display-name", groupName, "--mail-nickname", groupId]); }
    } else run(["ad", "group", "create", "--display-name", groupName, "--mail-nickname", groupId]);
    run(["ad", "group", "member", "add", "--group", groupName, "--member-id", userId]);
  }
}
console.log(apply ? "Entra persona provisioning commands completed. Review groups and force password rotation." : "Dry run only. Add --apply and the required tenant/password inputs to create users.");
