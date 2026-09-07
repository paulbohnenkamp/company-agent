using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkroomThreadsSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorkroomThreads",
                columns: table => new
                {
                    ThreadId = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CaseId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ScenarioId = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Surface = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Question = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ContextJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RequiredGroup = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ParticipantsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StepsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HumanBoundary = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkroomThreads", x => x.ThreadId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkroomThreads_CaseId_CreatedAt",
                table: "WorkroomThreads",
                columns: new[] { "CaseId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkroomThreads");
        }
    }
}
