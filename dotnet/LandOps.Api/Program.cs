using System.Text.Json;
using LandOps.Api;
using LandOps.Application;
using LandOps.Domain;
using LandOps.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

// Program.cs is the composition root. It wires HTTP, application services, and SQL together.
var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("LandOps")
    ?? "Server=localhost,1433;Database=LandOps;User Id=sa;Password=LandOps_dev_2026!;TrustServerCertificate=True;Encrypt=False";
var entraMode = string.Equals(builder.Configuration["LandOps:IdentityMode"], "entra", StringComparison.OrdinalIgnoreCase);

builder.Services.AddAuthorization();
if (entraMode)
{
    var authority = builder.Configuration["Entra:Authority"]
        ?? (string.IsNullOrWhiteSpace(builder.Configuration["Entra:TenantId"])
            ? string.Empty
            : $"https://login.microsoftonline.com/{builder.Configuration["Entra:TenantId"]}/v2.0");
    var audience = builder.Configuration["Entra:Audience"] ?? string.Empty;
    if (string.IsNullOrWhiteSpace(authority) || string.IsNullOrWhiteSpace(audience))
        throw new InvalidOperationException("Entra mode requires Entra:Authority or Entra:TenantId, and Entra:Audience.");
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = authority;
            options.Audience = audience;
            options.MapInboundClaims = false;
        });
}

builder.Services.AddDbContext<LandOpsDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<ILandCaseRepository, LandCaseRepository>();
builder.Services.AddScoped<CaseQuery>();
builder.Services.AddScoped<ReconciliationPersistence>();
builder.Services.AddScoped<DeterministicCaseConversation>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IAgentProvider>(services =>
{
    var configuration = services.GetRequiredService<IConfiguration>();
    var httpClientFactory = services.GetRequiredService<IHttpClientFactory>();
    return new FoundryAgentProvider(
        httpClientFactory.CreateClient("foundry"),
        new FoundryOptions(
            configuration["Foundry:Endpoint"] ?? string.Empty,
            configuration["Foundry:ApiKey"] ?? string.Empty,
            configuration["Foundry:Model"] ?? string.Empty,
            configuration.GetValue("Foundry:UseManagedIdentity", false),
            configuration["Foundry:Scope"] ?? "https://ai.azure.com/.default",
            TimeSpan.FromSeconds(configuration.GetValue("Foundry:TimeoutSeconds", 30))));
});
builder.Services.AddScoped<ICaseConversation>(services =>
    string.Equals(builder.Configuration["LandOps:ConversationProvider"], "foundry", StringComparison.OrdinalIgnoreCase)
        ? new FoundryCaseConversation(services.GetRequiredService<IAgentProvider>())
        : services.GetRequiredService<DeterministicCaseConversation>());
builder.Services.AddScoped<IWorkroomRunService>(services =>
    string.Equals(builder.Configuration["LandOps:WorkroomExecutionProvider"], "foundry", StringComparison.OrdinalIgnoreCase)
        ? new FoundryWorkroomRunService(services.GetRequiredService<IAgentProvider>())
        : new DeterministicWorkroomRunService());
builder.Services.AddSingleton<WorkroomThreadStore>();
if (string.Equals(builder.Configuration["LandOps:WorkroomPersistence"], "sql", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddScoped<IWorkroomThreadStore, SqlWorkroomThreadStore>();
else
    builder.Services.AddSingleton<IWorkroomThreadStore>(services => services.GetRequiredService<WorkroomThreadStore>());

var app = builder.Build();

if (entraMode)
{
    app.UseAuthentication();
    app.UseAuthorization();
}

if (app.Configuration.GetValue<bool>("LandOps:ApplyMigrations"))
{
    await using var scope = app.Services.CreateAsyncScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<LandOpsDbContext>();
    await dbContext.Database.MigrateAsync();
    await SeedData.SeedBraxtonCaseAsync(dbContext);
}

app.MapGet("/api/v1/cases/{caseId}", async (string caseId, CaseQuery query, CancellationToken cancellationToken) =>
{
    var result = await query.GetAsync(caseId, cancellationToken);
    return result is null ? Results.NotFound() : Results.Ok(result);
});

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// The portfolio shell is read-only seed context. Identity-aware write actions
// use the explicit local or Entra boundary configured below.
app.MapGet("/api/v1/company", () => Results.Ok(CompanyPortfolioSeed.Current));

// Fictional internal records are case-scoped and read-only. They demonstrate
// the shape that a future SQL Server document/evidence query will return.
app.MapGet("/api/v1/cases/{caseId}/data-room", (string caseId) =>
{
    var records = FictionalDataRoomSeed.ForCase(caseId);
    return records is null ? Results.NotFound() : Results.Ok(records);
});

// Role scenarios are read-only product guidance; Workroom creation applies the
// configured identity and collaboration authorization boundary.
app.MapGet("/api/v1/scenarios", () => Results.Ok(RoleScenarioSeed.Current));
app.MapGet("/api/v1/scenarios/{scenarioId}/plan", (string scenarioId) =>
{
    var plan = RoleScenarioSeed.PlanFor(scenarioId);
    return plan is null ? Results.NotFound() : Results.Ok(plan);
});

app.MapPost("/api/v1/cases/{caseId}/scenario-runs", (string caseId, FictionalReviewRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.ScenarioId)) return Results.BadRequest(new { error = "scenarioId is required" });
    var packet = FictionalReviewPacketSeed.Create(caseId, request.ScenarioId);
    return packet is null ? Results.NotFound(new { error = "case or scenario not found" }) : Results.Ok(packet);
});

