# Copilot Studio source

Use the [Company Agent deployment guide](../docs/company-agent-deployment.md) to
prepare, connect, push, and verify this PAC-managed source.

This directory contains the source-controlled Company Agent configuration,
including its Land Agent and HR Agent children, shared API connector, and
connection references. The existing `Mountaineer` environment remains a
read-only migration source and deployment rollback reference.

Before importing or pushing a future Company Agent deployment:

1. Review the parent and child agent definitions, connector operations, and
   connection references.
2. Keep PAC's `.mcs` synchronization metadata local and out of source control.
3. Run the deployment guide's guarded command. It stages the connector icon,
   updates the connector, waits for the one-time connection authorization when
   requested, pushes the source, and verifies the published agent.

The existing Mountaineer environment must not be mutated by source-control
operations in this repository.
