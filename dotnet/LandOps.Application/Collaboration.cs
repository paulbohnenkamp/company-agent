using System.Collections.Concurrent;

namespace LandOps.Application;

public sealed record WorkroomMessage(string MessageId, string AuthorRole, string Content);

public sealed record WorkroomContext(string Summary, IReadOnlyList<WorkroomMessage> Messages, bool WasTruncated);

public sealed record WorkroomThread(
    string ThreadId,
    string CaseId,
    string ScenarioId,
    string Surface,
    string Question,
    WorkroomContext Context,
    string RequestedBy,
    string RoleId,
    string RequiredGroup,
    IReadOnlyList<string> Participants,
    IReadOnlyList<CollaborationStep> Steps,
    string HumanBoundary,
    string Status,
    DateTimeOffset CreatedAt);

public interface IWorkroomThreadStore
{
    Task<WorkroomThread> CreateAsync(string caseId, RoleScenario scenario, CollaborationPlan plan, string question, WorkroomContext context, string requestedBy, string roleId, CancellationToken cancellationToken = default);
    Task<WorkroomThread?> GetAsync(string threadId, CancellationToken cancellationToken = default);
}

public sealed class WorkroomThreadStore : IWorkroomThreadStore
{
    private readonly ConcurrentDictionary<string, WorkroomThread> threads = new();

    public Task<WorkroomThread> CreateAsync(string caseId, RoleScenario scenario, CollaborationPlan plan, string question, WorkroomContext context, string requestedBy, string roleId, CancellationToken cancellationToken = default)
    {
        var thread = Build(caseId, scenario, plan, question, context, requestedBy, roleId);
        threads[thread.ThreadId] = thread;
        return Task.FromResult(thread);
    }

    public Task<WorkroomThread?> GetAsync(string threadId, CancellationToken cancellationToken = default) =>
        Task.FromResult<WorkroomThread?>(threads.GetValueOrDefault(threadId));

    public static WorkroomThread Build(string caseId, RoleScenario scenario, CollaborationPlan plan, string question, WorkroomContext context, string requestedBy, string roleId) =>
        new(
            $"thread-{Guid.NewGuid():N}",
            caseId,
            scenario.Id,
            "workroom",
            question,
            context,
            requestedBy,
            roleId,
            plan.RequiredGroup,
            [requestedBy, .. plan.Steps.Select(step => step.AgentId).Distinct()],
            plan.Steps,
            plan.HumanBoundary,
            "planned",
            DateTimeOffset.UtcNow);
}

public static class WorkroomContextAnalyzer
{
    public const int MaxMessages = 12;
    public const int MaxCharactersPerMessage = 800;

    public static WorkroomContext Analyze(IEnumerable<WorkroomMessage>? messages)
    {
        var source = messages ?? [];
        var bounded = source
            .Where(message => !string.IsNullOrWhiteSpace(message.Content))
            .Take(MaxMessages)
            .Select(message => new WorkroomMessage(
                string.IsNullOrWhiteSpace(message.MessageId) ? $"message-{Guid.NewGuid():N}" : message.MessageId,
                string.IsNullOrWhiteSpace(message.AuthorRole) ? "unknown" : message.AuthorRole,
                message.Content.Trim()[..Math.Min(message.Content.Trim().Length, MaxCharactersPerMessage)]))
            .ToArray();
        var wasTruncated = bounded.Length < source.Count() || source.Any(message => message.Content?.Trim().Length > MaxCharactersPerMessage);
        var last = bounded.LastOrDefault();
        var summary = bounded.Length == 0
            ? "No thread context supplied; the agent route will use the selected case question only."
            : $"{bounded.Length} thread message{(bounded.Length == 1 ? "" : "s")} captured. Last context from {last!.AuthorRole}: {last.Content}";
        return new WorkroomContext(summary, bounded, wasTruncated);
    }
}

public static class CollaborationAuthorization
{
    public static bool CanStart(RoleScenario scenario, CollaborationPlan plan, string roleId, IReadOnlyCollection<string> groups) =>
        string.Equals(scenario.RoleId, roleId, StringComparison.OrdinalIgnoreCase) &&
        groups.Contains(plan.RequiredGroup, StringComparer.OrdinalIgnoreCase);
}
