"use client";

import { useState } from "react";
import { Button, Card, Dropdown, Option, Text, Textarea } from "@fluentui/react-components";

export type RoleScenarioData = {
  id: string;
  roleId: string;
  roleName: string;
  question: string;
  description: string;
  agentIds: string[];
  evidenceTypes: string[];
  escalatesToWorkroom: boolean;
  humanOutcome: string;
  requiredGroup: string;
};

type Props = {
  scenarios: RoleScenarioData[];
  onQuestionSelect: (question: string) => void;
  onWorkroomCreate: (scenario: RoleScenarioData, threadContext: string) => void;
};

/**
 * The Case Copilot is the individual analyst surface. It suggests realistic
 * questions without pretending that every question is already a work thread.
 */
export function CaseCopilot({ scenarios, onQuestionSelect, onWorkroomCreate }: Props) {
  const roleOptions = [...new Map(scenarios.map((scenario) => [scenario.roleId, scenario.roleName])).entries()];
  const [roleId, setRoleId] = useState(roleOptions[0]?.[0] ?? "");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>();
  const [threadContext, setThreadContext] = useState("Legal asked us to confirm the lease notice period before the development gate. Please compare the obligation with the current case evidence.");
  const roleScenarios = scenarios.filter((scenario) => scenario.roleId === roleId);

  return <Card className="copilot-card" aria-label="Case Copilot">
    <div className="copilot-header"><div><span className="eyebrow blue">CASE COPILOT</span><h3>Start with a role question</h3><Text block>Private, case-scoped questions first. Escalate to a shared Workroom when other people or departments need to act.</Text></div><span className="copilot-scope">CURRENT CASE ONLY</span></div>
    <div className="copilot-controls"><label htmlFor="copilot-role">Your role</label><Dropdown id="copilot-role" value={roleOptions.find(([id]) => id === roleId)?.[1] ?? ""} selectedOptions={[roleId]} onOptionSelect={(_, data) => setRoleId(data.optionValue ?? roleId)}><>{roleOptions.map(([id, name]) => <Option key={id} value={id}>{name}</Option>)}</></Dropdown></div>
    <div className="thread-context"><label htmlFor="thread-context">Teams-style thread context <span>Optional excerpt, one message per line</span></label><Textarea id="thread-context" value={threadContext} onChange={(_, data) => setThreadContext(data.value)} resize="vertical" /></div>
    <div className="scenario-list">{roleScenarios.map((scenario) => <article className={`scenario-card ${selectedScenarioId === scenario.id ? "selected" : ""}`} key={scenario.id}><div><strong>{scenario.question}</strong><span>{scenario.description}</span><small className="scenario-route">{scenario.agentIds.map((agentId) => agentId.replaceAll("-", " ")).join(" → ")}</small><small>{scenario.escalatesToWorkroom ? "Workroom handoff" : "Copilot answer"} · {scenario.humanOutcome}</small></div><div className="scenario-actions"><Button appearance="secondary" onClick={() => { setSelectedScenarioId(scenario.id); onQuestionSelect(scenario.question); }}>{selectedScenarioId === scenario.id ? "Queued" : "Use question"}</Button>{scenario.escalatesToWorkroom && <Button appearance="primary" onClick={() => onWorkroomCreate(scenario, threadContext)}>Open Workroom</Button>}</div></article>)}</div>
  </Card>;
}
