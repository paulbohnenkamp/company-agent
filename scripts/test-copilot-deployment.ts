/** Runs the published Company Agent through Direct Line and checks API evidence. */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { InteractiveBrowserCredential } from "@azure/identity";
import { AgentType, ConnectionSettings, CopilotStudioClient, ScopeHelper } from "@microsoft/agents-copilotstudio-client";
import { readAzdEnvironment } from "./read-azd-environment.js";

type JsonRecord = Record<string, unknown>;

type Activity = JsonRecord & {
  id: string;
  type: string;
  text: string;
  fromId: string;
};

type TestCase = {
  id: "land" | "hr";
  question: string;
  apiPath: string;
  landmarks: RegExp[];
};

const environmentName = process.env.AZURE_ENV_NAME ?? "companyagent-dev";
const environment = await readAzdEnvironment(environmentName);
const tokenEndpoint = process.env.COPILOT_DIRECT_LINE_TOKEN_ENDPOINT ?? environment.COPILOT_DIRECT_LINE_TOKEN_ENDPOINT ?? "";
const directLineSecret = process.env.COPILOT_DIRECT_LINE_SECRET ?? environment.COPILOT_DIRECT_LINE_SECRET ?? "";
const agentsSdkConnectionString = process.env.COPILOT_AGENTS_SDK_CONNECTION_STRING ?? environment.COPILOT_AGENTS_SDK_CONNECTION_STRING ?? "";
const e2eClientId = process.env.COPILOT_E2E_CLIENT_ID ?? environment.COPILOT_E2E_CLIENT_ID ?? "";
const tenantId = process.env.COPILOT_TENANT_ID ?? environment.COPILOT_TENANT_ID ?? "";
const redirectUri = process.env.COPILOT_E2E_REDIRECT_URI ?? environment.COPILOT_E2E_REDIRECT_URI ?? "http://localhost";
const appInsightsName = process.env.COMPANY_AGENT_APP_INSIGHTS_NAME ?? environment.COMPANY_AGENT_APP_INSIGHTS_NAME ?? environment.applicationInsightsName ?? environment.APPLICATION_INSIGHTS_NAME ?? "";
const resourceGroup = process.env.AZURE_RESOURCE_GROUP ?? environment.AZURE_RESOURCE_GROUP ?? "";
const timeoutMs = Number(process.env.COPILOT_E2E_TIMEOUT_SECONDS ?? environment.COPILOT_E2E_TIMEOUT_SECONDS ?? "90") * 1000;
const runId = `company-agent-e2e-${new Date().toISOString().replace(/[-:.TZ]/g, "")}`;
const outputDir = join(".azure", environmentName, "copilot-e2e");
const directLineBase = "https://directline.botframework.com/v3/directline";

const cases: TestCase[] = [
  {
    id: "land",
    question: "List the available land cases.",
    apiPath: "/api/v1/company",
    landmarks: [/case/i, /available|synthetic|blue ridge/i],
  },
  {
    id: "hr",
    question: "What is our vacation policy, and how do I request time off?",
    apiPath: "/api/v1/hr/policies/vacation",
    landmarks: [/vacation/i, /manager|time[- ]off|request/i],
  },
];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON from ${response.url}; received HTTP ${response.status}.`);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${response.url}: ${text.slice(0, 500)}`);
  return value;
}

async function getDirectLineToken(): Promise<{ token: string; conversationId?: string; requiresStart: boolean }> {
  if (!tokenEndpoint && !directLineSecret) {
    throw new Error("Set COPILOT_DIRECT_LINE_TOKEN_ENDPOINT or COPILOT_DIRECT_LINE_SECRET in .azure/<env>/.env.");
  }
  const response = directLineSecret
    ? await fetch(`${directLineBase}/tokens/generate`, { method: "POST", headers: { Authorization: `Bearer ${directLineSecret}` } })
    : await fetch(tokenEndpoint);
  const body = await readJson(response);
  if (!isRecord(body)) throw new Error("Direct Line token response was not an object.");
  const token = stringField(body, "token");
  if (!token) throw new Error("Direct Line token response did not contain a token.");
  return {
    token,
    conversationId: stringField(body, "conversationId"),
    // Token generation alone does not open a usable Direct Line conversation.
    requiresStart: Boolean(directLineSecret),
  };
}

