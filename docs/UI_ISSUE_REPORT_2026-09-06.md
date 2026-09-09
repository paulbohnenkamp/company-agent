# LandOps Workbench UI Issue Report

> Historical record. Current product names and information architecture are
> defined in [product naming](product-naming.md). The terms and screenshots
> below describe the earlier implementation, not current branding or live status.

**Review date:** 2026-09-06  
**Surface reviewed:** local Next.js application at `http://localhost:3000/`  
**Evidence:** four user-provided screenshots, source inspection of `app/page.tsx`, `app/globals.css`, and the LandOps UI components, plus the deterministic UI anti-pattern scan.

## Executive summary

The application has a strong product story: a case workspace, a Teams-style collaboration view, synthetic company data, bounded agents, and a human decision boundary. The screenshots also show that the current UI is not ready for a portfolio-quality demonstration.

The most important problems are:

1. The portfolio header has a real layout defect: the company name and active-case title collide.
2. The portfolio statistics are rendered with Fluent UI's light theme, producing bright white cards inside an otherwise dark application.
3. The Case Copilot has a broken information layout. Labels, controls, questions, descriptions, routes, and actions visually run together.
4. The page puts a large amount of secondary catalog and showcase content before the main case action, so users must scroll through the identity directory and Teams mockup before reaching the flagship workflow.
5. The page presents a static Teams-style illustration as if it were an interactive channel. The composer says “Ask LandOps … · Attach · Send,” but it has no input, attachment behavior, or send behavior.

These should be fixed locally before another Azure deployment. The report does not recommend changing the backend or domain behavior as part of the first UI pass.

## Severity summary

| Severity | Count | Meaning |
|---|---:|---|
| P0 | 0 | No issue observed that completely prevents the page from loading. |
| P1 | 6 | Major visual, usability, or product-integrity issue that should be fixed before presenting the app. |
| P2 | 9 | Important usability, responsive, accessibility, or consistency issue. |
| P3 | 7 | Polish issue or design-system cleanup. |

## P1 issues — fix before the next demo

### P1-01 — Portfolio title collision

**Evidence:** Screenshot 1. “Sample Energy Company,” “Braxton County well reconciliation,” and the surrounding context render on the same line and overlap.

**Likely cause:** `CompanyPortfolio.tsx` renders Fluent `Title3` and `Text` next to each other inside a flex child, while the local CSS only styles a native `h3` and does not establish a vertical stack for Fluent typography components.

**Impact:** The active company and case context cannot be read reliably. This is a visible correctness defect at the top of the application.

**Recommendation:** Make the portfolio identity block an explicit vertical stack. Give the company name and active case title separate block-level rows, constrain the text column, and test with long company and case names.

**Source:** `src/business-agent/CompanyPortfolio.tsx`, `.portfolio-context-bar` in `app/globals.css`.

### P1-02 — Light-theme Fluent UI island

**Evidence:** Screenshot 1. The three portfolio metric cards are white while the surrounding application is dark.

**Likely cause:** `CompanyPortfolio` creates a nested `FluentProvider` using `webLightTheme`, while the rest of the app uses a custom dark theme.

**Impact:** The page looks assembled from two unrelated products. The white cards dominate the visual hierarchy and make the application feel unfinished.

**Recommendation:** Use one application-level Fluent theme configured for the LandOps dark palette, or remove the nested provider and style the metrics using the existing tokens. Do not mix a light provider into the dark shell.

**Source:** `src/business-agent/CompanyPortfolio.tsx`.

### P1-03 — Case Copilot content collapse

**Evidence:** Screenshot 3. “Your roleLand Analyst” is visually concatenated; the scenario question, description, agent route, and action labels run together with little separation.

**Likely cause:** `CaseCopilot` uses Fluent `Card`, `Dropdown`, `Text`, and `Textarea`, but the stylesheet has no corresponding `.copilot-*` or `.scenario-*` layout rules. The existing rules only cover `.scenario-actions`.

**Impact:** This is the main user-facing question flow, yet users cannot easily tell which control selects a role, which text is the question, which text explains it, or which action starts the work.

**Recommendation:** Add a deliberate Copilot layout: header, role selector, thread-context field, scenario rows, question/description/agent route hierarchy, and a right-aligned action group. Add visible labels and spacing between every semantic unit. Verify long scenario text and narrow widths.

**Source:** `src/business-agent/CaseCopilot.tsx`, `app/globals.css`.

### P1-04 — Primary workflow is buried below showcase content

**Evidence:** Screenshots 1–4 and the render order in `app/page.tsx`.

