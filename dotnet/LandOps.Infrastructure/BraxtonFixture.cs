using LandOps.Application;
using LandOps.Domain;

namespace LandOps.Infrastructure;

public sealed record BraxtonFixtureData(
    IReadOnlyList<SourceIdentity> SourceIdentities,
    IReadOnlyList<SourceSnapshot> Snapshots,
    IReadOnlyList<PublicEvidence> Evidence,
    ReconciliationInput Reconciliation);

public static class BraxtonFixture
{
    public static BraxtonFixtureData Load(string caseId, string runId)
    {
        var dep = new SourceIdentity("wvdep-oog-rbdms-wells", "WVDEP", "Enterprise oil and gas wells", "arcgis-rest", "reported regulatory well information", "MapServer layer 7");
        var ges = new SourceIdentity("wvges-oilgas-wells", "WVGES", "OilGas_WVOG all individual oil and gas wells", "arcgis-rest", "geological and historical well information", "MapServer layer 4");
        var production = new SourceIdentity("wvdep-annual-production", "WVDEP", "Annual oil and gas production", "xlsx-download", "reported production information", "2025 workbook");
        var depSnapshot = new SourceSnapshot("snapshot-2026-09-03-wvdep-well-4700701733", dep.Id, "https://tagis.dep.wv.gov/arcgis/rest/services/WVDEP_enterprise/oil_gas/MapServer/7/query?where=api%3D%274700701733%27", new DateTimeOffset(2026, 9, 3, 18, 30, 3, TimeSpan.Zero), "application/json", "6452f8d34eb7c4bfd90277299e206fbfb33d54b8e4f58660c024eca94c8251ea", "fixtures/wv-land/braxton-4700701733/raw/wvdep-well.json", 4096);
        var gesSnapshot = new SourceSnapshot("snapshot-2026-09-03-wvges-well-4700701733", ges.Id, "https://atlas2.wvgs.wvnet.edu/server/rest/services/OilGas_WVOG/WVOG_Layer/MapServer/4/query?where=api%20%3D%204700701733", new DateTimeOffset(2026, 9, 3, 18, 30, 5, TimeSpan.Zero), "application/geo+json", "868ea2f38e0236522b8d9f07555ae5b6435601753b31c3ea5cebe78fe420b9", "fixtures/wv-land/braxton-4700701733/raw/wvges-well.geojson", 4096);
        var productionSnapshot = new SourceSnapshot("snapshot-2026-09-03-wvdep-production-2025", production.Id, "https://apps.dep.wv.gov/Documents/OOG/ProductionReports/2020-2029/2025Production.xlsx", new DateTimeOffset(2026, 9, 3, 18, 30, 7, TimeSpan.Zero), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "production-fixture-hash-2025", "fixtures/wv-land/braxton-4700701733/raw/wvdep-production.xlsx", 4096);
        var depEvidence = new EvidenceInput("evidence-wvdep-well-objectid-100001", dep.Id, depSnapshot.Id, "objectid:100001", depSnapshot.RequestUrl, depSnapshot.ContentHash, "{\"apiNumber\":\"4700701733\",\"county\":\"007\",\"wellNumber\":\"3-S-245\",\"operator\":\"ROSS AND WHARTON GAS COMPANY, INC.\",\"status\":\"Plugged\"}");
        var gesEvidence = new EvidenceInput("evidence-wvges-well-objectid-21403260", ges.Id, gesSnapshot.Id, "OBJECTID:21403260", gesSnapshot.RequestUrl, gesSnapshot.ContentHash, "{\"apiNumber\":\"4700701733\",\"county\":\"Braxton\",\"wellNumber\":\"3-S-245\",\"operator\":\"Ross & Wharton Gas Co., Inc.\",\"status\":\"Completed\"}");
        var evidence = new[]
        {
            new PublicEvidence(depEvidence.EvidenceId, caseId, depEvidence.SourceIdentityId, depEvidence.SnapshotId, depEvidence.SourceRecordId, depEvidence.SourceUrl, depEvidence.ContentHash, depEvidence.NormalizedFactsJson),
            new PublicEvidence(gesEvidence.EvidenceId, caseId, gesEvidence.SourceIdentityId, gesEvidence.SnapshotId, gesEvidence.SourceRecordId, gesEvidence.SourceUrl, gesEvidence.ContentHash, gesEvidence.NormalizedFactsJson)
        };
        var noMatch = new ProductionResult(caseId, "4700701733", ProductionStatus.NoMatch, "No matching production evidence was found in the frozen 2025 workbook; that is not reported zero production.", "[]");
        return new BraxtonFixtureData(new[] { dep, ges, production }, new[] { depSnapshot, gesSnapshot, productionSnapshot }, evidence, new ReconciliationInput(caseId, runId, new[] { depEvidence, gesEvidence }, noMatch));
    }
}
