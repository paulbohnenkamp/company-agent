namespace BusinessAgent.Application;

/// <summary>
/// The small read-only company contract used by the first portfolio shell.
/// It is deliberately separate from authentication so local demo identities
/// and future Microsoft Entra app roles can use the same product vocabulary.
/// </summary>
public sealed record CompanyPortfolio(
    string CompanyId,
    string CompanyName,
    string Description,
    bool IsSynthetic,
    string DataNotice,
    IReadOnlyList<PortfolioDepartment> Departments,
    IReadOnlyList<PortfolioRole> Roles,
    IReadOnlyList<PortfolioGroup> Groups,
    IReadOnlyList<PortfolioAgent> Agents,
    IReadOnlyList<PortfolioWorkflow> Workflows,
    IReadOnlyList<PortfolioCase> Cases);

/// <summary>One organizational department in the fictional company.</summary>
public sealed record PortfolioDepartment(string Id, string Name, string ShortName);

/// <summary>One application role that will later map to an Entra app role.</summary>
public sealed record PortfolioRole(string Id, string Name, string DepartmentId, string Description);

/// <summary>A cross-functional review group for a case or workflow.</summary>
public sealed record PortfolioGroup(string Id, string Name, string Description, IReadOnlyList<string> DepartmentIds);

/// <summary>One bounded agent identity visible to the product user.</summary>
public sealed record PortfolioAgent(string Id, string Name, string DepartmentId, string Purpose);

/// <summary>One user-facing workflow the portfolio can run or review.</summary>
public sealed record PortfolioWorkflow(string Id, string Name, string Description, string Status);

/// <summary>A synthetic case summary shown on the portfolio surface.</summary>
public sealed record PortfolioCase(string CaseId, string Title, string Jurisdiction, string Status, string PrimaryWorkflow, bool IsSynthetic);

/// <summary>
/// Deterministic seed data for the fictional Sample Energy Company demo.
/// It contains no private people, real company records, or authorization
/// decisions. Public evidence remains linked to its original publisher.
/// </summary>
public static class CompanyPortfolioSeed
{
    /// <summary>Presentation label for a stable agent ID; never an authorization decision.</summary>
    public static string AgentName(string agentId) =>
        Current.Agents.SingleOrDefault(agent => agent.Id == agentId)?.Name ?? "Agent";

