using BusinessAgent.Domain;
using Microsoft.EntityFrameworkCore;

namespace BusinessAgent.Infrastructure;

public static class SeedData
{
    public const string BraxtonCaseId = "synthetic-wv-case-braxton-001";

    public static async Task SeedBraxtonCaseAsync(BusinessAgentDbContext dbContext, CancellationToken cancellationToken = default)
    {
        if (await dbContext.LandCases.AnyAsync(item => item.Id == BraxtonCaseId, cancellationToken)) return;

        var landCase = new LandCase(
            BraxtonCaseId,
            "Synthetic Braxton County well reconciliation",
            "West Virginia",
            isSynthetic: true,
            "WVDEP and WVGES public regulatory/geological records support identity comparison only; they are not proof of mineral title.");
        landCase.Wells.Add(new Well(
            "well-synthetic-wv-4700701733",
            "4700701733",
            "Braxton",
            "3-S-245",
            "Ross & Wharton Gas Co., Inc.",
            "Completed",
            "WVGES historical well record"));
        landCase.SubmittedEvidence.Add(new SubmittedEvidence(
            "submitted-package-synthetic-wv-braxton-001",
            BraxtonCaseId,
            "synthetic-land-package",
            "Synthetic submitted package with API 4700701733, Braxton County, and well 3-S-245 clues.",
            isSynthetic: true));

        dbContext.LandCases.Add(landCase);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