async function startConversation(token: string, existingConversationId?: string): Promise<string> {
  if (existingConversationId) return existingConversationId;
  const response = await fetch(`${directLineBase}/conversations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await readJson(response);
  if (!isRecord(body)) throw new Error("Direct Line conversation response was not an object.");
  const conversationId = stringField(body, "conversationId");
  if (!conversationId) throw new Error("Direct Line conversation response did not contain a conversationId.");
  return conversationId;
}

async function sendQuestion(token: string, conversationId: string, question: string, userId: string): Promise<void> {
  const response = await fetch(`${directLineBase}/conversations/${conversationId}/activities`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "message",
      from: { id: userId, name: "Company Agent deployment E2E" },
      text: question,
      locale: "en-US",
      channelData: { companyAgentE2eRunId: runId },
    }),
  });
  await readJson(response);
}

function parseActivities(body: unknown): Activity[] {
  if (!isRecord(body) || !Array.isArray(body.activities)) return [];
  return body.activities.flatMap((value): Activity[] => {
    if (!isRecord(value)) return [];
    const id = stringField(value, "id");
    const type = stringField(value, "type");
    const text = stringField(value, "text");
    const from = isRecord(value.from) ? stringField(value.from, "id") : undefined;
    if (!id || !type || !text || !from) return [];
    return [{ ...value, id, type, text, fromId: from }];
  });
}

async function collectResponse(token: string, conversationId: string, userId: string, testCase: TestCase): Promise<Activity[]> {
  const deadline = Date.now() + timeoutMs;
  const activities: Activity[] = [];
  const seen = new Set<string>();
  let watermark = "";
  while (Date.now() < deadline) {
    const suffix = watermark ? `?watermark=${encodeURIComponent(watermark)}` : "";
    const response = await fetch(`${directLineBase}/conversations/${conversationId}/activities${suffix}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await readJson(response);
    const page = parseActivities(body);
    for (const activity of page) {
      if (!seen.has(activity.id) && activity.fromId !== userId) {
        seen.add(activity.id);
        activities.push(activity);
      }
    }
    if (isRecord(body)) watermark = stringField(body, "watermark") ?? watermark;
    const responseText = activities.filter((activity) => activity.type === "message").map((activity) => activity.text).join("\n");
    if (testCase.landmarks.every((landmark) => landmark.test(responseText))) return activities;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`${testCase.id} conversation did not produce the expected response landmarks within ${timeoutMs / 1000}s.`);
}

function activityRecord(value: unknown): Activity | undefined {
  if (!isRecord(value)) return undefined;
  const id = stringField(value, "id") ?? `activity-${Math.random()}`;
  const type = stringField(value, "type");
  const text = stringField(value, "text");
  const from = isRecord(value.from) ? stringField(value.from, "id") : undefined;
  if (!type || !text || !from) return undefined;
  return { ...value, id, type, text, fromId: from };
}

