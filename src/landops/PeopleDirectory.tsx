"use client";

import React from "react";

import type { IdentityCatalog } from "./IdentityCatalog";

/** Shows the synthetic directory without implying these are real Entra users. */
export function PeopleDirectory({ catalog }: { catalog: IdentityCatalog }) {
  return <section className="card people-directory" aria-label="Synthetic employee directory"><div className="card-head"><div><span className="eyebrow blue">IDENTITY CATALOG</span><h3>People and access groups</h3></div><span className="pill synthetic">SYNTHETIC · {catalog.personas.length} PEOPLE</span></div><p className="muted">Fictional people and their departments. These example email addresses are not tenant sign-ins.</p><div className="people-grid">{catalog.personas.map((persona) => <article className="person-card" key={persona.id}><span className="person-initials">{persona.displayName.split(" (")[0].split(" ").map((part) => part[0]).join("")}</span><div><strong>{persona.displayName}</strong><small>{persona.jobTitle} · {persona.departmentId.replaceAll("-", " ")}</small><span>{persona.id.replaceAll("-", ".")}@{catalog.emailDomain}</span><em>{persona.groupIds.length ? persona.groupIds.join(" · ") : "Platform access"}</em></div></article>)}</div></section>;
}
