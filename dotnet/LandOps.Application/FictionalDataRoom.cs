namespace BusinessAgent.Application;

/// <summary>
/// A source-linked record from the fictional company's case data room.
/// These records are intentionally small and readable so a beginner can see
/// what agents receive before a real document pipeline is introduced.
/// </summary>
public sealed record FictionalCaseRecord(
    string RecordId,
    string CaseId,
    string RecordType,
    string Title,
    string Status,
    bool IsSynthetic,
    string Provenance,
    IReadOnlyDictionary<string, string> ExtractedFacts,
    IReadOnlyList<string> RelevantAgentIds,
    IReadOnlyList<string> Warnings);

public static class FictionalDataRoomSeed
{
    public const string CaseId = "synthetic-blue-ridge-lease-001";

    public static IReadOnlyList<FictionalCaseRecord> Current { get; } =
    [
        new(
            "br-lease-001",
            CaseId,
            "lease",
            "Harrison South Unit Lease 2024-17",
            "active-review",
            true,
            "Sample Energy Company internal synthetic lease seed; no real lessor or lessee.",
            new Dictionary<string, string>
            {
                ["term"] = "5 years with extension option",
                ["primaryTermEnd"] = "2029-06-30",
                ["noticePeriod"] = "90 days before primary-term expiration",
                ["continuousDevelopment"] = "Potential obligation; confirm against amendment 2024-17-A",
                ["royaltyClause"] = "Synthetic 18.75% example"
            },
            ["lease-analyst", "lease-lifecycle-reviewer", "lease-obligation-reviewer"],
            ["Synthetic terms require human legal confirmation before reliance."]),
        new(
            "br-title-001",
            CaseId,
            "title",
            "Harrison South Unit Title Abstract",
            "curative-needed",
            true,
            "Sample Energy Company internal synthetic title seed assembled for curative training.",
            new Dictionary<string, string>
            {
                ["tract"] = "Harrison South Unit / Tract 14",
                ["surfaceOwner"] = "Fictional Harrison Family Holdings",
                ["mineralOwner"] = "Unverified from seed packet",
                ["exception"] = "Probate reference requires document review",
                ["effectiveDate"] = "2024-04-12"
            },
            ["title-curative-analyst", "title-chain-reviewer", "ownership-reviewer", "case-synthesizer"],
            ["This abstract is not a title opinion or ownership determination."]),
        new(
            "br-division-order-001",
            CaseId,
            "division-order",
            "Harrison South Unit Division Order Draft",
            "exception-open",
            true,
            "Sample Energy Company internal synthetic division-order seed; no payment instruction.",
            new Dictionary<string, string>
            {
                ["payee"] = "Fictional Harrison Family Holdings",
                ["decimalInterest"] = "0.03125000",
                ["ownershipBasis"] = "Pending title exception resolution",
                ["suspenseReason"] = "Ownership evidence incomplete",
                ["paymentStatus"] = "Do not change from seed status"
            },
            ["division-order-analyst", "ownership-reviewer", "accounting-reviewer"],
            ["Agents may explain exceptions but may not release funds or alter payment status."]),
        new(
            "br-ownership-001",
            CaseId,
            "ownership",
            "Harrison South Unit Ownership Schedule",
            "reconciliation-needed",
            true,
            "Sample Energy Company internal synthetic ownership schedule for cross-agent comparison.",
            new Dictionary<string, string>
            {
                ["recordedInterest"] = "3.125%",
                ["divisionOrderInterest"] = "3.125%",
                ["variance"] = "None in seed values",
                ["supportingDocument"] = "Title abstract and assignment packet"
            },
            ["ownership-reviewer", "division-order-preparer", "case-synthesizer"],
            ["Matching decimals do not resolve the underlying title exception."]),
        new(
            "br-ocr-001",
            CaseId,
            "ocr",
            "Scanned Amendment 2024-17-A Extraction",
            "extraction-reviewed",
            true,
            "Synthetic OCR output derived from a fictional scanned amendment.",
            new Dictionary<string, string>
            {
                ["documentPageCount"] = "7",
                ["noticeLanguage"] = "Notice must be delivered before the review deadline",
                ["confidence"] = "0.91",
                ["lowConfidenceField"] = "Handwritten exhibit reference on page 6",
                ["humanCheck"] = "Required before treating extracted dates as controlling"
            },
            ["document-intelligence-analyst", "lease-obligation-reviewer", "legal-reviewer"],
            ["OCR is an extracted observation and must retain page-level provenance."])
    ];

    public static IReadOnlyList<FictionalCaseRecord> Braxton { get; } =
    [
        new(
            "wv-braxton-package-001",
            "synthetic-wv-case-braxton-001",
            "submitted-land-package",
            "Synthetic Braxton County Well Reconciliation Package",
            "ready",
            true,
            "Synthetic submitted package for controlled reconciliation testing.",
            new Dictionary<string, string>
            {
                ["apiNumber"] = "4700701733",
                ["county"] = "Braxton",
                ["wellNumber"] = "3-S-245",
                ["requestedReview"] = "Compare submitted clues with independent WVDEP and WVGES evidence."
            },
            ["land-case-intake", "land-well-reconciler", "case-synthesizer"],
            ["Synthetic package facts are not proof of title or ownership."])
    ];

    public static IReadOnlyList<FictionalCaseRecord>? ForCase(string caseId) =>
        string.Equals(caseId, CaseId, StringComparison.OrdinalIgnoreCase)
            ? Current
            : string.Equals(caseId, "synthetic-wv-case-braxton-001", StringComparison.OrdinalIgnoreCase)
                ? Braxton
                : null;
}
