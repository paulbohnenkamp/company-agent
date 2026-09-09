using Microsoft.EntityFrameworkCore;

namespace LandOps.Infrastructure;

/// <summary>
/// Compatibility type for compiled EF migration snapshots. New application
/// code uses <see cref="BusinessAgent.Infrastructure.BusinessAgentDbContext"/>.
/// Remove this alias only with an approved migration-history replacement.
/// </summary>
public sealed class LandOpsDbContext(DbContextOptions<BusinessAgent.Infrastructure.BusinessAgentDbContext> options)
    : BusinessAgent.Infrastructure.BusinessAgentDbContext(options)
{
}
