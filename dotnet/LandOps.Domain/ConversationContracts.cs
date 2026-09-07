namespace LandOps.Domain;

/// <summary>One case-scoped question and evidence-grounded answer.</summary>
public sealed class ConversationTurn
{
    private ConversationTurn() { }
    public ConversationTurn(string id, string caseId, string runId, string question, string answer, string topic, string grounding, string evidenceRefsJson)
    {
        Id = id; CaseId = caseId; RunId = runId; Question = question; Answer = answer; Topic = topic; Grounding = grounding; EvidenceRefsJson = evidenceRefsJson; CreatedAt = DateTimeOffset.UtcNow;
    }
    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string RunId { get; private set; } = string.Empty;
    public string Question { get; private set; } = string.Empty;
    public string Answer { get; private set; } = string.Empty;
    public string Topic { get; private set; } = string.Empty;
    public string Grounding { get; private set; } = string.Empty;
    public string EvidenceRefsJson { get; private set; } = "[]";
    public DateTimeOffset CreatedAt { get; private set; }
}

/// <summary>Append-only record of a person's decision about a review packet.</summary>
public sealed class ReviewDecision
{
    private ReviewDecision() { }
    public ReviewDecision(string id, string caseId, string runId, string decision, string reviewerId, string reason)
    {
        Id = id; CaseId = caseId; RunId = runId; Decision = decision; ReviewerId = reviewerId; Reason = reason; DecidedAt = DateTimeOffset.UtcNow;
    }
    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string RunId { get; private set; } = string.Empty;
    public string Decision { get; private set; } = string.Empty;
    public string ReviewerId { get; private set; } = string.Empty;
    public string Reason { get; private set; } = string.Empty;
    public DateTimeOffset DecidedAt { get; private set; }
}
