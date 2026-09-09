namespace BusinessAgent.Domain;

/// <summary>Append-only human action recorded against a Teams/Workroom thread.</summary>
public sealed class WorkroomAction
{
    private WorkroomAction() { }

    public WorkroomAction(string id, string threadId, string caseId, string action, string actorId, string? assignee, string reason)
    {
        Id = id;
        ThreadId = threadId;
        CaseId = caseId;
        Action = action;
        ActorId = actorId;
        Assignee = assignee;
        Reason = reason;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public string Id { get; private set; } = string.Empty;
    public string ThreadId { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string Action { get; private set; } = string.Empty;
    public string ActorId { get; private set; } = string.Empty;
    public string? Assignee { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
}
