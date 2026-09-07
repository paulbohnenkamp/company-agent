---
id: 038-teams-channel-adapter
title: Checkpoint 038 result: Microsoft Teams channel adapter
status: completed
completed: 2026-09-07
spec: specs/038-teams-channel-adapter.md
---


# Checkpoint 038 result: Microsoft Teams channel adapter

## Status

Completed locally.

## Delivered

- Added the transport-neutral Teams adapter in `src/teams/landops-adapter.ts`.
- Added the real Microsoft Teams SDK entrypoint in `src/teams/server.ts`.
- Added personal, group-chat, and channel scope mapping.
- Added bot-mention removal, tenant/user preservation, process-local activity idempotency, and safe Workroom reply formatting.
- Added `TeamsCollaborationView` so the portfolio UI shows a human-to-agent-to-agent flow instead of implying the browser is Microsoft Teams.
- Added adapter tests and documented the remaining production registration/deployment work.
- Added `docs/images/landops-teams.png` and linked both UI images from the top-level README.
- Added the focused `/teams` route and `docs/images/landops-teams-integration.png` for the Teams SDK → ASP.NET Core boundary.

## Verification

- `npm test -- --runInBand`: 129 tests passed.
- `npx tsc --noEmit --incremental false`: passed.
- `git diff --check`: passed.
- Browser inspection confirmed the Teams collaboration view renders Alex Morgan, three delegated agents, the channel shell, and the human decision boundary.
- Browser inspection confirmed the focused integration route renders Microsoft Teams, the SDK adapter, ASP.NET Core, the agent handoff, and the production next-step boundary.

## Environment note

The restricted sandbox cannot update the existing generated `tsconfig.tsbuildinfo`
file, but the equivalent incremental-disabled typecheck passed. The production
Next.js build passed in the permitted build environment.

## What changed

The implementation claims in the original result content are preserved below.

## Files changed

See the original result content and the canonical inventory in docs/PROJECT_STATE.md.

## Checks run and results

Verification evidence is preserved in the original result content; unresolved limits are called out in docs/PROJECT_STATE.md.

## Deviations from the spec

No deviation is inferred by this metadata normalization. Review the original result content for slice-specific deviations.

## Important decisions

This slice remains first-class project history. The current product direction is recorded in docs/PROJECT_STATE.md.

## Remaining follow-ups

See docs/PROJECT_STATE.md and the matching spec for current follow-ups.
