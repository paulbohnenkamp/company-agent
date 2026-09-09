using BusinessAgent.Application;
using BusinessAgent.Domain;

namespace BusinessAgent.Application.Tests;

public sealed class CaseQueryTests
{
    [Fact]
    public async Task Maps_case_and_keeps_case_scope()
    {
        var landCase = new LandCase("case-1", "Case", "WV", true, "Boundary");
        landCase.Wells.Add(new Well("well-1", "4700701733", "Braxton", "3-S-245", "Operator", "Completed", "WVGES"));
        landCase.SubmittedEvidence.Add(new SubmittedEvidence("evidence-1", "case-1", "package", "Synthetic package", true));
        var query = new CaseQuery(new StubRepository(landCase));

        var result = await query.GetAsync("case-1");

        Assert.NotNull(result);
        Assert.Equal("case-1", result!.CaseId);
        Assert.Single(result.Wells);
        Assert.True(result.SubmittedEvidence.Single().IsSynthetic);
        Assert.Null(await query.GetAsync("other-case"));
    }

    private sealed class StubRepository(LandCase landCase) : ILandCaseRepository
    {
        public Task<LandCase?> GetAsync(string caseId, CancellationToken cancellationToken = default) =>
            Task.FromResult<LandCase?>(caseId == landCase.Id ? landCase : null);
    }
}
