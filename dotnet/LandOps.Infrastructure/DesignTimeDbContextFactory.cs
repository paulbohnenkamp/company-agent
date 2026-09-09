using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BusinessAgent.Infrastructure;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<BusinessAgentDbContext>
{
    public BusinessAgentDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<BusinessAgentDbContext>()
            .UseSqlServer("Server=localhost,1433;Database=LandOps;User Id=sa;Password=LandOps_dev_2026!;TrustServerCertificate=True;Encrypt=False")
            .Options;
        return new BusinessAgentDbContext(options);
    }
}
