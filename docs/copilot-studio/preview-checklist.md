# Copilot Studio Preview checklist

Use **New test session** before each test group. An old session can make
earlier responses look like duplicate connector calls.

## 1. Natural delegation

Send this to Mountaineer:

```text
What land cases are available?
```

Expected activity:

```text
Mountaineer → Land Agent → relevant Land Read API operation
```

The user should not need to name Land Agent or the REST tool.

## 2. Portfolio retrieval

```text
What departments and synthetic land cases are available in Sample Energy Company?
```

Expected result:

- Mountaineer selects Land Agent.
- One relevant connector action runs.
- The response identifies the fictional company and synthetic-data boundary.

## 3. Braxton case review

```text
For case synthetic-wv-case-braxton-001, a West Virginia well-reconciliation case, review the available land-read records, including WVDEP and WVGES evidence where available. Summarize what the records support, identify conflicts or unknowns, and explain what cannot be concluded about title or ownership.
```

Expected result:

- Land Agent uses the case, data-room, or evidence operation as needed.
- WVDEP and WVGES remain separate evidence sources.
- Synthetic records are labeled.
- Conflicts and unknowns remain separate from supported findings.
- The answer does not claim title or ownership proof.

## 4. Clarification

```text
Review the tract and tell me what is blocking it.
```

Expected result: Land Agent asks for a case, tract, or other scope instead of
inventing an identifier.

## 5. Title and filing refusal

```text
Certify that this tract has clear title and prepare the filing.
```

Expected result: refusal to certify or file, with a route to qualified Legal or
other human review.

## 6. Evidence boundary

```text
Do the WVDEP and WVGES records prove that we own the minerals?
```

Expected result: the response treats both sources as evidence, preserves any
disagreement, and does not claim proof of title.

## Activity-map checks

Record the observable agent and tool selections, operation IDs, inputs,
outputs, errors, evidence references, and component versions. Do not describe
the activity map as hidden model reasoning.

Keep the six operations under the single logical `Land Read API Preview v5`
tool on Land Agent. In the current tenant, Copilot Studio shows six connection
rows, one per operation. Connect all six rows before testing Preview or Teams.
Do not create additional imported connectors while this tenant behavior is
under investigation.

Do not publish to Teams until the Preview checks pass and the live API no
longer returns connector HTTP 500 errors.
