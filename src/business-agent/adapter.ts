type DotnetCase = { caseId: string; title: string; jurisdiction: string; isSynthetic: boolean; authorityBoundary: string; wells: { apiNumber: string; county: string; wellNumber: string }[]; submittedEvidence: { evidenceId: string; kind: string; description: string; isSynthetic: boolean }[] };
type DotnetEvidence = { evidenceId: string; source: { id: string; publisher: string; dataset: string; authorityScope: string }; sourceRecordId: string; sourceUrl: string; normalizedFacts: Record<string, unknown> };
type DotnetStep = { agentId: string; order: number; status: string; artifactJson: string };
type DotnetFinding = { id: string; subject: string; assertion: string; status: string; confidence: string; evidenceIdsJson: string; conflictIdsJson: string; unknownIdsJson: string; provenanceJson: string };
type DotnetConflict = { id: string; subject: string; reason: string; status: string; claimsJson: string };
type DotnetUnknown = { id: string; subject: string; question: string; reason: string; neededEvidenceJson: string };
type DotnetSynthesis = { summary: string; proposedRoute: string };
type DotnetRun = { runId: string; steps: DotnetStep[]; findings: DotnetFinding[]; conflicts: DotnetConflict[]; unknowns: DotnetUnknown[]; synthesis?: DotnetSynthesis };
type DotnetCompany = {
  companyId: string;
  companyName: string;
  description: string;
  isSynthetic: boolean;
  dataNotice: string;
  departments: { id: string; name: string; shortName: string }[];
  roles: { id: string; name: string; departmentId: string; description: string }[];
  groups: { id: string; name: string; description: string; departmentIds: string[] }[];
  agents: { id: string; name: string; departmentId: string; purpose: string }[];
  workflows: { id: string; name: string; description: string; status: string }[];
  cases: { caseId: string; title: string; jurisdiction: string; status: string; primaryWorkflow: string; isSynthetic: boolean }[];
};
type DotnetScenario = {
  id: string;
  roleId: string;
  roleName: string;
  question: string;
  description: string;
  agentIds: string[];
  evidenceTypes: string[];
  escalatesToWorkroom: boolean;
  humanOutcome: string;
  requiredGroup: string;
};
type DotnetDelegationPlan = {
  scenarioId: string;
  surface: string;
  requiredGroup: string;
  steps: { agentId: string; kind: string; order: number; delegatedFrom?: string | null }[];
  humanBoundary: string;
};

function parseJson<T>(value: string, field: string): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(`Business Agent API returned invalid ${field}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** Converts the C# case contract into the view model used by the React page. */
export function mapCase(value: DotnetCase, evidence: DotnetEvidence[] = []) {
  const well = value.wells[0];
  return { caseId: value.caseId, fixtureId: "braxton-4700701733", submittedPackage: { synthetic: value.isSynthetic, clues: { apiNumber: well?.apiNumber ?? "4700701733", county: well?.county ?? "Braxton", wellNumber: well?.wellNumber ?? "3-S-245" } }, snapshots: [], evidence, production: { explanation: "No matching production evidence was found in the frozen 2025 workbook; that is not reported zero production." }, titleBoundary: value.authorityBoundary };
}

/** Converts the C# portfolio contract into the browser's company view model. */
export function mapCompany(value: DotnetCompany) {
  return value;
}

/** Keeps the role-question contract explicit at the browser boundary. */
export function mapScenarios(value: DotnetScenario[]) {
  return value;
}

export function mapDelegationPlan(value: DotnetDelegationPlan) {
  return value;
}

/** Maps a stored C# workflow run into the screen's aggregate shape. */
export function mapRun(value: DotnetRun) {
  return {
    runId: value.runId,
    result: {
      steps: value.steps.map((step) => ({
        stepId: step.agentId,
        status: step.status,
        artifact: { kind: step.agentId === "land-case-intake" ? "intake" : step.agentId === "land-well-reconciler" ? "reconciliation" : "synthesis" },
      })),
      findings: value.findings.map((finding) => ({
        findingId: finding.id,
        subject: finding.subject,
        assertion: finding.assertion,
        status: finding.status,
        confidence: finding.confidence,
        evidenceIds: parseJson<string[]>(finding.evidenceIdsJson, "finding evidence references"),
        conflictIds: parseJson<string[]>(finding.conflictIdsJson, "finding conflict references"),
        unknownIds: parseJson<string[]>(finding.unknownIdsJson, "finding unknown references"),
        provenance: parseJson<{ stepId: string; producerVersion: string }>(finding.provenanceJson, "finding provenance"),
      })),
      conflicts: value.conflicts.map((conflict) => ({
        conflictId: conflict.id,
        subject: conflict.subject,
        reason: conflict.reason,
        status: conflict.status,
        claims: parseJson<{ value: unknown; evidenceIds: string[] }[]>(conflict.claimsJson, "conflict claims"),
      })),
      unknowns: value.unknowns.map((unknown) => ({
        unknownId: unknown.id,
        subject: unknown.subject,
        question: unknown.question,
        reason: unknown.reason,
        neededEvidence: parseJson<string[]>(unknown.neededEvidenceJson, "unknown evidence requirements"),
      })),
      synthesis: value.synthesis ? { synthesis: value.synthesis.summary, proposedRoute: value.synthesis.proposedRoute } : undefined,
    },
  };
}

export function dotnetBaseUrl(): string | undefined {
  const value = (process.env.BUSINESS_AGENT_API_URL ?? process.env.LANDOPS_API_URL)?.trim().replace(/\/$/, "");
  return value || undefined;
}
