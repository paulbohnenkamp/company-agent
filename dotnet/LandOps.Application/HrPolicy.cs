namespace BusinessAgent.Application;

/// <summary>Public-safe synthetic HR policy content; it contains no employee records.</summary>
public sealed record HrPolicyResponse(
    string PolicyId,
    string Name,
    string Summary,
    IReadOnlyList<string> RequestSteps,
    bool IsSynthetic);

public static class HrPolicySeed
{
    public static HrPolicyResponse Vacation { get; } = new(
        "vacation-policy",
        "Vacation policy",
        "Employees request planned vacation through their manager and the company time-off process. Approval depends on coverage and applicable policy rules.",
        [
            "Check your available balance in the company time-off system.",
            "Submit the requested dates and coverage notes to your manager.",
            "Wait for manager approval before treating the time off as confirmed."
        ],
        true);
}