async function runAuthenticatedConversation(testCase: TestCase): Promise<{ conversationId: string; activities: Activity[] }> {
  if (!agentsSdkConnectionString || !e2eClientId || !tenantId) {
    throw new Error("Authenticated Copilot Studio E2E requires COPILOT_AGENTS_SDK_CONNECTION_STRING, COPILOT_E2E_CLIENT_ID, and COPILOT_TENANT_ID.");
  }
  const settings = new ConnectionSettings({ directConnectUrl: agentsSdkConnectionString, copilotAgentType: AgentType.Published });
  const scope = ScopeHelper.getScopeFromSettings(settings);
  const credential = new InteractiveBrowserCredential({
    tenantId,
    clientId: e2eClientId,
    redirectUri,
    disableAutomaticAuthentication: true,
  });
  console.log(`\nA browser sign-in will open for the E2E app. Redirect URI: ${redirectUri}`);
  await credential.authenticate(scope);
  const accessToken = await credential.getToken(scope);
  if (!accessToken) throw new Error("Entra did not return a Power Platform access token.");
  const client = new CopilotStudioClient(settings, accessToken.token);
  const started = await client.startConversationWithResponse();
  const response = await client.askQuestionAsync(testCase.question, started.conversationId);
  const activities = response.flatMap((activity) => activityRecord(activity) ? [activityRecord(activity)!] : []);
  const responseText = activities.filter((activity) => activity.type === "message").map((activity) => activity.text).join("\n");
  if (!testCase.landmarks.every((landmark) => landmark.test(responseText))) {
    throw new Error(`${testCase.id} authenticated conversation did not produce the expected response landmarks.`);
  }
  return { conversationId: started.conversationId, activities };
}

async function runAzQuery(query: string): Promise<unknown> {
  return await new Promise<unknown>((resolve, reject) => {
    const child = spawn("az", ["monitor", "app-insights", "query", "--apps", appInsightsName, "--resource-group", resourceGroup, "--analytics-query", query, "--output", "json"], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code !== 0) return reject(new Error(`Application Insights query failed: ${stderr.trim()}`));
      try { resolve(JSON.parse(stdout)); } catch { reject(new Error("Application Insights query did not return JSON.")); }
    });
  });
}

function hasRows(value: unknown): boolean {
  if (!isRecord(value) || !Array.isArray(value.tables)) return false;
  return value.tables.some((table) => isRecord(table) && Array.isArray(table.rows) && table.rows.length > 0);
}

if (!appInsightsName || !resourceGroup) throw new Error("COMPANY_AGENT_APP_INSIGHTS_NAME and AZURE_RESOURCE_GROUP are required for API correlation.");
const results: JsonRecord[] = [];
const testMode = agentsSdkConnectionString ? "authenticated-agents-sdk" : "direct-line";
for (const testCase of cases) {
  const startedAt = new Date().toISOString();
  let conversationId: string;
  let activities: Activity[];
  if (agentsSdkConnectionString) {
    ({ conversationId, activities } = await runAuthenticatedConversation(testCase));
  } else {
    const { token, conversationId: tokenConversationId, requiresStart } = await getDirectLineToken();
    conversationId = await startConversation(token, requiresStart ? undefined : tokenConversationId);
    const userId = `${runId}-${testCase.id}`;
    await sendQuestion(token, conversationId, testCase.question, userId);
    activities = await collectResponse(token, conversationId, userId, testCase);
  }
  const endedAt = new Date().toISOString();
  const query = `requests | where timestamp between (datetime('${startedAt}') .. datetime('${endedAt}')) | where url has '${testCase.apiPath}' | project timestamp, name, url, resultCode, success | order by timestamp asc`;
  const telemetry = await runAzQuery(query);
  if (!hasRows(telemetry)) throw new Error(`${testCase.id} response passed landmarks, but no ${testCase.apiPath} request was found in Application Insights.`);
  const transcript = activities
    .filter((activity) => activity.type === "message")
    .map((activity) => `${activity.fromId}: ${activity.text}`)
    .join("\n");
  console.log(`\n[${testCase.id}] conversationId=${conversationId}\n${transcript}`);
  results.push({ id: testCase.id, mode: testMode, question: testCase.question, conversationId, startedAt, endedAt, activities, apiPath: testCase.apiPath, telemetry });
}

await mkdir(outputDir, { recursive: true });
const resultPath = join(outputDir, `${runId}.json`);
await writeFile(resultPath, `${JSON.stringify({ runId, environmentName, cases: results }, null, 2)}\n`);
console.log(`Copilot Studio E2E passed for Land Agent and HR Agent using ${testMode}. Evidence: ${resultPath}`);
