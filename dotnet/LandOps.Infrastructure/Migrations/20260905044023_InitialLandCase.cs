using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialLandCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LandCases",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Jurisdiction = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsSynthetic = table.Column<bool>(type: "bit", nullable: false),
                    AuthorityBoundary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandCases", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubmittedEvidence",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Kind = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IsSynthetic = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmittedEvidence", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubmittedEvidence_LandCases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "LandCases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Wells",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ApiNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    County = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    WellNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OperatorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SourceRecordType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wells", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Wells_LandCases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "LandCases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubmittedEvidence_CaseId",
                table: "SubmittedEvidence",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Wells_CaseId_ApiNumber",
                table: "Wells",
                columns: new[] { "CaseId", "ApiNumber" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubmittedEvidence");

            migrationBuilder.DropTable(
                name: "Wells");

            migrationBuilder.DropTable(
                name: "LandCases");
        }
    }
}
