/** A beginner-friendly visual map of the real Teams-to-Business Agent connection. */
export function TeamsIntegrationPanel() {
  return <section className="integration-panel" aria-label="Teams integration status">
    <div className="integration-heading"><div><span className="eyebrow blue">TEAMS INTEGRATION</span><h1>Business Agent channel connection</h1><p>Teams carries the conversation. The ASP.NET Core API runs agents and records reviews.</p></div><span className="integration-status"><i /> LOCAL ADAPTER READY</span></div>
    <div className="integration-flow"><IntegrationNode label="Microsoft Teams" detail="@Business Agent mention" status="Activation pending" /><span className="integration-arrow">→</span><IntegrationNode label="Teams SDK adapter" detail="src/teams/server.ts" status="Transport adapter" /><span className="integration-arrow">→</span><IntegrationNode label="ASP.NET Core" detail="Agent requests" status="C#/.NET boundary" /><span className="integration-arrow">→</span><IntegrationNode label="Agent handoff" detail="SQL Server + Foundry seam" status="Human review" /></div>
    <div className="integration-grid"><div><strong>Incoming message</strong><code>@Business Agent Can we move this title review forward?</code></div><div><strong>Preserved context</strong><code>tenant · user · conversation · activity ID</code></div><div><strong>Safe outcome</strong><code>ownership → title chain → synthesis → review</code></div></div>
    <p className="integration-note"><strong>Production next step:</strong> register the Azure Bot and Teams app, configure Entra credentials, and replace process-local idempotency with shared storage before multi-replica deployment.</p>
  </section>;
}

function IntegrationNode({ label, detail, status }: { label: string; detail: string; status: string }) {
  return <div className="integration-node"><strong>{label}</strong><small>{detail}</small><em>{status}</em></div>;
}
