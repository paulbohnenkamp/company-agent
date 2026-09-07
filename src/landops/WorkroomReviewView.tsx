"use client";

import * as React from "react";

type WorkroomThread = {
  threadId: string;
  caseId: string;
  scenarioId: string;
  question: string;
  status: string;
  roleId: string;
};

/** Small Teams deep-link destination for reviewing one durable workroom. */
export function WorkroomReviewView({ threadId }: { threadId: string }) {
  const [thread, setThread] = React.useState<WorkroomThread | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch(`/api/landops/workroom/${encodeURIComponent(threadId)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok) throw new Error(response.status === 404 ? "Workroom not found." : "Workroom could not be loaded.");
        return payload;
      })
      .then((payload) => {
        if (!active) return;
        if (isWorkroomThread(payload)) setThread(payload);
        else setError("The workroom response was not recognized.");
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Workroom could not be loaded."); });
    return () => { active = false; };
  }, [threadId]);

  return <section className="workroom-review" aria-label="Focused workroom review">
    <div className="workroom-review-heading"><div><span className="eyebrow blue">FOCUSED REVIEW</span><h2>Workroom handoff</h2><p>Review the question and identity context before taking a human action.</p></div><span className="pill synthetic">TEAMS DEEP LINK</span></div>
    {error ? <div className="alert">{error}</div> : thread ? <div className="workroom-review-grid"><div><span className="muted">Question</span><p className="workroom-question">{thread.question}</p></div><div className="workroom-facts"><div><span className="muted">Case</span><strong>{thread.caseId}</strong></div><div><span className="muted">Scenario</span><strong>{thread.scenarioId}</strong></div><div><span className="muted">Requester role</span><strong>{thread.roleId}</strong></div><div><span className="muted">Status</span><strong>{thread.status}</strong></div></div></div> : <p className="muted">Loading workroom {threadId}…</p>}
  </section>;
}

function isWorkroomThread(value: unknown): value is WorkroomThread {
  if (typeof value !== "object" || value === null) return false;
  const record = Object.fromEntries(Object.entries(value));
  return ["threadId", "caseId", "scenarioId", "question", "status", "roleId"].every((key) => typeof record[key] === "string");
}
