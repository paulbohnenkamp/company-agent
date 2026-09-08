using System.Text.Json;

namespace LandOps.Application;

public interface IWorkroomRunService
{
    Task<FictionalReviewPacket> RunAsync(WorkroomThread thread, CancellationToken cancellationToken = default);
}

public sealed class DeterministicWorkroomRunService : IWorkroomRunService
{
    public Task<FictionalReviewPacket> RunAsync(WorkroomThread thread, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var packet = FictionalReviewPacketSeed.Create(thread.CaseId, thread.ScenarioId)
            ?? throw new WorkroomRunException("The requested case or scenario was not found.");
        return Task.FromResult(packet with { Question = thread.Question });
    }
}

public sealed class FoundryWorkroomRunService(IAgentProvider provider) : IWorkroomRunService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<FictionalReviewPacket> RunAsync(WorkroomThread thread, CancellationToken cancellationToken = default)
    {
        var baseline = FictionalReviewPacketSeed.Create(thread.CaseId, thread.ScenarioId)
            ?? throw new WorkroomRunException("The requested case or scenario was not found.");
        var records = FictionalDataRoomSeed.ForCase(thread.CaseId)
            ?.Where(record => baseline.RecordIds.Contains(record.RecordId, StringComparer.Ordinal))
            .ToArray() ?? [];
        var instructions = "Return only JSON with recordIds, findings, unknowns, and proposedRoute. "
            + "Use only the supplied record IDs. Every finding must use a supplied record ID. "
            + "Preserve uncertainty and return proposedRoute as human-review. Do not issue title, payment, or development decisions.";
        var input = JsonSerializer.Serialize(new
        {
            thread = new { thread.Question, thread.Context, thread.RoleId, thread.RequiredGroup },
            records,
            plannedAgents = baseline.AgentSteps
        }, JsonOptions);
        var response = await provider.ExecuteAsync(new AgentProviderRequest("workroom-review", instructions, input), cancellationToken);
        if (!response.Succeeded) throw new WorkroomRunException(response.Error ?? "The Foundry agent provider failed.");

        WorkroomAgentPayload? payload;
        try { payload = JsonSerializer.Deserialize<WorkroomAgentPayload>(response.Output, JsonOptions); }
        catch (JsonException error) { throw new WorkroomRunException($"The Foundry agent response was not valid JSON: {error.Message}"); }
        if (payload is null || payload.Findings is null || payload.Unknowns is null || payload.RecordIds is null)
            throw new WorkroomRunException("The Foundry agent response was incomplete.");
        if (payload.ProposedRoute is not "human-review")
            throw new WorkroomRunException("The Foundry agent response requested an unsupported route.");
        if (payload.RecordIds.Any(recordId => !baseline.RecordIds.Contains(recordId, StringComparer.Ordinal)))
            throw new WorkroomRunException("The Foundry agent response cited a record outside the current case.");
        if (payload.Findings.Any(finding => !payload.RecordIds.Contains(finding.RecordId, StringComparer.Ordinal)))
            throw new WorkroomRunException("The Foundry agent response included a finding without a returned source record.");

        return baseline with { Question = thread.Question, RecordIds = payload.RecordIds, Findings = payload.Findings, Unknowns = payload.Unknowns, ProposedRoute = payload.ProposedRoute };
    }

    private sealed record WorkroomAgentPayload(string[]? RecordIds, FictionalReviewFinding[]? Findings, string[]? Unknowns, string ProposedRoute);
}

public sealed class WorkroomRunException(string message) : Exception(message);
