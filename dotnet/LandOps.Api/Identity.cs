using System.Security.Claims;

namespace LandOps.Api;

// This adapter keeps authentication plumbing at the HTTP boundary. The
// application layer receives resolved identity values, not ASP.NET details.
public sealed record ResolvedLandOpsIdentity(
    string Subject,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Groups,
    bool IsAuthenticated,
    string Mode)
{
    public string PrimaryRole => Roles.FirstOrDefault() ?? string.Empty;
}

public static class LandOpsIdentityResolver
{
    public static ResolvedLandOpsIdentity Resolve(HttpContext httpContext, WorkroomThreadRequest request, string? configuredMode)
    {
        var mode = string.Equals(configuredMode, "entra", StringComparison.OrdinalIgnoreCase)
            ? "entra"
            : "local";

        if (mode == "local")
        {
            return new ResolvedLandOpsIdentity(
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

        return new ResolvedLandOpsIdentity(subject, roles, groups, principal.Identity?.IsAuthenticated == true, mode);
    }
}
