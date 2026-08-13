---
title: Architecture overview
description: See how declared policy, observed GitHub state, planning, confirmation, and application interact.
---

# Architecture overview

Octoform separates declaration, observation, planning, and mutation. The planner
is deterministic: the same normalized desired and observed state produces the
same ordered changes.

<div class="octoform-diagram" role="region" aria-label="Scrollable domain model diagram" tabindex="0" markdown>

![UML class diagram showing configuration policy and observed repository state converging into planned and applied changes](../assets/diagrams/domain-model.svg)

</div>

[Open the PlantUML source](../assets/diagrams/sources/domain-model.puml)

## Core safety properties

1. Omission means unmanaged, not disabled or deleted.
2. Unreadable state blocks a change instead of producing a guessed diff.
3. Capability decisions use API evidence rather than hard-coded product plans.
4. `apply` operates on the plan already shown to the operator.
5. Destructive absence-based reconciliation is outside the normal contract.

The application repository contains the
[current domain model](https://github.com/hector-ae21/octoform/blob/v0.x/docs/domain-model.md)
and implementation tests for these properties.
