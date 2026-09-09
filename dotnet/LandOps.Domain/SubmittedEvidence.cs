namespace BusinessAgent.Domain;

public sealed class SubmittedEvidence
{
    private SubmittedEvidence() { }

    public SubmittedEvidence(string id, string caseId, string kind, string description, bool isSynthetic)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Evidence id is required.", nameof(id));
        if (string.IsNullOrWhiteSpace(caseId)) throw new ArgumentException("Case id is required.", nameof(caseId));
        if (string.IsNullOrWhiteSpace(kind)) throw new ArgumentException("Evidence kind is required.", nameof(kind));
        if (string.IsNullOrWhiteSpace(description)) throw new ArgumentException("Evidence description is required.", nameof(description));

        Id = id;
        CaseId = caseId;
        Kind = kind;
        Description = description;
        IsSynthetic = isSynthetic;
    }

    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string Kind { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public bool IsSynthetic { get; private set; }
}