**Impact:** The user sees the identity catalog, Teams channel, data room, and Copilot before reaching “Run Land-Well Reconciliation.” The application’s most important action is not the first obvious path for a first-time reviewer.

**Recommendation:** Put the active case and primary workflow at the top. Move the identity catalog, Teams story, and data room into tabs, a secondary workspace navigation, or collapsible panels. Keep the Teams view available as a prominent alternate surface, but do not force every reviewer through it before the case action.

### P1-05 — Static Teams shell implies controls that do not work

**Evidence:** Screenshot 2. The composer displays “Ask LandOps in # land-title-review” and “@LandOps · Attach · Send,” but it is a non-interactive `div`.

**Impact:** A reviewer cannot tell whether this is a screenshot-quality product surface, a simulated transcript, or an actual Teams integration. The UI promises an action that does nothing.

**Recommendation:** Either make the composer a clearly labeled “Preview” element, or implement a bounded local interaction that accepts a message and appends a simulated response. Keep real Teams integration status separate from the visual preview.

**Source:** `src/business-agent/TeamsCollaborationView.tsx`, `.teams-composer` in `app/globals.css`.

### P1-06 — Environment and product identity are inconsistent

**Evidence:** Screenshot 1 and `app/layout.tsx`/`app/page.tsx`.

**Impact:** The browser title is “Business Agent,” the visible brand is “BUSINESS AGENT / LAND ADMINISTRATION,” the product goal is LandOps Workbench, and the status says “LOCAL · FROZEN EVIDENCE.” This undermines the portfolio narrative and is especially misleading when the same UI is deployed to Azure.

**Recommendation:** Use “LandOps Workbench” consistently in metadata, visible headings, loading state, and screenshots. Make the environment badge configuration-driven: local demo, Azure connected, or Teams preview should be distinct states.

**Source:** `app/layout.tsx`, `app/page.tsx`.

## P2 issues — address in the next UI pass

### P2-01 — Excessive single-page length and weak wayfinding

The page contains portfolio, 14-person identity catalog, Teams shell, data room, Copilot, workroom, review packet, flagship workflow, evidence, conflicts, unknowns, findings, synthesis, human review, and chat. There is no persistent section navigation, progress indicator, or “back to case” affordance.

**Recommendation:** Introduce a compact workspace navigation with “Case,” “Collaboration,” “Data room,” and “Review,” or split these into routes while preserving the single-click demo path.

### P2-02 — Identity catalog is too prominent for the first screen

The full synthetic directory consumes most of the first viewport and is not needed to run the case. It reads like administrative configuration rather than operational work.

**Recommendation:** Show the current user and authorized groups in a compact context control; move the full directory to an Admin/People view.

### P2-03 — No clear active-user context in the main shell

The Teams mockup identifies Alex Morgan, while the Case Copilot separately lets the user select a role. The relationship between the current user, selected role, Entra group, and available actions is not explicit.

**Recommendation:** Establish one “signed-in as” context at the shell level and derive role-scoped controls from it. Treat role simulation as an explicit demo-only switch.

### P2-04 — Action hierarchy is inconsistent

The page has “Run Land-Well Reconciliation,” “Use question,” “Open Workroom,” “Run seeded review,” review decisions, “Ask,” and many suggestion chips. Several actions use similar visual weight even though they have very different consequences.

**Recommendation:** Define one primary action per surface, one secondary action, and quiet tertiary links. Make the human approval action visually distinct from simulation and navigation actions.

### P2-05 — Small monospace text is overused

Many labels, routes, statuses, identifiers, and supporting descriptions use 9–12px monospace text. This creates a dense technical texture and reduces readability for land, legal, and accounting users.

**Recommendation:** Reserve monospace for IDs, provenance, timestamps, and machine statuses. Use the primary UI font for labels and explanations, with a minimum readable size around 12–13px.

### P2-06 — Responsive behavior is under-specified for tablet widths

The major responsive breakpoint is `760px`. The Teams shell keeps a 245px sidebar and the portfolio grid remains dense above that threshold. The app should be tested at common laptop, tablet, and browser zoom widths, not only a wide desktop screenshot.

**Recommendation:** Add an intermediate layout state around tablet widths, allow the Teams sidebar to collapse, and test at 200%, 1280px, 1024px, 768px, and mobile widths.

### P2-07 — Keyboard and focus behavior is not visually designed

The interface contains buttons, details disclosure controls, a dropdown, textarea, input, and links, but the stylesheet does not define a clear `:focus-visible` treatment.

**Impact:** Keyboard users may lose their place, especially on this long page.

**Recommendation:** Add a consistent high-contrast focus ring and test the complete tab order from the shell through the review actions.

### P2-08 — Disclosure controls do not communicate enough state

