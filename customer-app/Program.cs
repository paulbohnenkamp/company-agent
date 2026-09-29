var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var customers = new Dictionary<string, Customer>(StringComparer.OrdinalIgnoreCase)
{
    ["CUST-1001"] = new("CUST-1001", "Northstar Manufacturing", "Active", 3),
    ["CUST-1002"] = new("CUST-1002", "Contoso Field Services", "Active", 1)
};

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "customer-app" }));

app.MapGet("/api/customers/{customerId}", (string customerId) =>
    customers.TryGetValue(customerId, out var customer)
        ? Results.Ok(customer)
        : Results.NotFound(new { error = "customer_not_found", customerId }));

app.Run();

internal sealed record Customer(string Id, string Name, string Status, int OpenRequestCount);
