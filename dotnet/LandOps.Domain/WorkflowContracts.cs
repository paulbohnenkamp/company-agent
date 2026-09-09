namespace BusinessAgent.Domain;

/// <summary>Durable handoff produced by one ordered workflow step.</summary>
public sealed class AgentStep
{
    private AgentStep() { }

    public AgentStep(string id, string caseId, string runId, string agentId, int order, string status, string artifactJson, string producerVersion)
    {
        Id = id;
        CaseId = caseId;
        RunId = runId;
        AgentId = agentId;
        Order = order;
        Status = status;
        ArtifactJson = artifactJson;
        ProducerVersion = producerVersion;
    }

    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string RunId { get; private set; } = string.Empty;
    public string AgentId { get; private set; } = string.Empty;
    public int Order { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string ArtifactJson { get; private set; } = string.Empty;
    public string ProducerVersion { get; private set; } = string.Empty;
}

/// <summary>Human-readable review packet built from one reconciliation run.</summary>
public sealed class Synthesis
{
    private Synthesis() { }

    public Synthesis(string id, string caseId, string runId, string summary, string proposedRoute, string evidenceIdsJson, string findingIdsJson, string conflictIdsJson, string unknownIdsJson)
    {
        Id = id;
        CaseId = caseId;
        RunId = runId;
        Summary = summary;
        ProposedRoute = proposedRoute;
        EvidenceIdsJson = evidenceIdsJson;
        FindingIdsJson = findingIdsJson;
        ConflictIdsJson = conflictIdsJson;
        UnknownIdsJson = unknownIdsJson;
    }

    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string RunId { get; private set; } = string.Empty;
    public string Summary { get; private set; } = string.Empty;
    public string ProposedRoute { get; private set; } = string.Empty;
    public string EvidenceIdsJson { get; private set; } = "[]";
    public string FindingIdsJson { get; private set; } = "[]";
    public string ConflictIdsJson { get; private set; } = "[]";
    public string UnknownIdsJson { get; private set; } = "[]";
}
