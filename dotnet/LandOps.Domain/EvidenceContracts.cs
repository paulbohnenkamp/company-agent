namespace BusinessAgent.Domain;

/// <summary>Identifies a publisher and dataset without storing a retrieved record.</summary>
public sealed class SourceIdentity
{
    private SourceIdentity() { }

    public SourceIdentity(string id, string publisher, string dataset, string mechanism, string authorityScope, string? datasetVersion = null)
    {
        Id = Required(id, nameof(id));
        Publisher = Required(publisher, nameof(publisher));
        Dataset = Required(dataset, nameof(dataset));
        Mechanism = Required(mechanism, nameof(mechanism));
        AuthorityScope = Required(authorityScope, nameof(authorityScope));
        DatasetVersion = datasetVersion;
    }

    public string Id { get; private set; } = string.Empty;
    public string Publisher { get; private set; } = string.Empty;
    public string Dataset { get; private set; } = string.Empty;
    public string Mechanism { get; private set; } = string.Empty;
    public string? DatasetVersion { get; private set; }
    public string AuthorityScope { get; private set; } = string.Empty;

    private static string Required(string value, string name) => string.IsNullOrWhiteSpace(value) ? throw new ArgumentException($"{name} is required.", name) : value;
}

/// <summary>Stores the exact retrieved source response and its integrity metadata.</summary>
public sealed class SourceSnapshot
{
    private SourceSnapshot() { }

    public SourceSnapshot(string id, string sourceIdentityId, string requestUrl, DateTimeOffset retrievedAt, string contentType, string contentHash, string rawSnapshotRef, long byteLength)
    {
        Id = Required(id, nameof(id));
        SourceIdentityId = Required(sourceIdentityId, nameof(sourceIdentityId));
        RequestUrl = Required(requestUrl, nameof(requestUrl));
        RetrievedAt = retrievedAt;
        ContentType = Required(contentType, nameof(contentType));
        ContentHash = Required(contentHash, nameof(contentHash));
        RawSnapshotRef = Required(rawSnapshotRef, nameof(rawSnapshotRef));
        ByteLength = byteLength;
        Immutable = true;
    }

    public string Id { get; private set; } = string.Empty;
    public string SourceIdentityId { get; private set; } = string.Empty;
    public string RequestUrl { get; private set; } = string.Empty;
    public DateTimeOffset RetrievedAt { get; private set; }
    public string ContentType { get; private set; } = string.Empty;
    public string ContentHash { get; private set; } = string.Empty;
    public string RawSnapshotRef { get; private set; } = string.Empty;
    public long ByteLength { get; private set; }
    public bool Immutable { get; private set; }

    private static string Required(string value, string name) => string.IsNullOrWhiteSpace(value) ? throw new ArgumentException($"{name} is required.", name) : value;
}

/// <summary>Stores a normalized fact while retaining its source links.</summary>
public sealed class PublicEvidence
{
    private PublicEvidence() { }

    public PublicEvidence(string id, string caseId, string sourceIdentityId, string snapshotId, string sourceRecordId, string sourceUrl, string contentHash, string normalizedFactsJson)
    {
        Id = Required(id, nameof(id));
        CaseId = Required(caseId, nameof(caseId));
        SourceIdentityId = Required(sourceIdentityId, nameof(sourceIdentityId));
        SnapshotId = Required(snapshotId, nameof(snapshotId));
        SourceRecordId = Required(sourceRecordId, nameof(sourceRecordId));
        SourceUrl = Required(sourceUrl, nameof(sourceUrl));
        ContentHash = Required(contentHash, nameof(contentHash));
        NormalizedFactsJson = Required(normalizedFactsJson, nameof(normalizedFactsJson));
    }

    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string SourceIdentityId { get; private set; } = string.Empty;
    public string SnapshotId { get; private set; } = string.Empty;
    public string SourceRecordId { get; private set; } = string.Empty;
    public string SourceUrl { get; private set; } = string.Empty;
    public string ContentHash { get; private set; } = string.Empty;
    public string NormalizedFactsJson { get; private set; } = string.Empty;

    private static string Required(string value, string name) => string.IsNullOrWhiteSpace(value) ? throw new ArgumentException($"{name} is required.", name) : value;
}