app.MapPost("/api/v1/workroom/threads", async (HttpContext httpContext, WorkroomThreadRequest request, IWorkroomThreadStore store, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.CaseId) || string.IsNullOrWhiteSpace(request.ScenarioId) || string.IsNullOrWhiteSpace(request.Question))
        return Results.BadRequest(new { error = "caseId, scenarioId, and question are required" });
    var identity = LandOpsIdentityResolver.Resolve(httpContext, request, app.Configuration["LandOps:IdentityMode"]);
    if (!identity.IsAuthenticated) return Results.Unauthorized();
    if (identity.Roles.Count == 0 || string.IsNullOrWhiteSpace(identity.Subject)) return Results.StatusCode(StatusCodes.Status403Forbidden);
    var scenario = RoleScenarioSeed.Current.SingleOrDefault(item => item.Id == request.ScenarioId);
    var plan = scenario is null ? null : RoleScenarioSeed.PlanFor(request.ScenarioId);
    if (scenario is null || plan is null) return Results.NotFound(new { error = "scenario not found" });
    if (!scenario.EscalatesToWorkroom) return Results.BadRequest(new { error = "scenario does not require an agent review" });
    if (!identity.Roles.Any(role => CollaborationAuthorization.CanStart(scenario, plan, role, identity.Groups))) return Results.StatusCode(StatusCodes.Status403Forbidden);
    var context = WorkroomContextAnalyzer.Analyze(request.ThreadMessages);
    var thread = await store.CreateAsync(request.CaseId, scenario, plan, request.Question, context, identity.Subject, identity.PrimaryRole, cancellationToken);
    return Results.Created($"/api/v1/workroom/threads/{thread.ThreadId}", thread);
});

app.MapGet("/api/v1/workroom/threads/{threadId}", async (string threadId, IWorkroomThreadStore store, CancellationToken cancellationToken) =>
    await store.GetAsync(threadId, cancellationToken) is { } thread ? Results.Ok(thread) : Results.NotFound());

app.MapPost("/api/v1/workroom/threads/{threadId}/run", async (string threadId, IWorkroomThreadStore store, IWorkroomRunService runner, CancellationToken cancellationToken) =>
{
    var thread = await store.GetAsync(threadId, cancellationToken);
    if (thread is null) return Results.NotFound(new { error = "agent request not found" });
    try
    {
        return Results.Ok(await runner.RunAsync(thread, cancellationToken));
    }
    catch (WorkroomRunException error)
    {
        return Results.Problem(error.Message, statusCode: StatusCodes.Status502BadGateway);
    }
});

