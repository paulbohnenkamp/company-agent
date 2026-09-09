namespace BusinessAgent.Application;

/// <summary>
/// A role-aware question and its agent-review path. Workroom remains the
/// legacy wire identifier for durable request context; Teams hosts collaboration.
/// </summary>
public sealed record RoleScenario(
    string Id,
    string RoleId,
    string RoleName,
    string Question,
    string Description,
    string[] AgentIds,
    string[] EvidenceTypes,
    bool EscalatesToWorkroom,
    string HumanOutcome)
{
    /// <summary>Seed Entra group for the local demo; production resolves this from claims.</summary>
    public string RequiredGroup => RoleId switch
    {
        "legal-reviewer" => "title-curative-board",
        "division-order-analyst" or "accounting-reviewer" => "division-order-review",
        "lease-analyst" or "compliance-reviewer" => "lease-compliance-review",
        "operations-reviewer" => "development-readiness",
        _ => "case-management"
    };
}

/// <summary>Stable workflow IDs with current catalog labels for API tools and agent output.</summary>
public sealed record CollaborationStep(string AgentId, string Kind, int Order, string? DelegatedFrom)
{
    public string AgentName => CompanyPortfolioSeed.AgentName(AgentId);
    public string? DelegatedFromName => DelegatedFrom is null ? null : CompanyPortfolioSeed.AgentName(DelegatedFrom);
}

public sealed record CollaborationPlan(
    string ScenarioId,
    string Surface,
    string RequiredGroup,
    CollaborationStep[] Steps,
    string HumanBoundary);

public static class RoleScenarioSeed
{
    public static IReadOnlyList<RoleScenario> Current { get; } =
    [
        new("land-ownership-gaps", "land-analyst", "Land Analyst", "What ownership interests do we currently have, and what is still unverified?", "Reconcile known interests and make evidence gaps explicit.", ["ownership-reviewer", "title-chain-reviewer", "case-synthesizer"], ["ownership", "title-chain", "curative"], true, "Ownership-gap review"),
        new("land-parcel-exceptions", "land-analyst", "Land Analyst", "Which parcel or tract exceptions should I review before advancing this matter?", "Group parcel, title, and assignment exceptions by severity.", ["land-case-intake", "title-chain-reviewer", "case-synthesizer"], ["land-package", "title-chain", "assignment"], true, "Assigned exception review"),
        new("lease-development-obligations", "lease-analyst", "Lease Analyst", "What lease obligations could affect the next development decision?", "Extract timing, notice, depth, pooling, and continuous-development obligations.", ["lease-lifecycle-reviewer", "lease-obligation-reviewer", "compliance-reviewer"], ["lease", "ocr", "regulatory"], true, "Lease-obligation checklist"),
        new("lease-expiration-risk", "lease-analyst", "Lease Analyst", "Which leases have expiration or notice risks in the next review period?", "Find dates and notice requirements that need human confirmation.", ["lease-lifecycle-reviewer", "lease-obligation-reviewer"], ["lease", "ocr"], false, "Lease-risk watchlist"),
        new("division-order-readiness", "division-order-analyst", "Division Order Analyst", "Can we prepare a division order from the current ownership evidence?", "Test whether ownership and payee evidence is complete enough for preparation.", ["division-order-preparer", "ownership-reviewer", "title-chain-reviewer"], ["division-order", "ownership", "title-chain"], true, "Division-order preparation review"),
        new("division-order-suspense", "division-order-analyst", "Division Order Analyst", "What evidence is missing before this payee can leave suspense?", "Explain the evidence gap without changing payment status.", ["division-order-preparer", "ownership-reviewer", "case-synthesizer"], ["division-order", "ownership", "curative"], true, "Suspense resolution task"),
        new("legal-curative-blockers", "legal-reviewer", "Legal Reviewer", "What title or curative issues must legal resolve before we rely on this chain?", "Preserve competing claims and identify the documents needed for curative review.", ["title-chain-reviewer", "ownership-reviewer", "case-synthesizer"], ["title-chain", "curative", "heirship"], true, "Legal curative packet"),
        new("legal-lease-questions", "legal-reviewer", "Legal Reviewer", "Which lease clauses need legal interpretation or a document request?", "Find clauses that require legal judgment rather than an automated conclusion.", ["lease-obligation-reviewer", "lease-lifecycle-reviewer"], ["lease", "ocr"], true, "Legal clause review"),
        new("compliance-source-consistency", "compliance-reviewer", "Compliance Reviewer", "Are the lease, well, and public regulatory records consistent enough for compliance review?", "Compare independent records and preserve source disagreement.", ["land-well-reconciler", "lease-obligation-reviewer", "compliance-reviewer"], ["lease", "well-record", "regulatory"], true, "Compliance exception list"),
        new("compliance-obligation-status", "compliance-reviewer", "Compliance Reviewer", "Which compliance obligations are open, satisfied, or not evidenced?", "Separate reported status from missing evidence.", ["lease-obligation-reviewer", "compliance-reviewer"], ["lease", "regulatory", "inspection"], false, "Compliance status review"),
        new("accounting-suspense-reason", "accounting-reviewer", "Accounting Reviewer", "Why is this interest in suspense, and what evidence would clear it?", "Trace a suspense reason to ownership, title, and division-order evidence.", ["division-order-preparer", "ownership-reviewer", "case-synthesizer"], ["division-order", "ownership", "payment-status"], true, "Suspense resolution task"),
        new("accounting-payee-conflict", "accounting-reviewer", "Accounting Reviewer", "Do the current payee and ownership records agree?", "Identify conflicts without recommending a payment change.", ["division-order-preparer", "ownership-reviewer"], ["division-order", "ownership"], true, "Payee conflict review"),
        new("operations-development-readiness", "operations-reviewer", "Operations Reviewer", "What is blocking the development-readiness gate for this tract?", "Coordinate lease, title, and compliance checks into one readiness board.", ["lease-obligation-reviewer", "title-chain-reviewer", "compliance-reviewer", "case-synthesizer"], ["lease", "title-chain", "regulatory"], true, "Development-readiness gate"),
        new("operations-well-identity", "operations-reviewer", "Operations Reviewer", "Do the submitted well details match the independent public records?", "Compare well identity while preserving authority boundaries.", ["land-case-intake", "land-well-reconciler", "case-synthesizer"], ["land-package", "well-record", "regulatory"], true, "Well-identity review"),
        new("case-next-action", "case-manager", "Case Manager", "What is blocking this matter, who owns the next step, and what should I do today?", "Summarize open conflicts, unknowns, and accountable next actions.", ["case-synthesizer"], ["case", "findings", "review"], true, "Assigned work thread"),
        new("case-review-summary", "case-manager", "Case Manager", "Give me a concise review summary with the evidence I should open first.", "Create a role-aware case briefing without making a consequential decision.", ["case-synthesizer"], ["case", "evidence", "findings"], false, "Case briefing"),
    ];

    public static CollaborationPlan? PlanFor(string scenarioId)
    {
        var scenario = Current.SingleOrDefault(item => item.Id == scenarioId);
        if (scenario is null) return null;
        return new CollaborationPlan(
            scenario.Id,
            scenario.EscalatesToWorkroom ? "workroom" : "copilot",
            scenario.RequiredGroup,
            scenario.AgentIds.Select((agentId, index) => new CollaborationStep(agentId, index == 0 ? "requested" : "delegated", index + 1, index == 0 ? null : scenario.AgentIds[index - 1])).ToArray(),
            scenario.HumanOutcome);
    }
}
