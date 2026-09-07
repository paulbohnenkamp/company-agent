using System.Text.Json;
using LandOps.Domain;

namespace LandOps.Application;

public sealed record WorkflowOutput(
    ReconciliationOutput Reconciliation,
    IReadOnlyList<AgentStep> Steps,
    Synthesis Synthesis);

/// <summary>Runs the three local workflow steps in a fixed order.</summary>
public sealed class DeterministicAgentWorkflow
{
    /// <summary>Executes intake, reconciliation, and synthesis for one run.</summary>
    public WorkflowOutput Execute(ReconciliationInput input)
    {
        var reconciliation = new DeterministicReconciliationService().Execute(input);
        var evidenceIds = input.Evidence.Select(item => item.EvidenceId).ToArray();
        var intake = new AgentStep($"{input.RunId}-intake", input.CaseId, input.RunId, "land-case-intake", 1, "succeeded", JsonSerializer.Serialize(new { kind = "intake", caseId = input.CaseId, caseScope = "well-reconciliation", suppliedClues = new { apiNumber = "4700701733", county = "Braxton", wellNumber = "3-S-245" }, evidenceIds }), "landops-csharp-deterministic@1.0.0");
        var reconciler = new AgentStep($"{input.RunId}-reconciler", input.CaseId, input.RunId, "land-well-reconciler", 2, "succeeded", JsonSerializer.Serialize(new { kind = "reconciliation", findingIds = reconciliation.Findings.Select(item => item.Id), conflictIds = reconciliation.Conflicts.Select(item => item.Id), unknownIds = reconciliation.Unknowns.Select(item => item.Id), evidenceIds }), "landops-csharp-deterministic@1.0.0");
        var synthesis = new Synthesis($"{input.RunId}-synthesis", input.CaseId, input.RunId, "The submitted API is supported by independent WVDEP and WVGES well evidence. Operator history remains unresolved, production is a no-match rather than reported zero, and mineral title remains outside this public-evidence workflow.", "human-review", JsonSerializer.Serialize(evidenceIds), JsonSerializer.Serialize(reconciliation.Findings.Select(item => item.Id)), JsonSerializer.Serialize(reconciliation.Conflicts.Select(item => item.Id)), JsonSerializer.Serialize(reconciliation.Unknowns.Select(item => item.Id)));
        var synthesizer = new AgentStep($"{input.RunId}-synthesizer", input.CaseId, input.RunId, "case-synthesizer", 3, "succeeded", JsonSerializer.Serialize(new { kind = "synthesis", synthesisId = synthesis.Id, proposedRoute = synthesis.ProposedRoute }), "landops-csharp-deterministic@1.0.0");
        return new WorkflowOutput(reconciliation, new[] { intake, reconciler, synthesizer }, synthesis);
    }
}
