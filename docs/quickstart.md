# TypeScript reference quickstart

> Reference material. The current product path starts with the
> [Business Agent learner path](business-agent-learning-path.md) and uses the
> C#/.NET API with Microsoft Teams.

Install dependencies and inspect the land domain.

```sh
npm install
npm run cli -- domain list
npm run cli -- agent list --domain land-administration
npm run cli -- flow list --domain land-administration
```

Run the offline reference flow.

```sh
export BUSINESS_AGENT_WORKSPACE=/tmp/business-agent-run
npm run cli -- run \
  --domain land-administration \
  --flow wv-land-well-reconciliation \
  --context examples/inputs/parcel-transfer.md
```

The CLI runner is the legacy Markdown runner. Typed WV execution and the
Microsoft Foundry provider boundary are documented elsewhere; this command is
retained for reference-runtime comparisons and offline evaluations.

Run the local evaluation harness:

```sh
npm run eval -- case-synthesizer
```

Start the review console:

```sh
npm run dev
```

Open `http://localhost:3000/review` after a run. Enter the run ID to approve or
reject the review packet. The local action gateway remains blocked by default.
