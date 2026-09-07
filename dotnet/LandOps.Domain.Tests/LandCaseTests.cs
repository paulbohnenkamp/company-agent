using LandOps.Domain;

namespace LandOps.Domain.Tests;

public sealed class LandCaseTests
{
    [Fact]
    public void Requires_case_identity_and_boundary()
    {
        Assert.Throws<ArgumentException>(() => new LandCase("", "title", "WV", true, "boundary"));
        Assert.Throws<ArgumentException>(() => new LandCase("id", "title", "WV", true, ""));
    }

    [Fact]
    public void Preserves_synthetic_marker()
    {
        var landCase = new LandCase("case-1", "Synthetic case", "WV", true, "Public records are not title proof.");
        Assert.True(landCase.IsSynthetic);
    }
}
