using System.Security.Claims;

namespace BusinessAgent.Api;

// This adapter keeps authentication plumbing at the HTTP boundary. The
// application layer receives resolved identity values, not ASP.NET details.
public sealed record ResolvedBusinessAgentIdentity(
    string Subject,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Groups,
    bool IsAuthenticated,
    string Mode,
    bool IsTrustedAdapter = false)
{
    public string PrimaryRole => Roles.FirstOrDefault() ?? string.Empty;
}

public static class BusinessAgentIdentityResolver
{
    public static ResolvedBusinessAgentIdentity Resolve(
        HttpContext httpContext,
        WorkroomThreadRequest request,
        string? configuredMode,
        string? trustedAdapterAppId = null,
        string trustedAdapterRole = "LandOps.Workroom.Invoke")
    {
        var mode = string.Equals(configuredMode, "entra", StringComparison.OrdinalIgnoreCase)
            ? "entra"
            : "local";

        if (mode == "local")
        {
            return new ResolvedBusinessAgentIdentity(
                request.RequestedBy,
                string.IsNullOrWhiteSpace(request.RoleId) ? [] : [request.RoleId],
                request.Groups ?? [],
                true,
                mode);
        }

        var principal = httpContext.User;
        var subject = principal.FindFirst("oid")?.Value
            ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? principal.FindFirst(ClaimTypes.Name)?.Value
            ?? string.Empty;
        var roles = principal.FindAll("roles").Select(claim => claim.Value)
            .Concat(principal.FindAll(ClaimTypes.Role).Select(claim => claim.Value))
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var groups = principal.FindAll("groups").Select(claim => claim.Value)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        // The Teams adapter uses an app-only token. It cannot carry the
        // Teams user's department role or group claims, so the API accepts
        // its transported context only after validating both the known
        // adapter app identity and the dedicated workload role. Scenario and
        // group policy is still enforced by the API endpoint.
        var appId = principal.FindFirst("azp")?.Value
            ?? principal.FindFirst("appid")?.Value
            ?? string.Empty;
        var isTrustedAdapter = principal.Identity?.IsAuthenticated == true
            && !string.IsNullOrWhiteSpace(trustedAdapterAppId)
            && string.Equals(appId, trustedAdapterAppId, StringComparison.OrdinalIgnoreCase)
            && roles.Contains(trustedAdapterRole, StringComparer.OrdinalIgnoreCase);
        if (isTrustedAdapter)
        {
            var transportedRoles = string.IsNullOrWhiteSpace(request.RoleId) ? [] : new[] { request.RoleId };
            var transportedGroups = request.Groups ?? [];
            return new ResolvedBusinessAgentIdentity(
                request.RequestedBy,
                transportedRoles,
                transportedGroups,
                true,
                "entra-trusted-adapter",
                true);
        }

        return new ResolvedBusinessAgentIdentity(subject, roles, groups, principal.Identity?.IsAuthenticated == true, mode);
    }
}