/// <summary>States that distinguish zero production from missing or unavailable evidence.</summary>
public enum ProductionStatus { Matched, ReportedZero, NoMatch, Unavailable }

/// <summary>Records the result of a production lookup for a case.</summary>
public sealed class ProductionResult
{
    private ProductionResult() { }

    public ProductionResult(string caseId, string apiNumber, ProductionStatus status, string explanation, string evidenceIdsJson)
    {
        CaseId = caseId;
        ApiNumber = apiNumber;
        Status = status;
        Explanation = explanation;
        EvidenceIdsJson = evidenceIdsJson;
    }

    public int Id { get; private set; }
    public string CaseId { get; private set; } = string.Empty;
    public string ApiNumber { get; private set; } = string.Empty;
    public ProductionStatus Status { get; private set; }
    public string Explanation { get; private set; } = string.Empty;
    public string EvidenceIdsJson { get; private set; } = "[]";
}

/// <summary>An evidence-linked assertion produced by the reconciliation workflow.</summary>
public sealed class Finding
{
    private Finding() { }

    public Finding(string id, string caseId, string runId, string subject, string assertion, string status, string confidence, string evidenceIdsJson, string conflictIdsJson, string unknownIdsJson, string provenanceJson)
    {
        Id = id;
        CaseId = caseId;
        RunId = runId;
        Subject = subject;
        Assertion = assertion;
        Status = status;
        Confidence = confidence;
        EvidenceIdsJson = evidenceIdsJson;
        ConflictIdsJson = conflictIdsJson;
        UnknownIdsJson = unknownIdsJson;
        ProvenanceJson = provenanceJson;
        ProducedAt = DateTimeOffset.UtcNow;
    }

    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string RunId { get; private set; } = string.Empty;
    public string Subject { get; private set; } = string.Empty;
    public string Assertion { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string Confidence { get; private set; } = string.Empty;
    public string EvidenceIdsJson { get; private set; } = "[]";
    public string ConflictIdsJson { get; private set; } = "[]";
    public string UnknownIdsJson { get; private set; } = "[]";
    public string ProvenanceJson { get; private set; } = "{}";
    public DateTimeOffset ProducedAt { get; private set; }
}

/// <summary>Preserves competing claims instead of silently choosing one.</summary>
public sealed class Conflict
{
    private Conflict() { }

    public Conflict(string id, string caseId, string runId, string subject, string claimsJson, string reason)
    {
        Id = id;
        CaseId = caseId;
        RunId = runId;
        Subject = subject;
        ClaimsJson = claimsJson;
        Reason = reason;
        Status = "unresolved";
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string RunId { get; private set; } = string.Empty;
    public string Subject { get; private set; } = string.Empty;
    public string ClaimsJson { get; private set; } = "[]";
    public string Reason { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
}

/// <summary>Records a question that the available evidence cannot answer.</summary>
public sealed class Unknown
{
    private Unknown() { }

    public Unknown(string id, string caseId, string runId, string subject, string question, string reason, string neededEvidenceJson)
    {
        Id = id;
        CaseId = caseId;
        RunId = runId;
        Subject = subject;
        Question = question;
        Reason = reason;
        NeededEvidenceJson = neededEvidenceJson;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string RunId { get; private set; } = string.Empty;
    public string Subject { get; private set; } = string.Empty;
    public string Question { get; private set; } = string.Empty;
    public string Reason { get; private set; } = string.Empty;
    public string NeededEvidenceJson { get; private set; } = "[]";
    public DateTimeOffset CreatedAt { get; private set; }
}

/// <summary>Identifies one complete, versioned reconciliation execution.</summary>
public sealed class ReconciliationRun
{
    private ReconciliationRun() { }

    public ReconciliationRun(string id, string caseId, DateTimeOffset startedAt, DateTimeOffset completedAt, string status, string flowVersion, string evidenceIdsJson)
    {
        Id = id;
        CaseId = caseId;
        StartedAt = startedAt;
        CompletedAt = completedAt;
        Status = status;
        FlowVersion = flowVersion;
        EvidenceIdsJson = evidenceIdsJson;
    }

    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public DateTimeOffset StartedAt { get; private set; }
    public DateTimeOffset CompletedAt { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string FlowVersion { get; private set; } = string.Empty;
    public string EvidenceIdsJson { get; private set; } = "[]";
}
