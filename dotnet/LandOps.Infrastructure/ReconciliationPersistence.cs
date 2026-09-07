using LandOps.Application;
using Microsoft.EntityFrameworkCore;

namespace LandOps.Infrastructure;

/// <summary>Loads the frozen fixture, runs the workflow, and persists its result.</summary>
public sealed class ReconciliationPersistence(LandOpsDbContext dbContext)
{
    public async Task<WorkflowOutput> SaveBraxtonAsync(string caseId, string runId, CancellationToken cancellationToken = default)
    {
        var fixture = BraxtonFixture.Load(caseId, runId);
        var output = new DeterministicAgentWorkflow().Execute(fixture.Reconciliation);
        foreach (var source in fixture.SourceIdentities)
            if (!await dbContext.SourceIdentities.AnyAsync(item => item.Id == source.Id, cancellationToken)) dbContext.SourceIdentities.Add(source);
        foreach (var snapshot in fixture.Snapshots)
            if (!await dbContext.SourceSnapshots.AnyAsync(item => item.Id == snapshot.Id, cancellationToken)) dbContext.SourceSnapshots.Add(snapshot);
        foreach (var evidence in fixture.Evidence)
            if (!await dbContext.PublicEvidence.AnyAsync(item => item.Id == evidence.Id, cancellationToken)) dbContext.PublicEvidence.Add(evidence);
        dbContext.ProductionResults.Add(fixture.Reconciliation.Production);
        dbContext.ReconciliationRuns.Add(output.Reconciliation.Run);
        dbContext.Findings.AddRange(output.Reconciliation.Findings);
        dbContext.Conflicts.AddRange(output.Reconciliation.Conflicts);
        dbContext.Unknowns.AddRange(output.Reconciliation.Unknowns);
        dbContext.AgentSteps.AddRange(output.Steps);
        dbContext.Syntheses.Add(output.Synthesis);
        await dbContext.SaveChangesAsync(cancellationToken);
        return output;
    }
}
