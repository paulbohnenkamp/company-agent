using System.Text.Json;
using BusinessAgent.Application;
using Microsoft.EntityFrameworkCore;

namespace BusinessAgent.Infrastructure;

/// <summary>
/// SQL-shaped representation of a Workroom thread. JSON columns preserve the
/// bounded context and ordered agent route without leaking EF types into the
/// application contract.
/// </summary>
public sealed class WorkroomThreadRow
{
    public string ThreadId { get; set; } = string.Empty;
    public string CaseId { get; set; } = string.Empty;
    public string ScenarioId { get; set; } = string.Empty;
    public string Surface { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public string ContextJson { get; set; } = "{}";
    public string RequestedBy { get; set; } = string.Empty;
    public string RoleId { get; set; } = string.Empty;
    public string RequiredGroup { get; set; } = string.Empty;
    public string ParticipantsJson { get; set; } = "[]";
    public string StepsJson { get; set; } = "[]";
    public string HumanBoundary { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }

    public WorkroomThread ToContract(JsonSerializerOptions options)
    {
        var context = JsonSerializer.Deserialize<WorkroomContext>(ContextJson, options)
            ?? new WorkroomContext("No thread context supplied.", [], false);
        var participants = JsonSerializer.Deserialize<string[]>(ParticipantsJson, options) ?? [];
        var steps = JsonSerializer.Deserialize<CollaborationStep[]>(StepsJson, options) ?? [];
        return new WorkroomThread(ThreadId, CaseId, ScenarioId, Surface, Question, context, RequestedBy, RoleId, RequiredGroup, participants, steps, HumanBoundary, Status, CreatedAt);
    }
}

/// <summary>Durable Workroom implementation used by SQL Server/Azure SQL mode.</summary>
public sealed class SqlWorkroomThreadStore(BusinessAgentDbContext dbContext) : IWorkroomThreadStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<WorkroomThread> CreateAsync(string caseId, RoleScenario scenario, CollaborationPlan plan, string question, WorkroomContext context, string requestedBy, string roleId, CancellationToken cancellationToken = default)
    {
        var thread = WorkroomThreadStore.Build(caseId, scenario, plan, question, context, requestedBy, roleId);
        dbContext.WorkroomThreads.Add(new WorkroomThreadRow
        {
            ThreadId = thread.ThreadId,
            CaseId = thread.CaseId,
            ScenarioId = thread.ScenarioId,
            Surface = thread.Surface,
            Question = thread.Question,
            ContextJson = JsonSerializer.Serialize(thread.Context, JsonOptions),
            RequestedBy = thread.RequestedBy,
            RoleId = thread.RoleId,
            RequiredGroup = thread.RequiredGroup,
            ParticipantsJson = JsonSerializer.Serialize(thread.Participants, JsonOptions),
            StepsJson = JsonSerializer.Serialize(thread.Steps, JsonOptions),
            HumanBoundary = thread.HumanBoundary,
            Status = thread.Status,
            CreatedAt = thread.CreatedAt
        });
        await dbContext.SaveChangesAsync(cancellationToken);
        return thread;
    }

    public async Task<WorkroomThread?> GetAsync(string threadId, CancellationToken cancellationToken = default)
    {
        var row = await dbContext.WorkroomThreads.AsNoTracking().SingleOrDefaultAsync(item => item.ThreadId == threadId, cancellationToken);
        return row?.ToContract(JsonOptions);
    }
}
