---
title: State models
description: Follow configuration processing and planned changes through complete Octoform 0.3 lifecycles.
---

# State models

Two state machines separate configuration processing from the lifecycle of an
individual desired-state difference.

## Configuration lifecycle

<div class="octoform-diagram" role="region" aria-label="Scrollable UML configuration lifecycle state diagram" tabindex="0" markdown>

![UML state diagram showing unloaded, loading, invalid, normalized, resolving, inventory-only, effective, observing, planned, and failed configuration states](../../assets/diagrams/configuration-lifecycle.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/configuration-lifecycle.puml)

A configuration becomes normalized only after composition and validation.
Resolution repeats for each repository. Inventory-only paths retain intentional
visibility without entering mutation planning. Observation can preserve an
explicit unreadable value inside a valid plan; only unhandled discovery or API
failure moves the operation to the failed state.

## Change lifecycle

<div class="octoform-diagram" role="region" aria-label="Scrollable UML change lifecycle state diagram" tabindex="0" markdown>

![UML state diagram showing candidate, no-drift, blocked, executable, planned, declined, attempting, succeeded, and failed change states](../../assets/diagrams/change-lifecycle.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/change-lifecycle.puml)

A candidate becomes executable only when current state is readable, drift
exists, and capability evidence supports the operation. Blocked changes end as
reported-only evidence. Executable changes can end after read-only planning,
after declined confirmation, or after a reported success or failure.

No transition exists from blocked directly to attempting. The cause must
change, and a new invocation must observe and plan again.
