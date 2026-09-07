using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEvidenceAndReconciliation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Conflicts",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RunId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ClaimsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conflicts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Findings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RunId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Assertion = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Confidence = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EvidenceIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConflictIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UnknownIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProvenanceJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProducedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Findings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductionResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ApiNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    EvidenceIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionResults", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PublicEvidence",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SourceIdentityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SnapshotId = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SourceRecordId = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SourceUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ContentHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    NormalizedFactsJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicEvidence", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReconciliationRuns",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FlowVersion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EvidenceIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReconciliationRuns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SourceIdentities",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Publisher = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Dataset = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Mechanism = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DatasetVersion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AuthorityScope = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SourceIdentities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SourceSnapshots",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SourceIdentityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RequestUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    RetrievedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContentHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    RawSnapshotRef = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ByteLength = table.Column<long>(type: "bigint", nullable: false),
                    Immutable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SourceSnapshots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Unknowns",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RunId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Question = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    NeededEvidenceJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unknowns", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Findings_CaseId_RunId",
                table: "Findings",
                columns: new[] { "CaseId", "RunId" });

            migrationBuilder.CreateIndex(
                name: "IX_PublicEvidence_CaseId_SourceRecordId",
                table: "PublicEvidence",
                columns: new[] { "CaseId", "SourceRecordId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SourceSnapshots_ContentHash",
                table: "SourceSnapshots",
                column: "ContentHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Conflicts");

            migrationBuilder.DropTable(
                name: "Findings");

            migrationBuilder.DropTable(
                name: "ProductionResults");

            migrationBuilder.DropTable(
                name: "PublicEvidence");

            migrationBuilder.DropTable(
                name: "ReconciliationRuns");

            migrationBuilder.DropTable(
                name: "SourceIdentities");

            migrationBuilder.DropTable(
                name: "SourceSnapshots");

            migrationBuilder.DropTable(
                name: "Unknowns");
        }
    }
}
