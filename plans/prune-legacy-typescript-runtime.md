# Prune the legacy TypeScript runtime

This plan executes [spec 057](../specs/057-prune-legacy-typescript-runtime.md).

## Status

Done.

## Steps

1. Back up the current checkout at `/Users/paul/code/company-agent-legacy-typescript`.
2. Remove the legacy `src/` runtime, TypeScript tests, and dependent evaluator.
3. Keep artifact-validation and identity-provisioning scripts.
4. Update package, CI, and current documentation commands.
5. Verify the C# application and remaining repository tooling.
6. Record, commit, and push the result.

Completed after verification on 2026-09-11.
