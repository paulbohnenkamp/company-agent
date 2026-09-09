import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

test("Workroom run proxy defaults to the ASP.NET Core development port", async () => {
  const source = await readFile(new URL("../app/api/landops/workroom/run/route.ts", import.meta.url), "utf8");
  assert.match(source, /127\.0\.0\.1:5006/);
  assert.match(source, /dotnetBaseUrl\(\)/);
});