    public static CompanyPortfolio Current { get; } = new(
        "blue-ridge-energy-resources",
        "Sample Energy Company",
        "Fictional company where departments collaborate through Company Agent.",
        true,
        "All company people, leases, title documents, ownership records, and workflow history are fictional. Public WV evidence is reference material, not proof of mineral title.",
        [
            new("land", "Land", "LAND"),
            new("land-administration", "Land Administration", "LAND ADMIN"),
            new("legal", "Legal", "LEGAL"),
            new("compliance", "Compliance", "COMPLIANCE"),
            new("accounting", "Accounting", "ACCOUNTING"),
            new("operations", "Operations", "OPERATIONS"),
            new("it-platform", "IT / Platform", "IT")
        ],
        [
            new("land-analyst", "Land Analyst", "land", "Review land packages and coordinate evidence collection."),
            new("land-administrator", "Land Administration Specialist", "land-administration", "Maintain lease, rights, records, and deadline work."),
            new("legal-reviewer", "Legal Reviewer", "legal", "Review title, curative, legal-boundary, and escalation outputs."),
            new("compliance-reviewer", "Compliance Reviewer", "compliance", "Review control exceptions, audit evidence, and requirements."),
            new("accounting-reviewer", "Accounting Reviewer", "accounting", "Review interest math and accounting-context exceptions without releasing payment."),
            new("operations-reviewer", "Operations Reviewer", "operations", "Consume land-readiness findings and development handoffs."),
            new("case-manager", "Case Manager", "land", "Coordinate assignments, handoffs, and workflow transitions."),
            new("platform-admin", "Platform Administrator", "it-platform", "Manage application configuration, access, and audit visibility.")
        ],
        [
            new("title-curative-board", "Title and Curative Board", "Land Administration and Legal review ownership gaps and curative needs.", ["land-administration", "legal"]),
            new("division-order-review", "Division Order Review", "Land Administration, Legal, and Accounting review interest and decimal exceptions.", ["land-administration", "legal", "accounting"]),
            new("lease-compliance-review", "Lease Compliance Review", "Lease, compliance, and operations teams review obligations and controls.", ["land-administration", "compliance", "operations"]),
            new("development-readiness", "Development Readiness", "Land, operations, legal, and accounting coordinate a development handoff.", ["land", "operations", "legal", "accounting"])
        ],
        [
            new("land-case-intake", "Case Intake Agent", "land", "Assess submitted clues and identify evidence gaps without inventing identifiers."),
            new("lease-analyst", "Lease Review Agent", "land-administration", "Review leases, amendments, obligations, deadlines, and continuation evidence."),
            new("lease-lifecycle-reviewer", "Lease Lifecycle Agent", "land-administration", "Review lease dates, notices, extensions, and lifecycle status."),
            new("lease-obligation-reviewer", "Lease Obligation Agent", "land-administration", "Extract obligation candidates and route uncertain clauses for review."),
            new("title-curative-analyst", "Curative Agent", "legal", "Compare title and ownership evidence and route legal conclusions to people."),
            new("title-chain-reviewer", "Title Review Agent", "legal", "Organize chain gaps and competing claims without issuing a title opinion."),
            new("ownership-reviewer", "Ownership Agent", "land-administration", "Compare ownership schedules and preserve source disagreements."),
            new("land-well-reconciler", "Well Reconciliation Agent", "land", "Compare independent public well and production evidence with submitted clues."),
            new("division-order-analyst", "Division Order Agent", "land-administration", "Prepare source-linked interest and decimal analysis without issuing payment."),
            new("division-order-preparer", "Division Order Prep Agent", "land-administration", "Assemble division-order evidence and identify suspense reasons."),
            new("document-intelligence-analyst", "Document Agent", "land-administration", "Review OCR observations and retain page-level provenance."),
            new("compliance-analyst", "Compliance Analysis Agent", "compliance", "Identify control and records exceptions while preserving governing-source gaps."),
            new("compliance-reviewer", "Compliance Agent", "compliance", "Review compliance exceptions and distinguish missing evidence from reported status."),
            new("land-operations-coordinator", "Coordination Agent", "land", "Coordinate deadlines, handoffs, and development-readiness blockers."),
            new("case-synthesizer", "Case Synthesis Agent", "land", "Preserve conflicts and unknowns and propose the next human-controlled route.")
        ],
        [
            new("wv-land-well-reconciliation", "WV Land-Well Reconciliation", "Reconcile submitted well clues with independent public evidence.", "ready"),
            new("lease-lifecycle-review", "Lease Lifecycle Review", "Review lease terms, obligations, amendments, and upcoming dates.", "seeded"),
            new("title-curative-review", "Title and Curative Review", "Organize ownership gaps, title questions, and curative follow-up.", "seeded"),
            new("division-order-preparation", "Division Order Preparation", "Compare supplied ownership and interest records and route exceptions.", "seeded"),
            new("development-readiness-review", "Development Readiness Review", "Coordinate land, legal, compliance, accounting, and operations blockers.", "planned")
        ],
        [
            new("synthetic-wv-case-braxton-001", "Braxton County well reconciliation", "West Virginia", "ready", "wv-land-well-reconciliation", true),
            new("synthetic-blue-ridge-lease-001", "Lease lifecycle and obligations review", "West Virginia", "seeded", "lease-lifecycle-review", true),
            new("synthetic-blue-ridge-do-001", "Division order exception review", "West Virginia", "seeded", "division-order-preparation", true)
        ]);
}
