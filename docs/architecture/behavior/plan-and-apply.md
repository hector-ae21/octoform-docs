---
title: Plan and apply sequence
description: Sequence Octoform configuration, discovery, observation, planning, confirmation, mutation, and reporting.
---

# Plan and apply sequence

The sequence view follows one `apply` invocation. It shows that the command
calls the shared planning implementation once and retains its result for
confirmation and execution.

<div class="octoform-diagram" role="region" aria-label="Scrollable UML plan and apply sequence diagram" tabindex="0" markdown>

![UML sequence diagram of configuration loading, authentication, owner discovery, policy resolution, state reads, planning, confirmation, grouped mutation, and results](../../assets/diagrams/plan-apply-sequence.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/plan-apply-sequence.puml)

## Consistency boundary

The displayed plan and attempted changes share one in-memory `Change[]`.
Blocked entries are retained for reporting and filtered before the applier.
Declining confirmation terminates the invocation without writes.

The plan is not an immutable cross-job artifact. `octoform plan` followed by a
separate `octoform apply` means two observations and two plans; protected
automation must review this limitation explicitly.

## Failure boundary

The applier orders and groups endpoint-compatible changes. One group failure
does not stop unrelated groups, and no distributed transaction rolls successful
groups back. A fresh plan is the source of truth after partial failure.

Use the [plan and apply guide](../../guides/plan-and-apply.md) for the operator
procedure and [command reference](../../commands/apply.md) for exact exit behavior.
