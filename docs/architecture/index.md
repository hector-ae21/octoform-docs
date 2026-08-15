---
title: Architecture
description: Navigate the requirements, software structure, behavior, state, trust, and delivery views of Octoform 0.5.
---

# Architecture

These views explain how Octoform `0.5` turns reviewed YAML into observable,
planned, and explicitly confirmed GitHub operations. They describe the released
system, which governs an account as well as its repositories, and exclude the
Actions, environments and secret-management features planned for later lines.

Every diagram is rendered locally from versioned PlantUML source. The public
site serves static SVG files and sends neither documentation content nor source
code to an external diagram service.

## Requirements views

| Artefact | Purpose |
| --- | --- |
| [Requirements overview](requirements/index.md) | Explain how the requirements artefacts are recorded and why they are required to agree with each other. |
| [Actors and use cases](requirements/actors-and-use-cases.md) | Define each human, automation, application, and external-system role and the individual goals they pursue. |
| [Operator context](requirements/operator-context.md) | Place every use case on one state model: what the operator holds, and which use case moves them. |
| [Use-case specifications](requirements/use-cases/index.md) | Specify each use case as a conversation, with preconditions and the states it can end on. |
| [System context](requirements/system-context.md) | Show how those actors enter through the CLI or ESM API and how Octoform reaches GitHub. |

## Software structure

| Artefact | Purpose |
| --- | --- |
| [Container view](software/container-view.md) | Locate the Node.js process, local inputs, credential boundary, transport, output, and GitHub state. |
| [Runtime components](software/runtime-components.md) | Explain responsibilities and dependencies inside the process. |
| [Domain model](software/domain-model.md) | Define declared, observed, capability, planned, and applied concepts. |

## Behavior and state

| Artefact | Purpose |
| --- | --- |
| [Configuration loading](behavior/configuration-loading.md) | Trace recursive imports, relative paths, composition, and validation. |
| [Policy resolution](behavior/policy-resolution.md) | Resolve defaults, type policy, named overrides, `null`, and management boundaries. |
| [Repository selection](behavior/repository-selection.md) | Explain owner-aware discovery, exclusions, filters, archive handling, and observation scope. |
| [Plan and apply](behavior/plan-and-apply.md) | Sequence reads, planning, confirmation, grouped mutation, and results. |
| [Owner reconciliation](behavior/owner-reconciliation.md) | Reconcile the account itself, and derive apply order from a dependency graph rather than from written order. |
| [State models](behavior/state-models.md) | Follow configuration and individual changes through their complete lifecycles. |

## Trust and delivery

| Artefact | Purpose |
| --- | --- |
| [Trust and data flow](trust/trust-and-data-flow.md) | Identify credential, configuration, network, GitHub, and logging boundaries. |
| [Automation patterns](delivery/automation-patterns.md) | Separate pull-request planning, scheduled auditing, and protected apply. |
| [Release pipelines](delivery/release-pipelines.md) | Relate application patches, documentation lines, editorial publication tags, and deployment. |

## Cross-cutting safety properties

1. Omission means unmanaged, not disabled or deleted.
2. Unreadable state remains distinguishable from an absent value, whichever
   transport failed to read it.
3. Capability comes from GitHub evidence, not hard-coded plan names.
4. `apply` uses the executable changes displayed in that invocation.
5. Blocked changes remain reportable and never reach the applier.
6. Endpoint groups can fail independently; successful groups are not rolled
   back automatically.
7. Undeclared rulesets, environments, branches, files, teams, property
   definitions, labels and milestones are not deleted. Removal is stated.
8. A change whose prerequisite failed is blocked, not attempted.
9. Nothing removes the last person able to undo the change: not the only
   organization owner, and not the account the run is authenticated as.

The [audited behavior baseline](../reference/v0.3.1-baseline.md) records the
published package and API evidence behind these properties.
