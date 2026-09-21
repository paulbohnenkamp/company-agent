# Prompt for the next cleanup agent

You are continuing work in `/Users/paul/code/company-agent`.

Read these first:

- `AGENTS.md`
- `docs/HANDOFF.md`
- `README.md`
- `docs/repository-guide.md`
- `docs/PROJECT_STATE.md`
- `specs/057-prune-legacy-typescript-runtime.md`
- `dotnet/README.md`

We are cleaning up top-down from first principles.

The simple product model is:

- Real oil-and-gas employees have real positions.
- Employees use Microsoft Teams to work with company data.
- Company Agent is the single entry point.
- Land Agent handles land-related questions.
- Sub-agents are internal capabilities, not fake employees.
- Skills are procedures, not products.
- The C# solution is the sole active application/API boundary.
- The API enforces scope, evidence, authorization, persistence, and human
  approval.

Already completed:

- Simplified the top-level README.
- Renamed the repository to `company-agent`.
- Removed the active legacy TypeScript runtime, tests, and evaluator.
- Preserved the old TypeScript checkout at
  `/Users/paul/code/company-agent-legacy-typescript`.
- Pushed the changes to GitHub.
- The current latest commit is `4a644d7`.

Do not restore the old TypeScript runtime. Do not change Azure, Teams, Foundry,
or tenant users yet.

## Next objective

Create a one-page product truth for the repository. Define the real-world nouns
and verbs: employee, position, department, Teams user, Company Agent, Land
Agent, specialist, skill, land matter, document, finding, and human review
decision.

Then inspect the current persona catalog, agent catalog, skills, C# domain model,
README, and active documentation against that product truth.

Identify and report:

1. What matches the real-world model.
2. What is invented or confusing.
3. What should be removed.
4. What should remain as implementation detail.
5. What the first credible land-administration demo should be.

Pay particular attention to:

- The invented `case-manager` employee role.
- The mismatch between fictional personas and real tenant users.
- The current WV well-reconciliation demo, which is not a strong
  land-administration flagship.
- The distinction between employee positions, access roles, agent capabilities,
  and workflow assignment.
- Legacy `LandOps` and `Workroom` identifiers that may need to remain for
  compatibility.

Do not modify code yet. Explore first, then propose a focused plan. Create or
update a spec only after the plan and scope are agreed.
