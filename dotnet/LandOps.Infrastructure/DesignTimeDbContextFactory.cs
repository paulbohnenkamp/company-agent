using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LandOps.Infrastructure;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<LandOpsDbContext>
{
    public LandOpsDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<LandOpsDbContext>()
            .UseSqlServer("Server=localhost,1433;Database=LandOps;User Id=sa;Password=LandOps_dev_2026!;TrustServerCertificate=True;Encrypt=False")
            .Options;
        return new LandOpsDbContext(options);
    }
}
