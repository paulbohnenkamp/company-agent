"use client";

/**
 * Portfolio view for the Teams channel experience.
 *
 * This is intentionally a visual companion to the real adapter in
 * `src/teams/server.ts`: it lets a reviewer see the collaboration story
 * without requiring a live Microsoft 365 tenant.
 */
export function TeamsCollaborationView() {
  return <section className="teams-view" aria-label="Microsoft Teams collaboration view">
    <aside className="teams-sidebar">
      <div className="teams-brand"><span className="teams-logo">T</span><div><strong>LandOps</strong><small>Fictional Energy Co.</small></div></div>
      <span className="teams-label">TEAMS</span>
      <div className="team-name"><span className="team-avatar">F</span><strong>Fictional Energy</strong></div>
      <div className="channel active"><span>#</span><span>land-title-review</span></div>
      <div className="channel"><span>#</span><span>lease-operations</span></div>
      <div className="channel"><span>#</span><span>division-orders</span></div>
      <div className="channel"><span>#</span><span>compliance-gates</span></div>
      <div className="teams-sidebar-footer"><span className="presence" /> Alex Morgan · Legal</div>
    </aside>
    <div className="teams-conversation">
      <header className="teams-header"><div><span className="eyebrow blue">MICROSOFT TEAMS CHANNEL</span><h2># land-title-review</h2><p>Human questions, bounded agents, evidence-linked handoffs</p></div><span className="teams-secure">Entra protected</span></header>
      <div className="teams-feed">
        <div className="teams-date">Today · Braxton County case</div>
        <TeamsMessage initials="AM" name="Alex Morgan" role="Legal Reviewer" tone="person" time="9:41 AM">Can someone confirm whether we have enough ownership evidence to move the 4700701733 matter forward?</TeamsMessage>
        <div className="agent-handoff"><div className="handoff-line"><span className="handoff-icon">↗</span><div><strong>LandOps orchestrated a bounded handoff</strong><small>Alex’s request is visible to the participating agents</small></div></div><div className="agent-chain"><span className="chain-node person-node">AM</span><span className="chain-arrow">→</span><span className="chain-node">O</span><span className="chain-arrow">→</span><span className="chain-node">T</span><span className="chain-arrow">→</span><span className="chain-node">S</span><div className="chain-labels"><span>Alex Morgan</span><span>Ownership reviewer</span><span>Title-chain reviewer</span><span>Case synthesizer</span></div></div></div>
        <TeamsMessage initials="OR" name="Ownership Reviewer" role="Land agent · delegated by Alex Morgan" tone="agent" time="9:42 AM"><strong>Ownership evidence is incomplete.</strong><br />I found one ownership record and a related division-order record. The current package does not prove the mineral interest or resolve the competing title claim.</TeamsMessage>
        <TeamsMessage initials="TR" name="Title-Chain Reviewer" role="Land agent · delegated by Ownership Reviewer" tone="agent" time="9:43 AM"><strong>Title-chain review is ready.</strong><br />The next useful documents are the recorded conveyance and curative instrument. I preserved the source conflict instead of treating the public record as a title determination.</TeamsMessage>
        <TeamsMessage initials="CS" name="Case Synthesizer" role="Land agent · delegated by Title-Chain Reviewer" tone="agent" time="9:44 AM"><strong>Recommendation: human review.</strong><br />Open a curative packet, keep the matter in review, and assign Legal the next document request.</TeamsMessage>
        <div className="teams-boundary"><span>⌁</span><div><strong>Human decision boundary</strong><small>Agents can research, compare, summarize, and route. A person must approve title, filing, payment, or owner-contact actions.</small></div><span className="pill unresolved">REVIEW</span></div>
      </div>
      <div className="teams-composer"><span>Ask LandOps in # land-title-review</span><span className="composer-hint">@LandOps · Attach · Send</span></div>
    </div>
  </section>;
}

function TeamsMessage({ initials, name, role, tone, time, children }: { initials: string; name: string; role: string; tone: "person" | "agent"; time: string; children: React.ReactNode }) {
  return <article className={`teams-message ${tone}`}><span className="message-avatar">{initials}</span><div><div className="message-meta"><strong>{name}</strong><span>{role}</span><time>{time}</time></div><p>{children}</p></div></article>;
}
