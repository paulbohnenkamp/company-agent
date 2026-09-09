using System.Text.Json;

namespace BusinessAgent.Application;

public sealed record ConversationResponse(string Answer, string Topic, string Grounding, IReadOnlyList<string> EvidenceRefs);

/// <summary>The state projection that a conversation provider is allowed to see.</summary>
public sealed record ConversationContext(
    string Question,
    IReadOnlyList<string> EvidenceRefs,
    string ConflictReason,
    string TitleBoundary,
    string ProductionExplanation);

/// <summary>Application boundary for deterministic or model-backed case conversation.</summary>
public interface ICaseConversation
{
    Task<ConversationResponse> RespondAsync(ConversationContext context, CancellationToken cancellationToken = default);
}

/// <summary>Answers a small set of case-scoped questions from the completed run.</summary>
public sealed class DeterministicCaseConversation : ICaseConversation
{
    /// <summary>Returns an answer with the evidence references used to ground it.</summary>
    public Task<ConversationResponse> RespondAsync(ConversationContext context, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return Task.FromResult(Respond(context.Question, context.EvidenceRefs, context.ConflictReason, context.TitleBoundary, context.ProductionExplanation));
    }

    /// <summary>Returns an answer with the evidence references used to ground it.</summary>
    public ConversationResponse Respond(string question, IReadOnlyList<string> evidenceRefs, string conflictReason, string titleBoundary, string productionExplanation)
    {
        if (string.IsNullOrWhiteSpace(question)) throw new ArgumentException("Question is required.", nameof(question));
        var lower = question.ToLowerInvariant();
        if (lower.Contains("operator") || lower.Contains("agree")) return new ConversationResponse($"No. WVDEP and WVGES report different operator values, so the operator conclusion is inconclusive. {conflictReason}", "operator", "grounded", evidenceRefs);
        if (lower.Contains("evidence") || lower.Contains("support")) return new ConversationResponse("The well identity finding is supported by the independent WVDEP and WVGES records cited here. The operator disagreement remains preserved rather than collapsed.", "evidence", "grounded", evidenceRefs);
        if (lower.Contains("production") || lower.Contains("zero")) return new ConversationResponse(productionExplanation, "production", "grounded", evidenceRefs);
        if (lower.Contains("unknown") || lower.Contains("remain")) return new ConversationResponse("The open unknowns are production reporting and mineral title. The next evidence needed is a production record and separate county/title evidence.", "unknowns", "grounded", evidenceRefs);
        if (lower.Contains("mineral") || lower.Contains("owner") || lower.Contains("title")) return new ConversationResponse(titleBoundary, "mineral-title", "bounded-unknown", []);
        return new ConversationResponse("I can answer questions about the operator conflict, cited evidence, production status, open unknowns, and the mineral-title boundary for this case.", "scope", "bounded", []);
    }
}

/// <summary>Signals that a model-backed answer could not satisfy the conversation contract.</summary>
public sealed class ConversationProviderException(string message) : Exception(message);

/// <summary>
/// Uses a configured model provider for conversation while validating its JSON
/// response and evidence references at the application boundary.
/// </summary>
public sealed class FoundryCaseConversation(IAgentProvider provider) : ICaseConversation
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<ConversationResponse> RespondAsync(ConversationContext context, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(context.Question)) throw new ArgumentException("Question is required.", nameof(context));
        var instructions = "Return only JSON with answer, topic, grounding, and evidenceRefs. "
            + "Use only the supplied evidenceRefs. Never make a title determination. "
            + "Allowed grounding values are grounded, bounded, and bounded-unknown.";
        var input = JsonSerializer.Serialize(new
        {
            question = context.Question,
            evidenceRefs = context.EvidenceRefs,
            conflict = context.ConflictReason,
            titleBoundary = context.TitleBoundary,
            production = context.ProductionExplanation,
        });
        var result = await provider.ExecuteAsync(new AgentProviderRequest("case-conversation", instructions, input), cancellationToken);
        if (!result.Succeeded) throw new ConversationProviderException(result.Error ?? "The model provider failed.");

        ConversationPayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<ConversationPayload>(result.Output, JsonOptions);
        }
        catch (JsonException error)
        {
            throw new ConversationProviderException($"The model response was not valid JSON: {error.Message}");
        }

        if (payload is null || string.IsNullOrWhiteSpace(payload.Answer) || string.IsNullOrWhiteSpace(payload.Topic))
            throw new ConversationProviderException("The model response did not contain a valid conversation payload.");
        if (payload.Grounding is not ("grounded" or "bounded" or "bounded-unknown"))
            throw new ConversationProviderException("The model response used an unsupported grounding value.");
        if (payload.EvidenceRefs.Any(reference => !context.EvidenceRefs.Contains(reference, StringComparer.Ordinal)))
            throw new ConversationProviderException("The model response cited evidence outside the current case run.");

        return new ConversationResponse(payload.Answer, payload.Topic, payload.Grounding, payload.EvidenceRefs);
    }

    private sealed record ConversationPayload(string Answer, string Topic, string Grounding, string[] EvidenceRefs);
}
