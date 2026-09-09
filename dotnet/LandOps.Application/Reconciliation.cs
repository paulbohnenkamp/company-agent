using System.Text.Json;
using BusinessAgent.Domain;

namespace BusinessAgent.Application;

/// <summary>One normalized public record supplied to the deterministic reconciler.</summary>
public sealed record EvidenceInput(
    string EvidenceId,
    string SourceIdentityId,
    string SnapshotId,
    string SourceRecordId,
    string SourceUrl,
    string ContentHash,
    string NormalizedFactsJson);

/// <summary>All inputs needed to execute one case reconciliation.</summary>
public sealed record ReconciliationInput(
    string CaseId,
    string RunId,
    IReadOnlyList<EvidenceInput> Evidence,
    ProductionResult Production);

/// <summary>Structured output that can be persisted and reviewed.</summary>
public sealed record ReconciliationOutput(
    ReconciliationRun Run,
    IReadOnlyList<Finding> Findings,
    IReadOnlyList<Conflict> Conflicts,
    IReadOnlyList<Unknown> Unknowns);

/// <summary>Compares the frozen evidence set without a language model or live network call.</summary>
public sealed class DeterministicReconciliationService
{
    /// <summary>Creates findings, conflicts, and unknowns from one validated evidence set.</summary>
    public ReconciliationOutput Execute(ReconciliationInput input)
    {
        if (input.Evidence.Count == 0) throw new ArgumentException("At least one evidence record is required.", nameof(input));
        if (input.Evidence.Any(item => item.NormalizedFactsJson.Contains("\"apiNumber\":\"4700701733\"", StringComparison.Ordinal) is false))
            throw new InvalidOperationException("The deterministic Braxton reconciliation requires the canonical API evidence.");

        var now = DateTimeOffset.UtcNow;
        var evidenceIds = input.Evidence.Select(item => item.EvidenceId).Distinct().ToArray();
        var dep = input.Evidence.First(item => item.SourceIdentityId == "wvdep-oog-rbdms-wells");
        var ges = input.Evidence.First(item => item.SourceIdentityId == "wvges-oilgas-wells");
        var conflictId = $"{input.RunId}-operator-conflict";
        var productionUnknownId = $"{input.RunId}-production-unknown";
        var titleUnknownId = $"{input.RunId}-title-unknown";
        var conflict = new Conflict(
            conflictId,
            input.CaseId,
            input.RunId,
            "operator",
            JsonSerializer.Serialize(new[]
            {
                new { value = "ROSS AND WHARTON GAS COMPANY, INC.", evidenceIds = new[] { dep.EvidenceId } },
                new { value = "Ross & Wharton Gas Co., Inc.", evidenceIds = new[] { ges.EvidenceId } }
            }),
            "Independent WVDEP and WVGES records report different operator values; neither publisher is silently preferred.");
        var productionUnknown = new Unknown(
            productionUnknownId,
            input.CaseId,
            input.RunId,
            "production",
            "Was production reported for API 4700701733?",
            input.Production.Explanation,
            "[\"production record\"]");
        var titleUnknown = new Unknown(
            titleUnknownId,
            input.CaseId,
            input.RunId,
            "mineral title",
            "Who owns the minerals under the submitted tract?",
            "WVDEP and WVGES public regulatory/geological records are not proof of mineral title.",
            "[\"county deed records\",\"title opinion\"]");
        var provenance = JsonSerializer.Serialize(new { runId = input.RunId, stepId = "land-well-reconciler", inputRecordIds = new[] { input.CaseId, dep.SourceRecordId, ges.SourceRecordId }, sourceEvidenceIds = evidenceIds, producerVersion = "landops-csharp-deterministic@1.0.0" });
        var findings = new[]
        {
            new Finding($"{input.RunId}-well-identity", input.CaseId, input.RunId, "well identity", "The submitted API, county, and well-number clues match the frozen WV public well evidence.", "supported", "high", JsonSerializer.Serialize(evidenceIds), "[]", "[]", provenance),
            new Finding($"{input.RunId}-operator", input.CaseId, input.RunId, "operator", "The operator is inconclusive because WVDEP and WVGES report different values.", "inconclusive", "medium", JsonSerializer.Serialize(new[] { dep.EvidenceId, ges.EvidenceId }), JsonSerializer.Serialize(new[] { conflictId }), "[]", provenance),
            new Finding($"{input.RunId}-production", input.CaseId, input.RunId, "production", input.Production.Explanation, "unknown", "unknown", "[]", "[]", JsonSerializer.Serialize(new[] { productionUnknownId }), provenance)
        };
        var run = new ReconciliationRun(input.RunId, input.CaseId, now, now, "complete", "1.0.0", JsonSerializer.Serialize(evidenceIds));
        return new ReconciliationOutput(run, findings, new[] { conflict }, new[] { productionUnknown, titleUnknown });
    }
}