app.MapPost("/api/v1/workroom/threads/{threadId}/actions", async (string threadId, HttpContext httpContext, WorkroomActionRequest request, IWorkroomThreadStore store, LandOpsDbContext dbContext, CancellationToken cancellationToken) =>
{
    var thread = await store.GetAsync(threadId, cancellationToken);
    if (thread is null) return Results.NotFound(new { error = "agent request not found" });
    if (request.Action is not ("approve-next-step" or "request-evidence" or "reject-recommendation" or "assign-task"))
        return Results.BadRequest(new { error = "action must be approve-next-step, request-evidence, reject-recommendation, or assign-task" });
    if (string.IsNullOrWhiteSpace(request.Reason)) return Results.BadRequest(new { error = "reason is required" });
    var identity = LandOpsIdentityResolver.Resolve(httpContext, new WorkroomThreadRequest(thread.CaseId, thread.ScenarioId, thread.Question, thread.RequestedBy, thread.RoleId, [thread.RequiredGroup], thread.Context.Messages.ToArray()), app.Configuration["LandOps:IdentityMode"]);
    if (!identity.IsAuthenticated || string.IsNullOrWhiteSpace(identity.Subject)) return Results.Unauthorized();
    if (!identity.Roles.Any(role => string.Equals(role, thread.RoleId, StringComparison.OrdinalIgnoreCase))) return Results.StatusCode(StatusCodes.Status403Forbidden);
    var action = new WorkroomAction($"action-{Guid.NewGuid():N}", thread.ThreadId, thread.CaseId, request.Action, identity.Subject, request.Assignee, request.Reason);
    dbContext.WorkroomActions.Add(action);
    await dbContext.SaveChangesAsync(cancellationToken);
    return Results.Created($"/api/v1/workroom/threads/{threadId}/actions/{action.Id}", new { action.Id, action.ThreadId, action.CaseId, action.Action, action.ActorId, action.Assignee, action.Reason, action.CreatedAt });
});

app.MapGet("/api/v1/workroom/threads/{threadId}/actions", async (string threadId, LandOpsDbContext dbContext, CancellationToken cancellationToken) =>
    Results.Ok(await dbContext.WorkroomActions.AsNoTracking().Where(item => item.ThreadId == threadId).OrderBy(item => item.CreatedAt).ToListAsync(cancellationToken)));

app.MapPost("/api/v1/cases/{caseId}/runs", async (string caseId, CaseQuery query, ReconciliationPersistence persistence, CancellationToken cancellationToken) =>
{
    if (await query.GetAsync(caseId, cancellationToken) is null) return Results.NotFound();
    var runId = $"run-{Guid.NewGuid():N}";
    var output = await persistence.SaveBraxtonAsync(caseId, runId, cancellationToken);
    return Results.Ok(new
    {
        runId,
        caseId,
        status = output.Reconciliation.Run.Status,
        production = new { status = "no-match", explanation = "No matching production evidence was found in the frozen 2025 workbook; that is not reported zero production." },
        findings = output.Reconciliation.Findings.Count,
        conflicts = output.Reconciliation.Conflicts.Count,
        unknowns = output.Reconciliation.Unknowns.Count,
        evidenceIds = JsonSerializer.Deserialize<string[]>(output.Reconciliation.Run.EvidenceIdsJson) ?? [],
        steps = output.Steps.Select(step => new { step.AgentId, step.Order, step.Status }),
        synthesis = new { output.Synthesis.Summary, output.Synthesis.ProposedRoute }
    });
});

app.MapGet("/api/v1/cases/{caseId}/runs/{runId}", async (string caseId, string runId, LandOpsDbContext dbContext, CancellationToken cancellationToken) =>
{
    var run = await dbContext.ReconciliationRuns.AsNoTracking().SingleOrDefaultAsync(item => item.Id == runId && item.CaseId == caseId, cancellationToken);
    if (run is null) return Results.NotFound();
    var findings = await dbContext.Findings.AsNoTracking().Where(item => item.CaseId == caseId && item.RunId == runId).ToListAsync(cancellationToken);
    var conflicts = await dbContext.Conflicts.AsNoTracking().Where(item => item.CaseId == caseId && item.RunId == runId).ToListAsync(cancellationToken);
    var unknowns = await dbContext.Unknowns.AsNoTracking().Where(item => item.CaseId == caseId && item.RunId == runId).ToListAsync(cancellationToken);
    var steps = await dbContext.AgentSteps.AsNoTracking().Where(item => item.CaseId == caseId && item.RunId == runId).OrderBy(item => item.Order).ToListAsync(cancellationToken);
    var synthesis = await dbContext.Syntheses.AsNoTracking().SingleOrDefaultAsync(item => item.CaseId == caseId && item.RunId == runId, cancellationToken);
    return Results.Ok(new
    {
        runId = run.Id,
        caseId = run.CaseId,
        status = run.Status,
        flowVersion = run.FlowVersion,
        evidenceIds = JsonSerializer.Deserialize<string[]>(run.EvidenceIdsJson) ?? [],
        findings,
        conflicts,
        unknowns,
        steps,
        synthesis
    });
});

