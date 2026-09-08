# Browser handoff for existing tenant naming

Use this prompt in a signed-in browser session with access to the existing
Microsoft 365 tenant. No new tenant, subscription, domain, or licensed account
is needed for this naming change.

## Handoff prompt

Read `docs/PROJECT_STATE.md`, `docs/product-naming.md`, and
`docs/tenant-naming-adoption.md`. Apply the recorded names to the existing
environment. Confirm the target tenant before editing.

Rename the existing Legal and Land users to Taylor Kim (Legal) and Jordan Lee
(Land), following the exact UPN targets and before/after verification in the
adoption guide. Preserve object IDs, licenses, memberships, files, and messages.
Keep the administrator account and the current tenant domain.

Rename the existing Team to Sample Energy Company and its description to
Sample Energy Company collaboration. Rename the existing landops-demo channel
to Land. Keep General and add missing Legal, Compliance, Accounting, and
Operations standard channels. Do not change privacy or membership policies in
this naming pass.

Do not create individual accounts for agents. Business Agent is the Teams app;
short agent names identify contributions inside its responses. Casey Morgan
(Compliance) remains a repository persona until an additional account is
explicitly in scope.

Record the names and IDs before and after each change. Use the user's existing
authenticated session; the user enters any password or MFA requirement directly.
Do not collect, display, or save credentials. If access or privileges prevent a
step, record the exact blocker and leave that step incomplete.

Keep app installation and bot consent status separate from naming status.
Do not claim live Teams delivery until the mention, reply, and human-action
checks in `docs/teams-live-activation.md` pass.

## Return these facts

Report the verified tenant domain, organization display name, renamed users and
UPNs, unchanged object IDs/licenses/memberships, Team/channel names and IDs,
package version if installed, and unfinished steps. Do not report secrets.
