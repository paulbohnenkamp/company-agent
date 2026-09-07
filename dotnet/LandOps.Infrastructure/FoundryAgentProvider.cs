using Azure.Core;
using Azure.Identity;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using LandOps.Application;

namespace LandOps.Infrastructure;

/// <summary>Configuration for one Microsoft Foundry Responses API deployment.</summary>
public sealed record FoundryOptions(
    string Endpoint,
    string ApiKey,
    string Model,
    bool UseManagedIdentity = false,
    string Scope = "https://ai.azure.com/.default",
    TimeSpan? Timeout = null);

/// <summary>
/// Calls Microsoft Foundry through the application provider port.
/// This class is opt-in and is not required by deterministic local runs.
/// </summary>
public sealed class FoundryAgentProvider(HttpClient httpClient, FoundryOptions options) : IAgentProvider
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<AgentProviderResponse> ExecuteAsync(AgentProviderRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.Endpoint)) return Failure("Foundry endpoint is not configured.");
        if (!options.UseManagedIdentity && string.IsNullOrWhiteSpace(options.ApiKey)) return Failure("Foundry API key is not configured.");
        if (string.IsNullOrWhiteSpace(options.Model)) return Failure("Foundry model is not configured.");
        if (string.IsNullOrWhiteSpace(request.AgentId)) return Failure("Agent id is required.");
        if (string.IsNullOrWhiteSpace(request.Instructions)) return Failure("Agent instructions are required.");

        using var timeout = options.Timeout is { } duration
            ? CancellationTokenSource.CreateLinkedTokenSource(cancellationToken)
            : null;
        if (timeout is not null && options.Timeout is { } configuredTimeout) timeout.CancelAfter(configuredTimeout);
        var token = timeout?.Token ?? cancellationToken;

        using var message = new HttpRequestMessage(HttpMethod.Post, $"{options.Endpoint.TrimEnd('/')}/openai/v1/responses")
        {
            Content = JsonContent.Create(new { model = options.Model, instructions = request.Instructions, input = request.Input }, options: JsonOptions),
        };
        if (options.UseManagedIdentity)
        {
            try
            {
                var credential = new DefaultAzureCredential();
                var accessToken = await credential.GetTokenAsync(new TokenRequestContext([options.Scope]), token);
                message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken.Token);
            }
            catch (Exception error)
            {
                return Failure($"Foundry managed identity authentication failed: {error.Message}");
            }
        }
        else
        {
            message.Headers.Add("api-key", options.ApiKey);
        }

        HttpResponseMessage response;
        try
        {
            response = await httpClient.SendAsync(message, token);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return Failure("Foundry request timed out.");
        }
        catch (Exception error)
        {
            return Failure($"Foundry request failed: {error.Message}");
        }

        using (response)
        {
            if (!response.IsSuccessStatusCode) return new AgentProviderResponse(false, string.Empty, $"Foundry request failed with HTTP {(int)response.StatusCode}.", (int)response.StatusCode);
            try
            {
                var payload = await response.Content.ReadFromJsonAsync<FoundryResponse>(JsonOptions, token);
                return string.IsNullOrWhiteSpace(payload?.OutputText)
                    ? Failure("Foundry response did not contain output_text.", (int)response.StatusCode)
                    : new AgentProviderResponse(true, payload.OutputText, null, (int)response.StatusCode);
            }
            catch (Exception error)
            {
                return Failure($"Foundry response was not valid JSON: {error.Message}", (int)response.StatusCode);
            }
        }
    }

    private static AgentProviderResponse Failure(string error, int statusCode = 0) => new(false, string.Empty, error, statusCode);

    private sealed record FoundryResponse([property: JsonPropertyName("output_text")] string? OutputText);
}
