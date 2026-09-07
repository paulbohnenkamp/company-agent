# LandOps data and evidence

LandOps separates what a case says, what a public source reports, what the system concludes, and what remains unknown. This separation prevents a convenient value from looking more certain than the evidence allows.

## The main objects

| Object | Meaning |
| --- | --- |
| `LandCase` | The case under review, including jurisdiction and authority boundary |
| `Well` | Well clues submitted with the case |
| `SubmittedEvidence` | A description of material supplied with the case |
| `SourceIdentity` | A publisher and dataset, such as WVDEP or WVGES |
| `SourceSnapshot` | An immutable captured response with a retrieval time and content hash |
| `PublicEvidence` | A normalized fact linked to a source snapshot and source record |
| `ProductionResult` | A production lookup with an explicit status |
| `Finding` | A structured assertion about the case |
| `Conflict` | Competing claims that the system preserves |
| `Unknown` | A question that the available evidence cannot answer |
| `ReconciliationRun` | One versioned execution of the comparison |
| `AgentStep` | One ordered workflow handoff and its artifact |
| `Synthesis` | The review packet that proposes the next route |
| `ConversationTurn` | A question and bounded answer tied to a run |
| `ReviewDecision` | An append-only human decision about a review packet |

## Evidence has a chain of custody

The evidence chain is:

```text
SourceIdentity → SourceSnapshot → PublicEvidence → Finding
```

`SourceIdentity` answers “who published this dataset?” `SourceSnapshot` answers “what exact bytes did we retrieve?” `PublicEvidence` answers “what normalized record did we read from that snapshot?” `Finding` answers “what does the application conclude from the record?”

The content hash links the normalized record back to the captured source. The application can therefore explain where a finding came from.

## Conflicts are data

WVDEP and WVGES can report different operator values. The application stores both claims in a `Conflict` and marks the operator finding as inconclusive. It does not silently prefer one publisher because that would hide a material disagreement.

The React page displays the conflict. The conversation service can explain it. The synthesis routes the case to human review.

## Unknown is not failure

An unknown means the workflow ran successfully but the available evidence cannot answer a question. For example, a production workbook with no matching row produces `NoMatch`, not `ReportedZero`.

An execution failure is different. It means the application could not complete a required operation. Tests in the TypeScript reference runtime cover this distinction, and the C# workflow preserves the same product meaning.

## Production statuses

`ProductionStatus` has four values:

- `Matched`: a production record matched the lookup;
- `ReportedZero`: a matching record explicitly reports zero;
- `NoMatch`: the source was checked but no record matched; and
- `Unavailable`: the application could not use the source.

Never convert `NoMatch` to `ReportedZero`. Missing evidence is not zero production.

## Title boundary

Public regulatory and geological records can support well identity and source comparison. They are not proof of mineral title. The application stores that boundary in the case and repeats it in the synthesis and conversation responses.

Human review remains required before any consequential action.
