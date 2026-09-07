namespace LandOps.Domain;

public sealed class Well
{
    private Well() { }

    public Well(string id, string apiNumber, string county, string wellNumber, string? operatorName, string? status, string? sourceRecordType)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Well id is required.", nameof(id));
        if (string.IsNullOrWhiteSpace(apiNumber)) throw new ArgumentException("API number is required.", nameof(apiNumber));
        if (string.IsNullOrWhiteSpace(county)) throw new ArgumentException("County is required.", nameof(county));
        if (string.IsNullOrWhiteSpace(wellNumber)) throw new ArgumentException("Well number is required.", nameof(wellNumber));

        Id = id;
        ApiNumber = apiNumber;
        County = county;
        WellNumber = wellNumber;
        OperatorName = operatorName;
        Status = status;
        SourceRecordType = sourceRecordType;
    }

    public string Id { get; private set; } = string.Empty;
    public string CaseId { get; private set; } = string.Empty;
    public string ApiNumber { get; private set; } = string.Empty;
    public string County { get; private set; } = string.Empty;
    public string WellNumber { get; private set; } = string.Empty;
    public string? OperatorName { get; private set; }
    public string? Status { get; private set; }
    public string? SourceRecordType { get; private set; }
}
