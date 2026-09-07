using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using LandOps.Api;
using LandOps.Application;
using LandOps.Domain;
using LandOps.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;

namespace LandOps.Api.Tests;

public sealed class ApiTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient client;

    public ApiTests(ApiFactory factory) => client = factory.CreateClient();

    [Fact]
    public async Task Returns_case_summary_and_synthetic_boundary()
    {
        var response = await client.GetAsync("/api/v1/cases/synthetic-wv-case-braxton-001");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<LandCaseResponse>();
        Assert.NotNull(body);
        Assert.True(body!.IsSynthetic);
        Assert.Single(body.Wells);
        Assert.Contains("not proof of mineral title", body.AuthorityBoundary);
    }

    [Fact]
    public async Task Rejects_unknown_case_without_cross_case_data()
    {
        var response = await client.GetAsync("/api/v1/cases/other-case");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Returns_fictional_company_portfolio_and_land_agent_team()
    {
        var response = await client.GetAsync("/api/v1/company");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<CompanyPortfolio>();
        Assert.NotNull(body);
        Assert.True(body!.IsSynthetic);
        Assert.Equal("Blue Ridge Energy Resources", body.CompanyName);
        Assert.Contains(body.Departments, department => department.Id == "land-administration");
        Assert.Contains(body.Agents, agent => agent.Id == "lease-analyst");
        Assert.Contains(body.Agents, agent => agent.Id == "division-order-analyst");
        Assert.Contains(body.Workflows, workflow => workflow.Id == "division-order-preparation");
    }

    [Fact]
    public async Task Returns_case_scoped_fictional_data_room_with_provenance()
    {
        var response = await client.GetAsync("/api/v1/cases/synthetic-blue-ridge-lease-001/data-room");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<FictionalCaseRecord[]>();
        Assert.NotNull(body);
        Assert.Contains(body!, record => record.RecordType == "lease");
        Assert.Contains(body, record => record.RecordType == "title");
        Assert.Contains(body, record => record.RecordType == "division-order");
        Assert.Contains(body, record => record.RecordType == "ownership");
        Assert.Contains(body, record => record.RecordType == "ocr");
        Assert.All(body, record =>
        {
            Assert.True(record.IsSynthetic);
            Assert.Equal("synthetic-blue-ridge-lease-001", record.CaseId);
            Assert.NotEmpty(record.Provenance);
            Assert.NotEmpty(record.RelevantAgentIds);
        });
    }

    [Fact]
    public async Task Does_not_return_fictional_data_for_another_case()
    {
        var response = await client.GetAsync("/api/v1/cases/other-case/data-room");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Runs_lease_scenario_against_relevant_seed_records()
    {
        var response = await client.PostAsJsonAsync("/api/v1/cases/synthetic-blue-ridge-lease-001/scenario-runs", new
        {
            scenarioId = "lease-development-obligations"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<FictionalReviewPacket>();
        Assert.NotNull(body);
        Assert.Equal("human-review", body!.ProposedRoute);
        Assert.Contains("br-lease-001", body.RecordIds);
        Assert.Contains("br-ocr-001", body.RecordIds);
        Assert.NotEmpty(body.Findings);
        Assert.NotEmpty(body.Unknowns);
        Assert.Contains(body.AgentSteps, step => step.Kind == "delegated");
        Assert.Contains(body.AgentSteps, step => step.Kind == "requested" && step.DelegatedFrom is null);
        Assert.Contains(body.AgentSteps, step => step.AgentId == "lease-obligation-reviewer" && step.DelegatedFrom == "lease-lifecycle-reviewer");
        Assert.Contains("does not issue a title opinion", body.HumanBoundary);
    }

    [Fact]
    public async Task Does_not_run_seeded_review_for_another_case()
    {
        var response = await client.PostAsJsonAsync("/api/v1/cases/other-case/scenario-runs", new
        {
            scenarioId = "lease-development-obligations"
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Returns_role_scenarios_with_agent_routes_and_human_boundaries()
    {
        var response = await client.GetAsync("/api/v1/scenarios");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<RoleScenario[]>();
        Assert.NotNull(body);
        Assert.True(body!.Length >= 16);
        Assert.Contains(body, scenario => scenario.RoleId == "legal-reviewer" && scenario.EscalatesToWorkroom);
        Assert.Contains(body, scenario => scenario.RoleId == "lease-analyst" && scenario.AgentIds.Contains("lease-obligation-reviewer"));
        Assert.Contains(body, scenario => scenario.RoleId == "division-order-analyst" && scenario.EvidenceTypes.Contains("division-order"));
        Assert.All(body, scenario => Assert.NotEmpty(scenario.HumanOutcome));
    }

    [Fact]
    public async Task Returns_delegation_plan_for_workroom_scenario()
    {
        var response = await client.GetAsync("/api/v1/scenarios/lease-development-obligations/plan");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<CollaborationPlan>();
        Assert.NotNull(body);
        Assert.Equal("workroom", body!.Surface);
        Assert.Equal("lease-compliance-review", body.RequiredGroup);
        Assert.Equal("requested", body.Steps[0].Kind);
        Assert.Contains(body.Steps, step => step.Kind == "delegated" && step.AgentId == "compliance-reviewer");
    }

    [Fact]
    public async Task Creates_authorized_workroom_thread_with_review_boundary()
    {
        var response = await client.PostAsJsonAsync("/api/v1/workroom/threads", new
        {
            caseId = "synthetic-wv-case-braxton-001",
            scenarioId = "lease-development-obligations",
            question = "What lease obligations could affect the next development decision?",
            requestedBy = "local-demo-user",
            roleId = "lease-analyst",
            groups = new[] { "lease-compliance-review" },
            threadMessages = new[]
            {
                new { messageId = "m-1", authorRole = "legal-reviewer", content = "Legal needs the lease notice period checked before the gate review." },
                new { messageId = "m-2", authorRole = "land-analyst", content = "Please compare the obligation against the current case evidence." }
            }
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<WorkroomThread>();
        Assert.NotNull(body);
        Assert.Equal("planned", body!.Status);
        Assert.Equal("lease-compliance-review", body.RequiredGroup);
        Assert.Equal(2, body.Context.Messages.Count);
        Assert.Contains("Last context from land-analyst", body.Context.Summary);
        Assert.False(body.Context.WasTruncated);
        Assert.Contains(body.Participants, participant => participant == "lease-lifecycle-reviewer");
        Assert.Contains(body.Steps, step => step.Kind == "delegated");
    }

    [Fact]
    public async Task Rejects_workroom_thread_without_required_group()
    {
        var response = await client.PostAsJsonAsync("/api/v1/workroom/threads", new
        {
            caseId = "synthetic-wv-case-braxton-001",
            scenarioId = "lease-development-obligations",
            question = "What lease obligations could affect the next development decision?",
            requestedBy = "local-demo-user",
            roleId = "lease-analyst",
            groups = Array.Empty<string>()
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Bounds_workroom_thread_context()
    {
        var response = await client.PostAsJsonAsync("/api/v1/workroom/threads", new
        {
            caseId = "synthetic-wv-case-braxton-001",
            scenarioId = "lease-development-obligations",
            question = "What lease obligations could affect the next development decision?",
            requestedBy = "local-demo-user",
            roleId = "lease-analyst",
            groups = new[] { "lease-compliance-review" },
            threadMessages = Enumerable.Range(1, 20).Select(index => new { messageId = $"m-{index}", authorRole = "land-analyst", content = new string('x', 1000) }).ToArray()
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<WorkroomThread>();
        Assert.NotNull(body);
        Assert.Equal(WorkroomContextAnalyzer.MaxMessages, body!.Context.Messages.Count);
        Assert.All(body.Context.Messages, message => Assert.True(message.Content.Length <= WorkroomContextAnalyzer.MaxCharactersPerMessage));
        Assert.True(body.Context.WasTruncated);
    }

    [Fact]
    public async Task Runs_agent_route_from_the_created_workroom_thread()
    {
        var createResponse = await client.PostAsJsonAsync("/api/v1/workroom/threads", new
        {
            caseId = "synthetic-blue-ridge-lease-001",
            scenarioId = "lease-development-obligations",
            question = "Can the lease analyst check this request from the shared thread?",
            requestedBy = "local-demo-user",
            roleId = "lease-analyst",
            groups = new[] { "lease-compliance-review" }
        });
        var thread = await createResponse.Content.ReadFromJsonAsync<WorkroomThread>();
        Assert.NotNull(thread);

        var runResponse = await client.PostAsync($"/api/v1/workroom/threads/{thread!.ThreadId}/run", null);

        Assert.Equal(HttpStatusCode.OK, runResponse.StatusCode);
        var packet = await runResponse.Content.ReadFromJsonAsync<FictionalReviewPacket>();
        Assert.NotNull(packet);
        Assert.Equal(thread.Question, packet!.Question);
        Assert.Equal(thread.CaseId, packet.CaseId);
        Assert.Contains("br-lease-001", packet.RecordIds);
    }

    [Theory]
    [InlineData("approve-next-step")]
    [InlineData("request-evidence")]
    [InlineData("reject-recommendation")]
    [InlineData("assign-task")]
    public async Task Records_each_allowed_human_workroom_action(string actionKind)
    {
        var createResponse = await client.PostAsJsonAsync("/api/v1/workroom/threads", new
        {
            caseId = "synthetic-blue-ridge-lease-001",
            scenarioId = "lease-development-obligations",
            question = "Can the lease move to the next review step?",
            requestedBy = "local-demo-user",
            roleId = "lease-analyst",
            groups = new[] { "lease-compliance-review" }
        });
        var thread = await createResponse.Content.ReadFromJsonAsync<WorkroomThread>();
        Assert.NotNull(thread);

        var actionResponse = await client.PostAsJsonAsync($"/api/v1/workroom/threads/{thread!.ThreadId}/actions", new
        {
            action = actionKind,
            reason = "Request the lease amendment before the development gate.",
            assignee = "land-analyst"
        });

        Assert.Equal(HttpStatusCode.Created, actionResponse.StatusCode);
        var action = await actionResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(actionKind, action.GetProperty("action").GetString());
        Assert.Equal("land-analyst", action.GetProperty("assignee").GetString());

        var listResponse = await client.GetAsync($"/api/v1/workroom/threads/{thread.ThreadId}/actions");
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        var actions = await listResponse.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.NotNull(actions);
        Assert.Single(actions!);
    }

    [Fact]
    public async Task Does_not_run_an_unknown_workroom_thread()
    {
        var response = await client.PostAsync("/api/v1/workroom/threads/thread-missing/run", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public void Resolves_entra_roles_and_groups_from_authenticated_claims()
    {
        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
            [
                new Claim("oid", "entra-user-001"),
                new Claim("roles", "lease-analyst"),
                new Claim("groups", "lease-compliance-review"),
            ], "test"))
        };
        var request = new WorkroomThreadRequest("case", "scenario", "question", "spoofed-user", "spoofed-role", ["spoofed-group"], null);

        var identity = LandOpsIdentityResolver.Resolve(context, request, "entra");

        Assert.True(identity.IsAuthenticated);
        Assert.Equal("entra-user-001", identity.Subject);
        Assert.Contains("lease-analyst", identity.Roles);
        Assert.Contains("lease-compliance-review", identity.Groups);
        Assert.DoesNotContain("spoofed-role", identity.Roles);
        Assert.DoesNotContain("spoofed-group", identity.Groups);
    }

    [Fact]
    public void Rejects_anonymous_principal_in_entra_mode()
    {
        var context = new DefaultHttpContext();
        var request = new WorkroomThreadRequest("case", "scenario", "question", "local-demo-user", "lease-analyst", ["lease-compliance-review"], null);

        var identity = LandOpsIdentityResolver.Resolve(context, request, "entra");

        Assert.False(identity.IsAuthenticated);
        Assert.Empty(identity.Roles);
        Assert.Empty(identity.Groups);
    }
}

public sealed class EntraAuthorizationApiTests : IClassFixture<EntraApiFactory>
{
    private readonly HttpClient client;

    public EntraAuthorizationApiTests(EntraApiFactory factory) => client = factory.CreateClient();

    [Fact]
    public async Task Rejects_a_valid_authenticated_identity_with_the_wrong_workroom_role()
    {
        using var createRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v1/workroom/threads")
        {
            Content = JsonContent.Create(new
            {
                caseId = "synthetic-blue-ridge-lease-001",
                scenarioId = "lease-development-obligations",
                question = "Can the lease move to the next review step?",
                requestedBy = "spoofed-user",
                roleId = "spoofed-role",
                groups = new[] { "spoofed-group" }
            })
        };
        createRequest.Headers.Add("x-test-user", "entra-user-001");
        createRequest.Headers.Add("x-test-role", "lease-analyst");
        createRequest.Headers.Add("x-test-group", "lease-compliance-review");

        var createResponse = await client.SendAsync(createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var thread = await createResponse.Content.ReadFromJsonAsync<WorkroomThread>();
        Assert.NotNull(thread);

        using var actionRequest = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/workroom/threads/{thread!.ThreadId}/actions")
        {
            Content = JsonContent.Create(new { action = "request-evidence", reason = "Need the amendment." })
        };
        actionRequest.Headers.Add("x-test-user", "entra-user-001");
        actionRequest.Headers.Add("x-test-role", "compliance-reviewer");
        actionRequest.Headers.Add("x-test-group", "lease-compliance-review");

        var actionResponse = await client.SendAsync(actionRequest);

        Assert.Equal(HttpStatusCode.Forbidden, actionResponse.StatusCode);
    }
}

public sealed class WorkroomExecutionTests
{
    [Fact]
    public async Task Foundry_workroom_output_is_case_scoped_and_human_review_only()
    {
        var scenario = RoleScenarioSeed.Current.Single(item => item.Id == "lease-development-obligations");
        var plan = RoleScenarioSeed.PlanFor(scenario.Id)!;
        var thread = WorkroomThreadStore.Build(
            FictionalDataRoomSeed.CaseId,
            scenario,
            plan,
            "Check the lease notice period.",
            new WorkroomContext("One message captured.", [], false),
            "entra-user-001",
            scenario.RoleId);
        var provider = new StubAgentProvider("""
            {"recordIds":["br-lease-001"],"findings":[{"findingId":"f-1","recordId":"br-lease-001","subject":"lease","assertion":"noticePeriod: 90 days","status":"review","confidence":"medium"}],"unknowns":["Confirm the governing lease version."],"proposedRoute":"human-review"}
            """);

        var packet = await new FoundryWorkroomRunService(provider).RunAsync(thread);

        Assert.Equal("human-review", packet.ProposedRoute);
        Assert.Equal(["br-lease-001"], packet.RecordIds);
        Assert.Equal(thread.Question, packet.Question);
    }

    [Fact]
    public async Task Foundry_workroom_output_rejects_a_foreign_record()
    {
        var scenario = RoleScenarioSeed.Current.Single(item => item.Id == "lease-development-obligations");
        var thread = WorkroomThreadStore.Build(FictionalDataRoomSeed.CaseId, scenario, RoleScenarioSeed.PlanFor(scenario.Id)!, "Review", new WorkroomContext("", [], false), "user", scenario.RoleId);
        var provider = new StubAgentProvider("""
            {"recordIds":["other-case-record"],"findings":[],"unknowns":[],"proposedRoute":"human-review"}
            """);

        await Assert.ThrowsAsync<WorkroomRunException>(() => new FoundryWorkroomRunService(provider).RunAsync(thread));
    }

    private sealed class StubAgentProvider(string output) : IAgentProvider
    {
        public Task<AgentProviderResponse> ExecuteAsync(AgentProviderRequest request, CancellationToken cancellationToken = default) =>
            Task.FromResult(new AgentProviderResponse(true, output, null, 200));
    }
}

public sealed class FoundryAgentProviderTests
{
    [Fact]
    public async Task Sends_bounded_request_and_returns_model_output()
    {
        HttpRequestMessage? request = null;
        string? requestBody = null;
        var handler = new RecordingHandler(message =>
        {
            request = message;
            requestBody = message.Content?.ReadAsStringAsync().GetAwaiter().GetResult();
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new { output_text = "structured result" })
            };
        });
        var provider = new FoundryAgentProvider(new HttpClient(handler), new FoundryOptions("https://foundry.example", "secret", "landops-model"));

        var result = await provider.ExecuteAsync(new AgentProviderRequest("land-well-reconciler", "Use evidence only.", "case context"));

        Assert.True(result.Succeeded);
        Assert.Equal("structured result", result.Output);
        Assert.NotNull(request);
        Assert.Equal("secret", request!.Headers.GetValues("api-key").Single());
        using var payload = JsonDocument.Parse(requestBody!);
        Assert.Equal("landops-model", payload.RootElement.GetProperty("model").GetString());
        Assert.Equal("Use evidence only.", payload.RootElement.GetProperty("instructions").GetString());
    }

    [Fact]
    public async Task Returns_auditable_failure_without_secret_on_provider_error()
    {
        var provider = new FoundryAgentProvider(new HttpClient(new RecordingHandler(_ => new HttpResponseMessage(HttpStatusCode.ServiceUnavailable))), new FoundryOptions("https://foundry.example", "secret", "landops-model"));

        var result = await provider.ExecuteAsync(new AgentProviderRequest("agent", "instructions", "input"));

        Assert.False(result.Succeeded);
        Assert.Contains("503", result.Error);
        Assert.DoesNotContain("secret", result.Error);
    }

    private sealed class RecordingHandler(Func<HttpRequestMessage, HttpResponseMessage> responseFactory) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => Task.FromResult(responseFactory(request));
    }
}

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // The action endpoint writes to SQL, so the test host applies the same
        // migrations that production uses before exercising the write path.
        builder.UseSetting("LandOps:ApplyMigrations", "true");
        builder.ConfigureServices(services =>
        {
            var descriptor = services.Single(item => item.ServiceType == typeof(ILandCaseRepository));
            services.Remove(descriptor);
            services.AddSingleton<ILandCaseRepository>(new StubRepository());
        });
    }

    private sealed class StubRepository : ILandCaseRepository
    {
        private readonly LandCase landCase = CreateCase();

        public Task<LandCase?> GetAsync(string caseId, CancellationToken cancellationToken = default) =>
            Task.FromResult<LandCase?>(caseId == landCase.Id ? landCase : null);

        private static LandCase CreateCase()
        {
            var result = new LandCase("synthetic-wv-case-braxton-001", "Synthetic Braxton County well reconciliation", "West Virginia", true, "WVDEP and WVGES public regulatory/geological records support identity comparison only; they are not proof of mineral title.");
            result.Wells.Add(new Well("well-1", "4700701733", "Braxton", "3-S-245", "Ross & Wharton Gas Co., Inc.", "Completed", "WVGES"));
            result.SubmittedEvidence.Add(new SubmittedEvidence("evidence-1", result.Id, "synthetic-land-package", "Synthetic submitted package", true));
            return result;
        }
    }
}

public sealed class EntraApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("LandOps:IdentityMode", "entra");
        builder.UseSetting("Entra:Authority", "https://login.example.test/tenant/v2.0");
        builder.UseSetting("Entra:Audience", "landops-test");
        builder.UseSetting("LandOps:ApplyMigrations", "true");
        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = TestAuthenticationHandler.TestScheme;
                    options.DefaultChallengeScheme = TestAuthenticationHandler.TestScheme;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>(TestAuthenticationHandler.TestScheme, _ => { });
        });
    }
}

public sealed class TestAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string TestScheme = "LandOpsTest";

    public TestAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var userId = Request.Headers["x-test-user"].FirstOrDefault();
        var role = Request.Headers["x-test-role"].FirstOrDefault();
        var group = Request.Headers["x-test-group"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(role) || string.IsNullOrWhiteSpace(group))
            return Task.FromResult(AuthenticateResult.NoResult());

        var claims = new[]
        {
            new Claim("oid", userId),
            new Claim("roles", role),
            new Claim("groups", group),
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, TestScheme));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, TestScheme)));
    }
}
