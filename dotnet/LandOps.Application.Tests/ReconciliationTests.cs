using LandOps.Application;
using LandOps.Domain;

namespace LandOps.Application.Tests;

public sealed class ReconciliationTests
{
    [Fact]
    public void Preserves_independent_operator_conflict_and_title_boundary()
    {
        var input = new ReconciliationInput(
            "synthetic-wv-case-braxton-001",
            "run-1",
            new[]
            {
                new EvidenceInput("dep-1", "wvdep-oog-rbdms-wells", "snap-dep", "objectid:100001", "https://dep.example", "hash-dep", "{\"apiNumber\":\"4700701733\",\"operator\":\"DEP\"}"),
                new EvidenceInput("ges-1", "wvges-oilgas-wells", "snap-ges", "OBJECTID:21403260", "https://ges.example", "hash-ges", "{\"apiNumber\":\"4700701733\",\"operator\":\"GES\"}")
            },
            new ProductionResult("synthetic-wv-case-braxton-001", "4700701733", ProductionStatus.NoMatch, "No matching production evidence.", "[]"));

        var result = new DeterministicReconciliationService().Execute(input);

        Assert.Single(result.Conflicts);
        Assert.Equal("operator", result.Conflicts[0].Subject);
        Assert.Equal(2, result.Conflicts[0].ClaimsJson.Split("evidenceIds", StringSplitOptions.None).Length - 1);
        Assert.Contains(result.Unknowns, item => item.Subject == "mineral title");
        Assert.Equal("unknown", result.Findings.Single(item => item.Subject == "production").Status);
    }

    [Fact]
    public void Rejects_reported_zero_from_being_treated_as_no_match()
    {
        var noMatch = new ProductionResult("case-1", "4700701733", ProductionStatus.NoMatch, "No matching production evidence.", "[]");
        var reportedZero = new ProductionResult("case-1", "4700701733", ProductionStatus.ReportedZero, "A source reported zero production.", "[\"production-1\"]");

        Assert.NotEqual(noMatch.Status, reportedZero.Status);
        Assert.Equal(ProductionStatus.ReportedZero, reportedZero.Status);
    }

    [Fact]
    public void Runs_three_bounded_steps_in_order_and_routes_to_human_review()
    {
        var input = new ReconciliationInput("case-1", "run-1", new[]
        {
            new EvidenceInput("dep-1", "wvdep-oog-rbdms-wells", "snap-dep", "dep-record", "https://dep.example", "hash-dep", "{\"apiNumber\":\"4700701733\"}"),
            new EvidenceInput("ges-1", "wvges-oilgas-wells", "snap-ges", "ges-record", "https://ges.example", "hash-ges", "{\"apiNumber\":\"4700701733\"}")
        }, new ProductionResult("case-1", "4700701733", ProductionStatus.NoMatch, "No matching production evidence.", "[]"));

        var result = new DeterministicAgentWorkflow().Execute(input);

        Assert.Equal(new[] { "land-case-intake", "land-well-reconciler", "case-synthesizer" }, result.Steps.Select(item => item.AgentId));
        Assert.Equal(new[] { 1, 2, 3 }, result.Steps.Select(item => item.Order));
        Assert.Equal("human-review", result.Synthesis.ProposedRoute);
        Assert.Contains("reported zero", result.Synthesis.Summary);
    }

    [Fact]
    public void Rejects_blank_case_questions_at_the_application_boundary()
    {
        Assert.Throws<ArgumentException>(() => new DeterministicCaseConversation().Respond(" ", [], "conflict", "title boundary", "production explanation"));
    }

    [Fact]
    public async Task Foundry_conversation_accepts_only_current_run_citations()
    {
        var provider = new FakeAgentProvider("{\"answer\":\"The sources disagree.\",\"topic\":\"operator\",\"grounding\":\"grounded\",\"evidenceRefs\":[\"evidence-1\"]}");
        var conversation = new FoundryCaseConversation(provider);

        var result = await conversation.RespondAsync(new ConversationContext("Do they agree?", ["evidence-1"], "conflict", "title boundary", "production"));

        Assert.Equal("The sources disagree.", result.Answer);
        Assert.Equal("evidence-1", Assert.Single(result.EvidenceRefs));
    }

    [Fact]
    public async Task Foundry_conversation_rejects_cross_run_citations()
    {
        var provider = new FakeAgentProvider("{\"answer\":\"answer\",\"topic\":\"operator\",\"grounding\":\"grounded\",\"evidenceRefs\":[\"other-case-evidence\"]}");
        var conversation = new FoundryCaseConversation(provider);

        await Assert.ThrowsAsync<ConversationProviderException>(() => conversation.RespondAsync(new ConversationContext("question", ["current-evidence"], "conflict", "title boundary", "production")));
    }

    private sealed class FakeAgentProvider(string output) : IAgentProvider
    {
        public Task<AgentProviderResponse> ExecuteAsync(AgentProviderRequest request, CancellationToken cancellationToken = default) =>
            Task.FromResult(new AgentProviderResponse(true, output, null, 200));
    }
}
