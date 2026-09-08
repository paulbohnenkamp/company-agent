"use client";

import React from "react";

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
      <div className="teams-brand"><span className="teams-logo">T</span><div><strong>Business Agent</strong><small>Sample Energy Company</small></div></div>
      <span className="teams-label">TEAMS</span>
      <div className="team-name"><span className="team-avatar">SE</span><strong>Sample Energy Company</strong></div>
      <div className="channel"><span>#</span><span>General</span></div>
      <div className="channel active"><span>#</span><span>Legal</span></div>
      <div className="channel"><span>#</span><span>Land</span></div>
      <div className="channel"><span>#</span><span>Accounting</span></div>
      <div className="channel"><span>#</span><span>Compliance</span></div>
      <div className="channel"><span>#</span><span>Operations</span></div>
      <div className="teams-sidebar-footer"><span className="presence" /> Taylor Kim (Legal)</div>
    </aside>
    <div className="teams-conversation">
      <header className="teams-header"><div><span className="eyebrow blue">TEAMS CONVERSATION EXAMPLE</span><h2># Legal</h2><p>Fictional conversation showing contributions from Business Agent.</p></div><span className="teams-secure">Illustrated example</span></header>
      <div className="teams-feed">
        <div className="teams-date">Today · Braxton County case</div>
        <TeamsMessage initials="TK" name="Taylor Kim (Legal)" role="Legal Reviewer" tone="person" time="9:41 AM">Can someone confirm whether we have enough ownership evidence to move the 4700701733 matter forward?</TeamsMessage>
        <div className="agent-handoff"><div className="handoff-line"><span className="handoff-icon">↗</span><div><strong>Business Agent orchestrated a bounded handoff</strong><small>Taylor's request is visible to the participating agents</small></div></div><div className="agent-chain"><span className="chain-node person-node">TK</span><span className="chain-arrow">→</span><span className="chain-node">O</span><span className="chain-arrow">→</span><span className="chain-node">T</span><span className="chain-arrow">→</span><span className="chain-node">S</span><div className="chain-labels"><span>Taylor Kim (Legal)</span><span>Ownership Agent</span><span>Title Review Agent</span><span>Case Synthesis Agent</span></div></div></div>
        <TeamsMessage initials="OR" name="Ownership Agent" role="Agent contribution · requested by Taylor Kim (Legal)" tone="agent" time="9:42 AM"><strong>Ownership evidence is incomplete.</strong><br />I found one ownership record and a related division-order record. The current package does not prove the mineral interest or resolve the competing title claim.</TeamsMessage>
        <TeamsMessage initials="TR" name="Title Review Agent" role="Agent contribution · requested by Ownership Agent" tone="agent" time="9:43 AM"><strong>Title-chain review is ready.</strong><br />The next useful documents are the recorded conveyance and curative instrument. I preserved the source conflict instead of treating the public record as a title determination.</TeamsMessage>
        <TeamsMessage initials="CS" name="Case Synthesis Agent" role="Agent contribution · requested by Title Review Agent" tone="agent" time="9:44 AM"><strong>Recommendation: human review.</strong><br />Open a curative packet, keep the matter in review, and assign Legal the next document request.</TeamsMessage>
        <TeamsMessage initials="JL" name="Jordan Lee (Land)" role="Land Analyst" tone="person" time="9:45 AM">I will gather the missing conveyance for Legal to review.</TeamsMessage>
        <div className="teams-boundary"><span>⌁</span><div><strong>Human decision boundary</strong><small>Agents can research, compare, summarize, and route. A person must approve title, filing, payment, or owner-contact actions.</small></div><span className="pill unresolved">REVIEW</span></div>
      </div>
      <div className="teams-composer"><span>Ask Business Agent in # Legal</span><span className="composer-hint">@Business Agent · Attach · Send</span></div>
    </div>
  </section>;
}

function TeamsMessage({ initials, name, role, tone, time, children }: { initials: string; name: string; role: string; tone: "person" | "agent"; time: string; children: React.ReactNode }) {
  return <article className={`teams-message ${tone}`}><span className="message-avatar">{initials}</span><div><div className="message-meta"><strong>{name}</strong><span>{role}</span><time>{time}</time></div><p>{children}</p></div></article>;
}
