import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const specSections = {
  "Goal": "The goal stated by the original record is preserved in its Objective or equivalent section below.",
  "Non-goals": "See the existing scope and deferred work described in this record.",
  "Current-state findings": "This section was added during the 2026-09-07 project-state reconciliation. Existing record content remains below and is the source material for this slice.",
  "Chosen approach": "The existing implementation approach remains the source of truth for this completed slice; future changes must use a new approved spec.",
  "Alternatives considered": "The alternatives and trade-offs are preserved in the existing record content. No alternative is implied by this normalization.",
  "Affected files or modules": "See the implementation files named in this record and the canonical inventory in docs/PROJECT_STATE.md.",
  "Milestones": "The slice milestones are represented by the implementation and verification notes in this record.",
  "Acceptance criteria": "The original acceptance claims are preserved in this record. Verification evidence is recorded in the matching result where available.",
  "Verification commands": "See the matching result and docs/PROJECT_STATE.md for the commands used and the limits of the evidence.",
  "Risks and open questions": "Remaining risks and open questions are tracked in the matching result and docs/PROJECT_STATE.md.",
  "Progress log": "2026-09-07: Record metadata and required structure normalized; original content preserved.",
  "Decision log": "2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.",
};

const resultSections = {
  "What changed": "The implementation claims in the original result content are preserved below.",
  "Files changed": "See the original result content and the canonical inventory in docs/PROJECT_STATE.md.",
  "Checks run and results": "Verification evidence is preserved in the original result content; unresolved limits are called out in docs/PROJECT_STATE.md.",
  "Deviations from the spec": "No deviation is inferred by this metadata normalization. Review the original result content for slice-specific deviations.",
  "Important decisions": "This slice remains first-class project history. The current product direction is recorded in docs/PROJECT_STATE.md.",
  "Remaining follow-ups": "See docs/PROJECT_STATE.md and the matching spec for current follow-ups.",
};

function frontMatter(markdown) {
  if (!markdown.startsWith("---\n")) return null;
  const end = markdown.indexOf("\n---", 4);
  if (end < 0) return null;
  const fields = Object.fromEntries(markdown.slice(4, end).split("\n").filter((line) => line.includes(":")).map((line) => {
    const [key, ...rest] = line.split(":");
    return [key.trim(), rest.join(":").trim()];
  }));
  return { fields, start: 0, end: end + 4 };
}

function heading(markdown) {
  return markdown.split("\n").find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "") ?? "LandOps execution record";
}

function addSection(markdown, sections) {
  const additions = Object.entries(sections).filter(([title]) => !new RegExp(`^##\\s+${title}\\s*$`, "im").test(markdown));
  return additions.length ? `${markdown.trimEnd()}\n\n${additions.map(([title, text]) => `## ${title}\n\n${text}`).join("\n\n")}\n` : markdown;
}

async function normalize(directory, kind) {
  for (const file of (await readdir(directory)).filter((name) => /^\d{3}-.+\.md$/.test(name))) {
    const id = file.slice(0, -3);
    if (id === "042-project-state-reconciliation") continue;
    const path = join(directory, file);
    let markdown = await readFile(path, "utf8");
    const parsed = frontMatter(markdown);
    const fields = parsed?.fields ?? {};
    const title = fields.title ?? heading(markdown);
    const normalized = kind === "spec"
      ? { id, title, status: fields.status ?? "completed", created: fields.created ?? "2026-09-07", updated: "2026-09-07", result: `results/${id}.md` }
      : { id, title, status: "completed", completed: fields.completed ?? "2026-09-07", spec: `specs/${id}.md` };
    const yaml = Object.entries(normalized).map(([key, value]) => `${key}: ${value}`).join("\n");
    if (parsed) markdown = `---\n${yaml}\n---\n${markdown.slice(parsed.end)}`;
    else markdown = `---\n${yaml}\n---\n\n${markdown}`;
    markdown = addSection(markdown, kind === "spec" ? specSections : resultSections);
    await writeFile(path, markdown);
  }
}

await normalize("specs", "spec");
await normalize("results", "result");
