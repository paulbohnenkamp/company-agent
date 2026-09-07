namespace LandOps.Application;

/// <summary>Typed request sent across the model-provider boundary.</summary>
public sealed record AgentProviderRequest(string AgentId, string Instructions, string Input);

/// <summary>Auditable provider result that never exposes provider secrets.</summary>
public sealed record AgentProviderResponse(bool Succeeded, string Output, string? Error, int StatusCode);

/// <summary>
/// Port for a model-backed agent. Local workflows can use a deterministic
/// implementation while production can use Microsoft Foundry.
/// </summary>
public interface IAgentProvider
{
    Task<AgentProviderResponse> ExecuteAsync(AgentProviderRequest request, CancellationToken cancellationToken = default);
}
