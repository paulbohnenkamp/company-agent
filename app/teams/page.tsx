import { TeamsCollaborationView } from "../../src/landops/TeamsCollaborationView";
import { TeamsIntegrationPanel } from "../../src/landops/TeamsIntegrationPanel";
import { WorkroomReviewView } from "../../src/landops/WorkroomReviewView";
import "../globals.css";

/** Focused local preview for the Teams channel and its LandOps adapter boundary. */
export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ threadId?: string }> }) {
  const { threadId } = await searchParams;
  return <main className="shell"><header className="topbar"><div><span className="eyebrow">LANDOPS WORKBENCH / CHANNELS</span><h1>Microsoft Teams integration</h1></div><span className="offline"><i /> LOCAL · ADAPTER READY</span></header>{threadId ? <WorkroomReviewView threadId={threadId} /> : null}<TeamsCollaborationView /><TeamsIntegrationPanel /></main>;
}
