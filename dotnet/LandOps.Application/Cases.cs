using BusinessAgent.Domain;

namespace BusinessAgent.Application;

/// <summary>Reads a case without exposing the database implementation to the API.</summary>
public interface ILandCaseRepository
{
    Task<LandCase?> GetAsync(string caseId, CancellationToken cancellationToken = default);
}

/// <summary>HTTP-safe shape of a case and its submitted material.</summary>
public sealed record LandCaseResponse(
    string CaseId,
    string Title,
    string Jurisdiction,
    bool IsSynthetic,
    string AuthorityBoundary,
    IReadOnlyList<WellResponse> Wells,
    IReadOnlyList<SubmittedEvidenceResponse> SubmittedEvidence);

public sealed record WellResponse(
    string WellId,
    string ApiNumber,
    string County,
    string WellNumber,
    string? OperatorName,
    string? Status,
    string? SourceRecordType);

public sealed record SubmittedEvidenceResponse(
    string EvidenceId,
    string Kind,
    string Description,
    bool IsSynthetic);

/// <summary>Coordinates the case lookup use case.</summary>
public sealed class CaseQuery(ILandCaseRepository repository)
{
    public async Task<LandCaseResponse?> GetAsync(string caseId, CancellationToken cancellationToken = default)
    {
        var landCase = await repository.GetAsync(caseId, cancellationToken);
        return landCase is null ? null : new LandCaseResponse(
            landCase.Id,
            landCase.Title,
            landCase.Jurisdiction,
            landCase.IsSynthetic,
            landCase.AuthorityBoundary,
            landCase.Wells.Select(well => new WellResponse(
                well.Id, well.ApiNumber, well.County, well.WellNumber,
                well.OperatorName, well.Status, well.SourceRecordType)).ToArray(),
            landCase.SubmittedEvidence.Select(evidence => new SubmittedEvidenceResponse(
                evidence.Id, evidence.Kind, evidence.Description, evidence.IsSynthetic)).ToArray());
    }
}
