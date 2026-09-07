namespace LandOps.Domain;

/// <summary>The review package that anchors every well, evidence record, and workflow run.</summary>
public sealed class LandCase
{
    private LandCase() { }

    public LandCase(string id, string title, string jurisdiction, bool isSynthetic, string authorityBoundary)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Case id is required.", nameof(id));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Case title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(jurisdiction)) throw new ArgumentException("Jurisdiction is required.", nameof(jurisdiction));
        if (string.IsNullOrWhiteSpace(authorityBoundary)) throw new ArgumentException("Authority boundary is required.", nameof(authorityBoundary));

        Id = id;
        Title = title;
        Jurisdiction = jurisdiction;
        IsSynthetic = isSynthetic;
        AuthorityBoundary = authorityBoundary;
    }

    public string Id { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Jurisdiction { get; private set; } = string.Empty;
    public bool IsSynthetic { get; private set; }
    public string AuthorityBoundary { get; private set; } = string.Empty;
    /// <summary>The well clues submitted with the case.</summary>
    public List<Well> Wells { get; private set; } = [];

    /// <summary>Descriptions of material supplied with the case.</summary>
    public List<SubmittedEvidence> SubmittedEvidence { get; private set; } = [];
}
