import { TeamsCollaborationView } from "../../src/business-agent/TeamsCollaborationView";
import { TeamsIntegrationPanel } from "../../src/business-agent/TeamsIntegrationPanel";
import { WorkroomReviewView } from "../../src/business-agent/WorkroomReviewView";
import "../globals.css";

/** Focused local preview for the Teams channel and its LandOps adapter boundary. */
export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ threadId?: string }> }) {
  const { threadId } = await searchParams;
  return <main className="shell"><header className="topbar"><div><span className="eyebrow">BUSINESS AGENT / TEAMS</span><h1>Microsoft Teams integration</h1></div><span className="offline"><i /> ILLUSTRATED EXAMPLE</span></header>{threadId ? <WorkroomReviewView threadId={threadId} /> : null}<TeamsCollaborationView /><TeamsIntegrationPanel /></main>;
}