Data-room records and evidence use native `details`, but the visual affordance is largely removed with `list-style: none` and no replacement chevron or open-state indicator for every disclosure.

**Recommendation:** Add a consistent disclosure icon, preserve an obvious open/closed state, and include counts where useful.

### P2-09 — Empty, loading, and error states are not product-quality

The loading state is a bare heading. Error messages appear as a generic alert near the workflow. There is no clear recovery action or explanation of which data failed to load.

**Recommendation:** Use section-level skeletons or calm loading copy, identify the failed service or operation, and provide “Retry” actions without forcing a full-page refresh.

## P3 issues — polish and design-system cleanup

### P3-01 — Repeated eyebrow labels create visual noise

Nearly every section begins with small uppercase tracked text: `CURRENT PORTFOLIO`, `IDENTITY CATALOG`, `MICROSOFT TEAMS CHANNEL`, `SAMPLE ENERGY DATA ROOM`, `CASE COPILOT`, `FLAGSHIP WORKFLOW`, and many more.

**Recommendation:** Keep the eyebrow treatment for a few high-value section markers and let headings carry the rest of the hierarchy.

### P3-02 — Accent side borders repeat the same AI-dashboard pattern

The deterministic scan found multiple thick colored left borders on notices, claims, chat questions, workroom context, and packet unknowns.

**Recommendation:** Replace repeated side stripes with restrained full borders, tinted backgrounds, icons, or semantic status markers. Keep one accent pattern only where it communicates a real boundary.

### P3-03 — Heavy nested-card treatment

The application stacks cards inside cards inside large feature sections. This makes the page feel like a collection of panels rather than one coherent work surface.

**Recommendation:** Flatten the most important hierarchy: use section backgrounds and dividers for grouping, reserving cards for independent objects that users can act on.

### P3-04 — Typography lacks a deliberate product voice

The global font is Arial, combined with many monospace labels. The result is functional but generic and visually uneven.

**Recommendation:** Choose a documented UI type stack with a clear reading face and a constrained metadata face. Update `docs` with the typography rule so future components remain consistent.

### P3-05 — Static timestamps and case details look live

The Teams transcript uses fixed times such as 9:41 AM, and the page uses statuses such as “ready” and “Entra protected.” In a demo this is acceptable, but the UI does not consistently identify which values are illustrative.

**Recommendation:** Add a concise “Scenario preview” or “Synthetic transcript” label to clearly distinguish seeded content from live collaboration.

### P3-06 — Footer exposes a developer-facing catalog endpoint

“View catalog API” is useful during development but is not a polished end-user footer action.

**Recommendation:** Hide it behind a developer mode or move it into the documentation/developer surface.

### P3-07 — Browser and accessibility metadata are incomplete

`app/layout.tsx` supplies a generic title and description but no application-specific metadata, theme color, or viewport-level product identity. The visible sections have some `aria-label` coverage, but the page lacks a clear navigation landmark and semantic section navigation.

**Recommendation:** Add accurate LandOps metadata and semantic landmarks after the visual hierarchy is corrected.

## Deterministic scan findings

The UI anti-pattern scan found six warnings:

- Five uses of side-tab accent borders in `app/globals.css`.
- One use of the generic Arial font in `app/globals.css`.

These are not the most urgent defects, but they confirm the visual pattern visible in the screenshots: repeated colored side stripes and a generic typography system.

## What is working

- The Teams collaboration story is immediately understandable in Screenshot 2: a human request, a bounded agent chain, evidence-aware responses, and an explicit human decision boundary.
- The synthetic-data notices and authority boundary are responsible and appropriate for a portfolio application handling title and payment-adjacent workflows.
- The dark palette, restrained amber/blue semantic accents, and consistent panel geometry establish a recognizable product direction. The problem is consistency and hierarchy, not a need to discard the entire visual language.

## Recommended repair order

1. Fix the portfolio title collision and remove the nested light Fluent theme.
2. Rebuild the Case Copilot layout and test long questions at desktop, tablet, and mobile widths.
3. Clarify the primary workspace hierarchy so the active case and flagship workflow appear before catalog/showcase content.
4. Make the Teams composer either functional in the local demo or explicitly labeled as a preview.
5. Unify product/environment identity and add a real focus state, disclosure affordances, and recovery states.
6. Finish with typography, side-border, nested-card, and eyebrow cleanup.

## Review conclusion

**CHANGES REQUIRED.** The application has a compelling foundation, but the visible layout defects and unclear interaction boundaries are substantial enough that it should not be presented as portfolio-ready yet. The first repair pass should stay local and focus on the six P1 issues before any redeployment.
