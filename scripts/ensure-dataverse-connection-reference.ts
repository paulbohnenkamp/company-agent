import { AzureCliCredential, InteractiveBrowserCredential } from "@azure/identity";
import { spawn } from "node:child_process";

type ConnectionReference = { connectionreferenceid: string };

type Options = {
  dataverseUrl: string;
  tenantId: string;
  solutionName: string;
  logicalName: string;
  displayName: string;
  provider: string;
};

async function pac(args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("pac", args, { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`pac ${args[0]} failed with exit code ${code ?? "unknown"}.`)));
  });
}

export async function ensureDataverseConnectionReference(options: Options): Promise<string> {
  const dataverseUrl = options.dataverseUrl.replace(/\/+$/, "");
  // Reuse the operator's existing az login. InteractiveBrowserCredential can
  // hang in headless/remote shells, while AzureCliCredential is explicit and
  // works with the same tenant session used for PAC administration.
  const credential = process.env.DATAVERSE_INTERACTIVE === "true"
    ? new InteractiveBrowserCredential({
      tenantId: options.tenantId,
      clientId: process.env.DATAVERSE_CLIENT_ID,
      loginHint: process.env.DATAVERSE_LOGIN_HINT,
    })
    : new AzureCliCredential();
  let token;
  try {
    token = await credential.getToken(`${dataverseUrl}/.default`);
  } catch (error) {
    throw new Error(`Dataverse authentication failed. Run az login for tenant ${options.tenantId}, then retry. ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!token) throw new Error("Could not acquire a Dataverse access token.");
  const headers = {
    Authorization: `Bearer ${token.token}`,
    Accept: "application/json",
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    "Content-Type": "application/json; charset=utf-8",
  };
  const filter = encodeURIComponent(`connectionreferencelogicalname eq '${options.logicalName.replaceAll("'", "''")}'`);
  const lookup = await fetch(`${dataverseUrl}/api/data/v9.2/connectionreferences?$select=connectionreferenceid&$filter=${filter}`, { headers });
  if (!lookup.ok) throw new Error(`Dataverse connection-reference lookup failed (${lookup.status}): ${await lookup.text()}`);
  const existing = (await lookup.json()) as { value?: ConnectionReference[] };
  const existingId = existing.value?.[0]?.connectionreferenceid;
  let entityId = existingId;
  if (!entityId) {
    const response = await fetch(`${dataverseUrl}/api/data/v9.2/connectionreferences`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        connectionreferencelogicalname: options.logicalName,
        connectionreferencedisplayname: options.displayName,
        connectorid: `/providers/Microsoft.PowerApps/apis/${options.provider}`,
      }),
    });
    if (!response.ok) throw new Error(`Dataverse connection-reference creation failed (${response.status}): ${await response.text()}`);
    entityId = response.headers.get("OData-EntityId")?.match(/\(([0-9a-f-]+)\)/i)?.[1];
    if (!entityId) throw new Error("Dataverse created the connection reference but returned no entity ID.");
  }
  await pac(["solution", "add-solution-component", "--environment", options.dataverseUrl, "--solutionUniqueName", options.solutionName, "--component", entityId, "--componentType", "connectionreference"]);
  return entityId;
}
