using BusinessAgent.Application;
using BusinessAgent.Domain;
using Microsoft.EntityFrameworkCore;

namespace BusinessAgent.Infrastructure;

public sealed class LandCaseRepository(BusinessAgentDbContext dbContext) : ILandCaseRepository
{
    public Task<LandCase?> GetAsync(string caseId, CancellationToken cancellationToken = default) =>
        dbContext.LandCases
            .Include(item => item.Wells)
            .Include(item => item.SubmittedEvidence)
            .AsSplitQuery()
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == caseId, cancellationToken);
}
