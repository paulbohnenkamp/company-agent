using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAgentWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AgentSteps",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RunId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AgentId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ArtifactJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProducerVersion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgentSteps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Syntheses",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RunId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(3000)", maxLength: 3000, nullable: false),
                    ProposedRoute = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EvidenceIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FindingIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConflictIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UnknownIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Syntheses", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AgentSteps_RunId_Order",
                table: "AgentSteps",
                columns: new[] { "RunId", "Order" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgentSteps");

            migrationBuilder.DropTable(
                name: "Syntheses");
        }
    }
}
