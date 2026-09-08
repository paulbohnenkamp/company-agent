# Business Agent naming

Business Agent is the application. Microsoft Teams is where people collaborate.
Sample Energy Company is the fictional organization used in examples. Land,
Legal, Compliance, Accounting, and Operations are departments whose people can
work together on any relevant request. Land Administration and IT / Platform
remain existing specialist groups in the sample catalog; neither defines a
separate product. Department names do not partition cases or agent capabilities.

The application manages business records, agent execution, evidence, and human
decisions through ASP.NET Core. Next.js provides focused review and local
examples. Teams supplies conversations, teams, and channels. Existing implemented
flows require a case; the broader product name does not imply that arbitrary
business workflows are already implemented.

## Display names

| Item | Name or convention |
| --- | --- |
| Application and Teams app | Business Agent |
| Fictional organization and example Team | Sample Energy Company |
| Department channels | General, Land, Legal, Compliance, Accounting, Operations |
| People | Short fictional full name followed by department, such as Taylor Kim (Legal) |
| Email aliases | first.last; repository examples use sampleenergy.example |
| Agents | Short capability followed by Agent, such as Case Intake Agent |

Agent labels are distinct from human job titles. They describe capabilities,
not separate licensed users. One Teams app currently represents the application's
responses; named agent steps show contribution and delegation within that reply.
Illustrated messages from individual agents are examples, not live bot identities.

## Legacy compatibility

`LandOps` namespaces, resource names, environment keys, routes, and permission
identifiers remain operational identifiers. `Workroom` types, routes, table names,
and JSON fields describe existing persisted agent-request context. They do not
name a collaboration space. Human-facing text calls the operation an agent
request, run, or review according to its function.

The C# company catalog owns current agent labels. Stable agent, case, company,
and persona IDs may contain previous names to preserve references. Display-name
changes do not grant permissions or rewrite historical evidence. Old specs and
results document what was actually verified at the time; this document governs
current naming. Changing wire contracts or SQL names requires a migration with
independent compatibility verification, not search-and-replace.

## Tenant adoption

The existing tenant domain remains in use. No replacement slug is approved.
The current tenant user names and Team are recorded in the activation guide;
repository presentation does not prove that they have changed in Microsoft 365.
See [tenant naming adoption](tenant-naming-adoption.md) for targets and checks.
