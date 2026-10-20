var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var customers = new Dictionary<string, Customer>(StringComparer.OrdinalIgnoreCase)
{
    ["CUST-1001"] = new("CUST-1001", "Northstar Manufacturing", "Active", 3),
    ["CUST-1002"] = new("CUST-1002", "Contoso Field Services", "Active", 1)
};

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "customer-app" }));

app.MapGet("/api/customers/{customerId}", (string customerId, HttpContext http) =>
{
    // Demo mode: the MCP adapter does not yet forward the caller identity, so
    // authorization is disabled to keep the synthetic lookup demonstrable.
    // Re-enable the block below only after the MCP boundary supplies and
    // validates an authenticated caller context.
    //
    // var user = UserContext.FromHeaders(http.Request.Headers);
    //
    // if (!AuthorizationService.CanAccessCustomer(user, customerId, operation: "read"))
    // {
    //     return Results.Json(new
    //     {
    //         error = "forbidden",
    //         message = "The caller is not authorized to read this customer record.",
    //         customerId,
    //         requiredScope = "customer:read"
    //     }, statusCode: StatusCodes.Status403Forbidden);
    // }

    return customers.TryGetValue(customerId, out var customer)
        ? Results.Ok(customer)
        : Results.NotFound(new { error = "customer_not_found", customerId });
});

app.Run();

internal sealed record Customer(string Id, string Name, string Status, int OpenRequestCount);

internal sealed record UserContext
{
    public required string UserId { get; init; }
    public required string Role { get; init; }
    public HashSet<string> CustomerScope { get; init; } = new(StringComparer.OrdinalIgnoreCase);
    public bool IsAdmin => string.Equals(Role, "admin", StringComparison.OrdinalIgnoreCase);

    public static UserContext FromHeaders(IHeaderDictionary headers)
    {
        var role = headers["X-User-Role"].ToString();
        var userId = headers["X-User-Id"].ToString();
        var customerScope = headers["X-Customer-Scope"].ToString();

        return new UserContext
        {
            UserId = string.IsNullOrWhiteSpace(userId) ? "anonymous" : userId,
            Role = string.IsNullOrWhiteSpace(role) ? "anonymous" : role,
            CustomerScope = string.IsNullOrWhiteSpace(customerScope)
                ? new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                : new HashSet<string>(customerScope.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries), StringComparer.OrdinalIgnoreCase)
        };
    }
}

internal static class AuthorizationService
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "support_agent",
        "customer_success",
        "manager",
        "admin"
    };

    public static bool CanAccessCustomer(UserContext user, string customerId, string operation)
    {
        if (user is null)
            return false;

        if (!AllowedRoles.Contains(user.Role) && !user.IsAdmin)
            return false;

        if (!string.Equals(operation, "read", StringComparison.OrdinalIgnoreCase))
            return false;

        if (user.IsAdmin)
            return true;

        if (user.CustomerScope.Count == 0)
            return true;

        return user.CustomerScope.Contains(customerId);
    }
}
