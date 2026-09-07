using LandOps.Application;
using LandOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace LandOps.Infrastructure;

public sealed class LandCaseRepository(LandOpsDbContext dbContext) : ILandCaseRepository
{
    public Task<LandCase?> GetAsync(string caseId, CancellationToken cancellationToken = default) =>
        dbContext.LandCases
            .Include(item => item.Wells)
            .Include(item => item.SubmittedEvidence)
            .AsSplitQuery()
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == caseId, cancellationToken);
}
