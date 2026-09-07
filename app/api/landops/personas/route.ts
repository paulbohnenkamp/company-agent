import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { IdentityCatalog } from "../../../../src/landops/IdentityCatalog";

/** Reads the checked-in synthetic identity catalog for the local workbench. */
export async function GET() {
  const path = join(process.cwd(), "config", "identity", "personas.json");
  const catalog = JSON.parse(await readFile(path, "utf8")) as IdentityCatalog;
  return Response.json(catalog, { headers: { "cache-control": "no-store" } });
}
