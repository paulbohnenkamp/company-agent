# Company Agent

Company Agent is an enterprise workflow platform that gives employees a single,
Teams-based front door to company information, specialist agents, and reviewed
business workflows.

## What it demonstrates

- Routes employee questions from Microsoft Teams to bounded specialist agents.
- Connects agents to authorized business systems and evidence sources.
- Keeps authentication, authorization, evidence, and human review at explicit
  application boundaries.
- Uses Microsoft-compatible agent, skill, tool, and deployment artifacts.

## AI interaction flow

1. An employee asks a question in Microsoft Teams.
2. Company Agent identifies the bounded specialist agent for the request.
3. The specialist agent uses authorized tools and business data sources.
4. The system returns an evidence-backed answer or routes the work for human
   review.

This demonstrates specialist-agent delegation, permissioned tool use, evidence
handling, and human review around an enterprise AI experience.

## Technology used

- **TypeScript / Node.js** — validates artifacts and orchestrates local tooling.
- **Microsoft Teams** — provides the employee-facing collaboration hub.
- **Copilot Studio / Microsoft Foundry** — host and configure agent experiences.
- **Microsoft Entra ID** — provides enterprise identity and authorization.
- **Azure** — supplies cloud deployment and integration services.
- **YAML agent artifacts** — define agents, skills, tools, and deployment intent.
- **C#/.NET** — provides the application boundary for business operations.

## Quick start

```bash
npm install
npm run typecheck
npm test
npm run validate:agent-artifacts
npm run validate:department-artifacts
```

The repository includes local configuration, artifact validation, and deployment
workflows. Cloud deployment requires an appropriately configured Microsoft
tenant and Azure environment; no credentials are included in the repository.

## Further reading

- [Repository guide](docs/repository-guide.md)
- [Land-agent architecture](docs/land-agent-architecture.md)
- [Teams architecture](docs/teams-architecture.md)
- [Microsoft Foundry standards](docs/microsoft-foundry-standards.md)
- [Safety and review boundaries](docs/safety.md)
