using LandOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace LandOps.Infrastructure;

/// <summary>EF Core gateway that maps the domain model to the SQL Server schema.</summary>
public sealed class LandOpsDbContext(DbContextOptions<LandOpsDbContext> options) : DbContext(options)
{
    public DbSet<LandCase> LandCases => Set<LandCase>();
    public DbSet<Well> Wells => Set<Well>();
    public DbSet<SubmittedEvidence> SubmittedEvidence => Set<SubmittedEvidence>();
    public DbSet<SourceIdentity> SourceIdentities => Set<SourceIdentity>();
    public DbSet<SourceSnapshot> SourceSnapshots => Set<SourceSnapshot>();
    public DbSet<PublicEvidence> PublicEvidence => Set<PublicEvidence>();
    public DbSet<ProductionResult> ProductionResults => Set<ProductionResult>();
    public DbSet<ReconciliationRun> ReconciliationRuns => Set<ReconciliationRun>();
    public DbSet<Finding> Findings => Set<Finding>();
    public DbSet<Conflict> Conflicts => Set<Conflict>();
    public DbSet<Unknown> Unknowns => Set<Unknown>();
    public DbSet<AgentStep> AgentSteps => Set<AgentStep>();
    public DbSet<Synthesis> Syntheses => Set<Synthesis>();
    public DbSet<ConversationTurn> ConversationTurns => Set<ConversationTurn>();
    public DbSet<ReviewDecision> ReviewDecisions => Set<ReviewDecision>();
    public DbSet<WorkroomThreadRow> WorkroomThreads => Set<WorkroomThreadRow>();
    public DbSet<WorkroomAction> WorkroomActions => Set<WorkroomAction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Keep schema rules here so the domain model stays independent of EF Core.
        modelBuilder.Entity<LandCase>(entity =>
        {
            entity.ToTable("LandCases");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(100);
            entity.Property(item => item.Title).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Jurisdiction).HasMaxLength(50).IsRequired();
            entity.Property(item => item.AuthorityBoundary).HasMaxLength(500).IsRequired();
            entity.HasMany(item => item.Wells).WithOne().HasForeignKey(item => item.CaseId).OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(item => item.SubmittedEvidence).WithOne().HasForeignKey(item => item.CaseId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Well>(entity =>
        {
            entity.ToTable("Wells");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(100);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.ApiNumber).HasMaxLength(20).IsRequired();
            entity.Property(item => item.County).HasMaxLength(100).IsRequired();
            entity.Property(item => item.WellNumber).HasMaxLength(100).IsRequired();
            entity.Property(item => item.OperatorName).HasMaxLength(200);
            entity.Property(item => item.Status).HasMaxLength(100);
            entity.Property(item => item.SourceRecordType).HasMaxLength(100);
            entity.HasIndex(item => new { item.CaseId, item.ApiNumber });
        });

        modelBuilder.Entity<SubmittedEvidence>(entity =>
        {
            entity.ToTable("SubmittedEvidence");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(100);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Kind).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Description).HasMaxLength(1000).IsRequired();
        });

        modelBuilder.Entity<SourceIdentity>(entity =>
        {
            entity.ToTable("SourceIdentities");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(100);
            entity.Property(item => item.Publisher).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Dataset).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Mechanism).HasMaxLength(100).IsRequired();
            entity.Property(item => item.DatasetVersion).HasMaxLength(100);
            entity.Property(item => item.AuthorityScope).HasMaxLength(500).IsRequired();
        });

        modelBuilder.Entity<SourceSnapshot>(entity =>
        {
            entity.ToTable("SourceSnapshots");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150);
            entity.Property(item => item.SourceIdentityId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.RequestUrl).HasMaxLength(2000).IsRequired();
            entity.Property(item => item.ContentType).HasMaxLength(200).IsRequired();
            entity.Property(item => item.ContentHash).HasMaxLength(128).IsRequired();
            entity.Property(item => item.RawSnapshotRef).HasMaxLength(500).IsRequired();
            entity.HasIndex(item => item.ContentHash).IsUnique();
        });

        modelBuilder.Entity<PublicEvidence>(entity =>
        {
            entity.ToTable("PublicEvidence");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.SourceIdentityId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.SnapshotId).HasMaxLength(150).IsRequired();
            entity.Property(item => item.SourceRecordId).HasMaxLength(150).IsRequired();
            entity.Property(item => item.SourceUrl).HasMaxLength(2000).IsRequired();
            entity.Property(item => item.ContentHash).HasMaxLength(128).IsRequired();
            entity.Property(item => item.NormalizedFactsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.HasIndex(item => new { item.CaseId, item.SourceRecordId }).IsUnique();
        });

        modelBuilder.Entity<ProductionResult>(entity =>
        {
            entity.ToTable("ProductionResults");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.ApiNumber).HasMaxLength(20).IsRequired();
            entity.Property(item => item.Explanation).HasMaxLength(1000).IsRequired();
            entity.Property(item => item.EvidenceIdsJson).HasColumnType("nvarchar(max)").IsRequired();
        });

        modelBuilder.Entity<ReconciliationRun>(entity =>
        {
            entity.ToTable("ReconciliationRuns");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(100);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Status).HasMaxLength(50).IsRequired();
            entity.Property(item => item.FlowVersion).HasMaxLength(50).IsRequired();
            entity.Property(item => item.EvidenceIdsJson).HasColumnType("nvarchar(max)").IsRequired();
        });

        modelBuilder.Entity<Finding>(entity =>
        {
            entity.ToTable("Findings");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.RunId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Subject).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Assertion).HasMaxLength(2000).IsRequired();
            entity.Property(item => item.Status).HasMaxLength(50).IsRequired();
            entity.Property(item => item.Confidence).HasMaxLength(50).IsRequired();
            entity.Property(item => item.EvidenceIdsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.ConflictIdsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.UnknownIdsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.ProvenanceJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.HasIndex(item => new { item.CaseId, item.RunId });
        });

        modelBuilder.Entity<Conflict>(entity =>
        {
            entity.ToTable("Conflicts");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.RunId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Subject).HasMaxLength(200).IsRequired();
            entity.Property(item => item.ClaimsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.Reason).HasMaxLength(2000).IsRequired();
            entity.Property(item => item.Status).HasMaxLength(50).IsRequired();
        });

        modelBuilder.Entity<Unknown>(entity =>
        {
            entity.ToTable("Unknowns");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.RunId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Subject).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Question).HasMaxLength(1000).IsRequired();
            entity.Property(item => item.Reason).HasMaxLength(2000).IsRequired();
            entity.Property(item => item.NeededEvidenceJson).HasColumnType("nvarchar(max)").IsRequired();
        });

        modelBuilder.Entity<AgentStep>(entity =>
        {
            entity.ToTable("AgentSteps");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.RunId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.AgentId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Status).HasMaxLength(50).IsRequired();
            entity.Property(item => item.ArtifactJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.ProducerVersion).HasMaxLength(100).IsRequired();
            entity.HasIndex(item => new { item.RunId, item.Order }).IsUnique();
        });

        modelBuilder.Entity<Synthesis>(entity =>
        {
            entity.ToTable("Syntheses");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.RunId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Summary).HasMaxLength(3000).IsRequired();
            entity.Property(item => item.ProposedRoute).HasMaxLength(100).IsRequired();
            entity.Property(item => item.EvidenceIdsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.FindingIdsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.ConflictIdsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.UnknownIdsJson).HasColumnType("nvarchar(max)").IsRequired();
        });

        modelBuilder.Entity<ConversationTurn>(entity =>
        {
            entity.ToTable("ConversationTurns"); entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150); entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired(); entity.Property(item => item.RunId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Question).HasMaxLength(2000).IsRequired(); entity.Property(item => item.Answer).HasMaxLength(4000).IsRequired(); entity.Property(item => item.Topic).HasMaxLength(100).IsRequired(); entity.Property(item => item.Grounding).HasMaxLength(100).IsRequired(); entity.Property(item => item.EvidenceRefsJson).HasColumnType("nvarchar(max)").IsRequired();
        });

        modelBuilder.Entity<ReviewDecision>(entity =>
        {
            entity.ToTable("ReviewDecisions"); entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150); entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired(); entity.Property(item => item.RunId).HasMaxLength(100).IsRequired(); entity.Property(item => item.Decision).HasMaxLength(50).IsRequired(); entity.Property(item => item.ReviewerId).HasMaxLength(200).IsRequired(); entity.Property(item => item.Reason).HasMaxLength(2000).IsRequired();
        });

        modelBuilder.Entity<WorkroomThreadRow>(entity =>
        {
            entity.ToTable("WorkroomThreads");
            entity.HasKey(item => item.ThreadId);
            entity.Property(item => item.ThreadId).HasMaxLength(150);
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.ScenarioId).HasMaxLength(150).IsRequired();
            entity.Property(item => item.Surface).HasMaxLength(50).IsRequired();
            entity.Property(item => item.Question).HasMaxLength(2000).IsRequired();
            entity.Property(item => item.ContextJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.RequestedBy).HasMaxLength(200).IsRequired();
            entity.Property(item => item.RoleId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.RequiredGroup).HasMaxLength(150).IsRequired();
            entity.Property(item => item.ParticipantsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.StepsJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(item => item.HumanBoundary).HasMaxLength(2000).IsRequired();
            entity.Property(item => item.Status).HasMaxLength(50).IsRequired();
            entity.HasIndex(item => new { item.CaseId, item.CreatedAt });
        });

        modelBuilder.Entity<WorkroomAction>(entity =>
        {
            entity.ToTable("WorkroomActions");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).HasMaxLength(150);
            entity.Property(item => item.ThreadId).HasMaxLength(150).IsRequired();
            entity.Property(item => item.CaseId).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Action).HasMaxLength(50).IsRequired();
            entity.Property(item => item.ActorId).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Assignee).HasMaxLength(200);
            entity.Property(item => item.Reason).HasMaxLength(2000).IsRequired();
            entity.HasIndex(item => new { item.ThreadId, item.CreatedAt });
        });
    }
}
