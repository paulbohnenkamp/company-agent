namespace LandOps.Application;

public sealed record FictionalReviewFinding(
    string FindingId,
    string RecordId,
    string Subject,
    string Assertion,
    string Status,
    string Confidence);

public sealed record FictionalReviewPacket(
    string PacketId,
    string CaseId,
    string ScenarioId,
    string Question,
    IReadOnlyList<string> RecordIds,
    IReadOnlyList<FictionalReviewFinding> Findings,
    IReadOnlyList<string> Unknowns,
    IReadOnlyList<CollaborationStep> AgentSteps,
    string ProposedRoute,
    string HumanBoundary,
    DateTimeOffset CreatedAt);

/// <summary>
/// Deterministic local evaluator for the fictional data room. It demonstrates
/// the shape of an agent handoff before a Foundry provider is enabled.
/// </summary>
public static class FictionalReviewPacketSeed
{
    public static FictionalReviewPacket? Create(string caseId, string scenarioId)
    {
        var records = FictionalDataRoomSeed.ForCase(caseId);
        var scenario = RoleScenarioSeed.Current.SingleOrDefault(item => item.Id == scenarioId);
        var plan = scenario is null ? null : RoleScenarioSeed.PlanFor(scenarioId);
        if (records is null || scenario is null || plan is null) return null;

        var selectedTypes = scenario.RoleId switch
        {
            "lease-analyst" or "compliance-reviewer" => new[] { "lease", "ocr" },
            "legal-reviewer" => new[] { "title", "lease", "ocr" },
            "division-order-analyst" or "accounting-reviewer" => new[] { "division-order", "ownership", "title" },
            _ => new[] { "lease", "title", "division-order", "ownership", "ocr" }
        };
        var selected = records.Where(record => selectedTypes.Contains(record.RecordType, StringComparer.OrdinalIgnoreCase)).ToArray();
        var findings = selected.Select((record, index) =>
        {
            var fact = record.ExtractedFacts.FirstOrDefault();
            return new FictionalReviewFinding(
                $"finding-{record.RecordId}",
                record.RecordId,
                record.RecordType,
                fact.Key is null ? $"{record.Title} is available for review." : $"{fact.Key}: {fact.Value}",
                record.Status,
                record.RecordType == "ocr" ? "medium" : "high");
        }).ToArray();
        var unknowns = selected.SelectMany(record => record.Warnings).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        return new FictionalReviewPacket(
            $"packet-{Guid.NewGuid():N}",
            caseId,
            scenario.Id,
            scenario.Question,
            selected.Select(record => record.RecordId).ToArray(),
            findings,
            unknowns,
            plan.Steps,
            "human-review",
            "This seeded packet organizes evidence for a person. It does not issue a title opinion, change payment status, or approve development.",
            DateTimeOffset.UtcNow);
    }
}
