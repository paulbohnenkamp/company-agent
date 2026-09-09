using System.Text.Json;

namespace BusinessAgent.Application;

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
        var scenario = RoleScenarioSeed.Current.SingleOrDefault(item => item.Id == thread.ScenarioId);
        var plan = scenario is null ? null : RoleScenarioSeed.PlanFor(thread.ScenarioId);
        if (scenario is null || plan is null)
            throw new WorkroomRunException("The requested case or scenario was not found.");
        var records = FictionalDataRoomSeed.ForCase(thread.CaseId)
            ?.ToArray() ?? [];
        var instructions = "Return only JSON with recordIds, findings, unknowns, and proposedRoute. "
            + "Use only the supplied record IDs. Every finding must use a supplied record ID. "
            + "Preserve uncertainty and return proposedRoute as human-review. Do not issue title, payment, or development decisions. "
            + "The selected review scope is defined by the requested scenario and question; do not invent a broader scope.";
        var input = JsonSerializer.Serialize(new
        {
            thread = new { thread.Question, thread.Context, thread.RoleId, thread.RequiredGroup },
            records,
            scenario = new { scenario.Id, scenario.Description, scenario.EvidenceTypes },
            plannedAgents = plan.Steps
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
        var availableRecordIds = records.Select(record => record.RecordId).ToHashSet(StringComparer.Ordinal);
        if (payload.RecordIds.Any(recordId => !availableRecordIds.Contains(recordId)))
            throw new WorkroomRunException("The Foundry agent response cited a record outside the current case.");
        if (payload.Findings.Any(finding => !payload.RecordIds.Contains(finding.RecordId, StringComparer.Ordinal)))
            throw new WorkroomRunException("The Foundry agent response included a finding without a returned source record.");

        return new FictionalReviewPacket(
            $"packet-{Guid.NewGuid():N}",
            thread.CaseId,
            thread.ScenarioId,
            thread.Question,
            payload.RecordIds,
            payload.Findings,
            payload.Unknowns,
            plan.Steps,
            [],
            payload.ProposedRoute,
            plan.HumanBoundary,
            DateTimeOffset.UtcNow);
    }

    private sealed record WorkroomAgentPayload(string[]? RecordIds, FictionalReviewFinding[]? Findings, string[]? Unknowns, string ProposedRoute);
}

public sealed class WorkroomRunException(string message) : Exception(message);
