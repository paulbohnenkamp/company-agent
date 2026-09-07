"use client";

import { Badge, Card, FluentProvider, Text, Title3, webLightTheme } from "@fluentui/react-components";

export type CompanyPortfolioData = {
  companyName: string;
  description: string;
  isSynthetic: boolean;
  dataNotice: string;
  departments: { id: string; name: string; shortName: string }[];
  roles: { id: string; name: string; departmentId: string; description: string }[];
  groups: { id: string; name: string; description: string; departmentIds: string[] }[];
  agents: { id: string; name: string; departmentId: string; purpose: string }[];
  workflows: { id: string; name: string; description: string; status: string }[];
  cases: { caseId: string; title: string; jurisdiction: string; status: string; primaryWorkflow: string; isSynthetic: boolean }[];
};

type Props = { company: CompanyPortfolioData; activeCaseId: string };

/**
 * The portfolio header makes the demo feel like a company product instead of
 * a disconnected fixture. It is intentionally read-only until Entra and
 * case-scoped authorization are added.
 */
export function CompanyPortfolio({ company, activeCaseId }: Props) {
  const activeCase = company.cases.find((item) => item.caseId === activeCaseId) ?? company.cases[0];
  const activeDepartmentIds = new Set(company.agents.map((agent) => agent.departmentId));

  return <FluentProvider theme={webLightTheme}><section className="portfolio-shell" aria-label="Company portfolio">
    <div className="portfolio-context-bar">
      <div>
        <span className="eyebrow">CURRENT PORTFOLIO</span>
        <Title3>{company.companyName}</Title3>
        <Text>{activeCase?.title ?? "Active matter"}</Text>
      </div>
      <div className="portfolio-context-meta">
        <Badge appearance="tint" color="success">SYNTHETIC DATA</Badge>
        <span>{activeCase?.jurisdiction ?? "West Virginia"} · {activeCase?.status ?? "ready"}</span>
      </div>
    </div>
    <div className="department-strip" aria-label="Active departments">
      {company.departments.filter((department) => activeDepartmentIds.has(department.id) || department.id === "accounting" || department.id === "compliance").map((department) => <span className="department-chip" key={department.id}>{department.shortName}</span>)}
    </div>
    <div className="portfolio-grid compact">
      <Card className="portfolio-stat"><strong>{company.agents.length}</strong><span>agent roles</span></Card>
      <Card className="portfolio-stat"><strong>{company.workflows.length}</strong><span>workflows</span></Card>
      <Card className="portfolio-stat"><strong>{company.groups.length}</strong><span>review groups</span></Card>
    </div>
    <details className="portfolio-details">
      <summary>Portfolio context · agent team and synthetic-data notice</summary>
      <div className="agent-rail">
        <div><span className="eyebrow blue">AGENT TEAM</span><p className="muted">Bounded specialists working from the same case evidence.</p></div>
        <div className="agent-list">{company.agents.slice(0, 6).map((agent) => <span className="agent-chip" key={agent.id} title={agent.purpose}><i />{agent.name}</span>)}</div>
      </div>
      <p className="portfolio-notice">{company.dataNotice}</p>
    </details>
  </section></FluentProvider>;
}
