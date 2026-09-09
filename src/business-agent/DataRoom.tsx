"use client";

import { Card } from "@fluentui/react-components";

export type FictionalCaseRecord = {
  recordId: string;
  caseId: string;
  recordType: string;
  title: string;
  status: string;
  isSynthetic: boolean;
  provenance: string;
  extractedFacts: Record<string, string>;
  relevantAgentIds: string[];
  warnings: string[];
};

type Props = { records: FictionalCaseRecord[] };

const recordLabels: Record<string, string> = {
  lease: "LEASE",
  title: "TITLE",
  "division-order": "DIVISION ORDER",
  ownership: "OWNERSHIP",
  ocr: "OCR EXTRACTION",
};

/** A compact, read-only view of the fictional records that agents analyze. */
export function DataRoom({ records }: Props) {
  return <section className="data-room card" aria-label="Fictional company data room">
    <div className="card-head"><div><span className="eyebrow blue">COMPANY RECORDS</span><h3>Seed records agents can analyze</h3></div><span className="pill synthetic">ALL SYNTHETIC</span></div>
    <p className="muted data-room-intro">Lease, title, ownership, division-order, and OCR examples for the fictional case. These records are training data, not legal, title, or payment decisions.</p>
    <div className="data-room-grid">{records.map((record) => <details className="data-record" key={record.recordId}><summary><span className="record-type">{recordLabels[record.recordType] ?? record.recordType.toUpperCase()}</span><strong>{record.title}</strong><span className="record-status">{record.status.replaceAll("-", " ")}</span></summary><div className="data-record-body"><p className="muted">{record.provenance}</p><div className="record-facts">{Object.entries(record.extractedFacts).slice(0, 4).map(([key, value]) => <div key={key}><span>{key.replaceAll(/([A-Z])/g, " $1")}</span><strong>{value}</strong></div>)}</div><div className="record-footer"><span>Agents: {record.relevantAgentIds.map((id) => id.replaceAll("-", " ")).join(", ")}</span>{record.warnings.map((warning) => <span className="record-warning" key={warning}>{warning}</span>)}</div></div></details>)}</div>
  </section>;
}
