---
id: 058-specialized-agent-expansion
title: Expand Company Agent through specialized capabilities
status: completed
completed: 2026-09-11
spec: specs/058-specialized-agent-expansion.md
---

## What changed

- Added an HR Agent routing example to the README.
- Added a focused spec documenting extensibility beyond Land.
- Listed Accounting Agent, Compliance Agent, Finance Agent, HR Agent, IT Agent,
  Land Agent, Legal Agent, and Operations Agent alphabetically as illustrative
  capabilities.
- Kept Company Agent as the shared Teams front door and application boundary.

## Files changed

- `README.md`
- `specs/058-specialized-agent-expansion.md`
- `results/058-specialized-agent-expansion.md`

## Checks run and results

- `node --version` — passed.
- `npm run validate:records` — passed.
- `npm run validate:naming` — passed.
- `git diff --check` — passed.

## Deviations from the spec

None.

## Important decisions

- Additional specialist agents are future capabilities, not implemented
  product components in this slice.
- The HR example uses public-safe policy lookup and request guidance, not
  private employee data or employment decisions.

## Remaining follow-ups

- Create separate approved specs for any specialist capability selected for
  implementation.