app.MapGet("/api/v1/cases/{caseId}/evidence", async (string caseId, LandOpsDbContext dbContext, CancellationToken cancellationToken) =>
{
    var evidence = await dbContext.PublicEvidence.AsNoTracking().Where(item => item.CaseId == caseId).ToListAsync(cancellationToken);
    if (evidence.Count == 0) return Results.NotFound();
    var sourceIds = evidence.Select(item => item.SourceIdentityId).Distinct().ToArray();
    var sources = await dbContext.SourceIdentities.AsNoTracking().Where(item => sourceIds.Contains(item.Id)).ToDictionaryAsync(item => item.Id, cancellationToken);
    var snapshotIds = evidence.Select(item => item.SnapshotId).Distinct().ToArray();
    var snapshots = await dbContext.SourceSnapshots.AsNoTracking().Where(item => snapshotIds.Contains(item.Id)).ToDictionaryAsync(item => item.Id, cancellationToken);
    return Results.Ok(new
    {
        evidence = evidence.Select(item => new
        {
            evidenceId = item.Id,
            source = sources[item.SourceIdentityId],
            snapshotId = item.SnapshotId,
            sourceRecordId = item.SourceRecordId,
            sourceUrl = item.SourceUrl,
            normalizedFacts = JsonSerializer.Deserialize<Dictionary<string, object?>>(item.NormalizedFactsJson) ?? new()
        }),
        snapshots = snapshots.Values
    });
});

app.MapPost("/api/v1/cases/{caseId}/runs/{runId}/conversation", async (string caseId, string runId, HttpRequest request, LandOpsDbContext dbContext, ICaseConversation conversation, CancellationToken cancellationToken) =>
{
    var run = await dbContext.ReconciliationRuns.AsNoTracking().SingleOrDefaultAsync(item => item.Id == runId && item.CaseId == caseId, cancellationToken);
    if (run is null) return Results.NotFound();
    var body = await request.ReadFromJsonAsync<ConversationRequest>(cancellationToken);
    if (body is null || string.IsNullOrWhiteSpace(body.Question)) return Results.BadRequest(new { error = "question is required" });
    var conflict = await dbContext.Conflicts.AsNoTracking().SingleOrDefaultAsync(item => item.CaseId == caseId && item.RunId == runId, cancellationToken);
    ConversationResponse response;
    try
    {
        response = await conversation.RespondAsync(new ConversationContext(
            body.Question,
            JsonSerializer.Deserialize<string[]>(run.EvidenceIdsJson) ?? [],
            conflict?.Reason ?? "The sources remain independently attributed.",
            "WVDEP and WVGES public regulatory/geological records are not proof of mineral title.",
            "No matching production evidence was found in the frozen 2025 workbook; that is not reported zero production."), cancellationToken);
    }
    catch (ConversationProviderException error)
    {
        return Results.Problem(error.Message, statusCode: StatusCodes.Status502BadGateway);
    }
    dbContext.ConversationTurns.Add(new ConversationTurn($"turn-{Guid.NewGuid():N}", caseId, runId, body.Question, response.Answer, response.Topic, response.Grounding, JsonSerializer.Serialize(response.EvidenceRefs)));
    await dbContext.SaveChangesAsync(cancellationToken);
    return Results.Ok(response);
});

app.MapPost("/api/v1/cases/{caseId}/runs/{runId}/review", async (string caseId, string runId, ReviewRequest body, LandOpsDbContext dbContext, CancellationToken cancellationToken) =>
{
    if (await dbContext.ReconciliationRuns.AsNoTracking().SingleOrDefaultAsync(item => item.Id == runId && item.CaseId == caseId, cancellationToken) is null) return Results.NotFound();
    if (body.Decision is not ("approved" or "rejected" or "revision-requested") || string.IsNullOrWhiteSpace(body.ReviewerId) || string.IsNullOrWhiteSpace(body.Reason)) return Results.BadRequest(new { error = "decision, reviewerId, and reason are required" });
    var decision = new ReviewDecision($"decision-{Guid.NewGuid():N}", caseId, runId, body.Decision, body.ReviewerId, body.Reason);
    dbContext.ReviewDecisions.Add(decision);
    await dbContext.SaveChangesAsync(cancellationToken);
    return Results.Ok(new { state = decision.Decision, decisionId = decision.Id, reviewerId = decision.ReviewerId, reason = decision.Reason, decidedAt = decision.DecidedAt });
});

app.Run();

public sealed record ConversationRequest(string Question, object[]? History);
public sealed record ReviewRequest(string Decision, string ReviewerId, string Reason);
public sealed record WorkroomThreadRequest(string CaseId, string ScenarioId, string Question, string RequestedBy, string RoleId, string[]? Groups, WorkroomMessage[]? ThreadMessages);
public sealed record WorkroomActionRequest(string Action, string Reason, string? Assignee);
public sealed record FictionalReviewRequest(string ScenarioId);

public partial class Program { }
