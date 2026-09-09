using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BusinessAgent.Application;

namespace BusinessAgent.Api.Tests;

public sealed class PlaybookEndToEndTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient client;

    public PlaybookEndToEndTests(ApiFactory factory) => client = factory.CreateClient();

    public static IEnumerable<object[]> WorkroomPlaybooks()
    {
        yield return ["legal-curative-blockers", "legal-reviewer", "title-curative-board"];
        yield return ["lease-development-obligations", "lease-analyst", "lease-compliance-review"];
        yield return ["division-order-readiness", "division-order-analyst", "division-order-review"];
    }

    [Theory]
    [MemberData(nameof(WorkroomPlaybooks))]
    public async Task Runs_a_role_playbook_from_plan_to_human_action(string scenarioId, string roleId, string requiredGroup)
    {
        var planResponse = await client.GetAsync($"/api/v1/scenarios/{scenarioId}/plan");

        Assert.Equal(HttpStatusCode.OK, planResponse.StatusCode);
        var plan = await planResponse.Content.ReadFromJsonAsync<CollaborationPlan>();
        Assert.NotNull(plan);
        Assert.Equal(scenarioId, plan!.ScenarioId);
        Assert.Equal("workroom", plan.Surface);
        Assert.Equal(requiredGroup, plan.RequiredGroup);
        Assert.NotEmpty(plan.Steps);
        Assert.Equal("requested", plan.Steps[0].Kind);
        Assert.Contains(plan.Steps, step => step.Kind == "delegated");

        var createResponse = await client.PostAsJsonAsync("/api/v1/workroom/threads", new
        {
            caseId = "synthetic-blue-ridge-lease-001",
            scenarioId,
            question = $"Run the {scenarioId} playbook and identify the next human review step.",
            requestedBy = "taylor.kim@sampleenergy.example",
            roleId,
            groups = new[] { requiredGroup },
            threadMessages = new[]
            {
                new { messageId = "teams-activity-1", authorRole = roleId, content = "Please preserve evidence gaps and route the next decision to a person." }
            }
        });

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var thread = await createResponse.Content.ReadFromJsonAsync<WorkroomThread>();
        Assert.NotNull(thread);
        Assert.Equal(scenarioId, thread!.ScenarioId);
        Assert.Equal(roleId, thread.RoleId);
        Assert.Equal(requiredGroup, thread.RequiredGroup);
        Assert.Equal("planned", thread.Status);
        Assert.Contains("taylor.kim@sampleenergy.example", thread.Participants);

        var runResponse = await client.PostAsync($"/api/v1/workroom/threads/{thread.ThreadId}/run", null);

        Assert.Equal(HttpStatusCode.OK, runResponse.StatusCode);
        var packet = await runResponse.Content.ReadFromJsonAsync<FictionalReviewPacket>();
        Assert.NotNull(packet);
        Assert.StartsWith("packet-", packet!.PacketId);
        Assert.Equal(thread.CaseId, packet.CaseId);
        Assert.Equal(thread.ScenarioId, packet.ScenarioId);
        Assert.NotEmpty(packet.RecordIds);
        Assert.NotEmpty(packet.Findings);
        Assert.NotEmpty(packet.Unknowns);
        Assert.Equal("human-review", packet.ProposedRoute);
        Assert.Equal(thread.Steps, packet.AgentSteps);

        var actionResponse = await client.PostAsJsonAsync($"/api/v1/workroom/threads/{thread.ThreadId}/actions", new
        {
            action = "request-evidence",
            reason = "Request the next evidence item before a consequential decision.",
            assignee = "case-manager"
        });

        Assert.Equal(HttpStatusCode.Created, actionResponse.StatusCode);
        var action = await actionResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("request-evidence", action.GetProperty("action").GetString());
        Assert.Equal("taylor.kim@sampleenergy.example", action.GetProperty("actorId").GetString());
        Assert.Equal("case-manager", action.GetProperty("assignee").GetString());

        var actionsResponse = await client.GetAsync($"/api/v1/workroom/threads/{thread.ThreadId}/actions");
        Assert.Equal(HttpStatusCode.OK, actionsResponse.StatusCode);
        var actions = await actionsResponse.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.NotNull(actions);
        Assert.Single(actions!);
    }
}
