---
title: Domain model
description: Define every declared, observed, capability, planned, and applied concept in Octoform 0.3.
---

# Domain model

The domain separates desired configuration from observed GitHub state.
Planning produces an explicit `Change`; applying produces an outcome linked to
that change rather than mutating the desired or observed models in place.

<div class="octoform-diagram" role="region" aria-label="Scrollable UML domain class diagram" tabindex="0" markdown>

![UML class diagram connecting configuration policy, repository observation, capability evidence, planned changes, and applied outcomes](../../assets/diagrams/domain-model.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/domain-model.puml)

## Declared-state concepts

| Concept | Definition |
| --- | --- |
| `Config` | Composed and validated root intent for one owner, including precedence layers, classification, audit, and exclusions. |
| `PolicySet` | Desired fields applicable at defaults, type, or named-repository scope. |
| `RulesetPolicy` | One active branch ruleset reduced to the fields Octoform manages. |
| `EnvironmentPolicy` | One named environment and optional required user reviewers. |
| `FilePolicy` | One local-to-repository `create-if-missing` file declaration. |

## Observed-state concepts

| Concept | Definition |
| --- | --- |
| `RepoState` | Inventory-level repository identity, visibility, archive status, default branch, metadata, and resolved type. |
| `RepoDetail` | `RepoState` plus requested current settings and optional structural resources needed by planning. |
| `RepoStructure` | Policy-driven observations of rulesets, environments, branch existence, file existence, and workflows naming the default branch. |
| `CapabilityEvidence` | Owner and response evidence used to decide whether an operation is available, unavailable, or still unknown. |

An unreadable setting is distinct from `null`. `null` can be a real GitHub
value, while unreadable means Octoform cannot establish current state safely.

## Planning and execution concepts

| Concept | Definition |
| --- | --- |
| `Change` | One difference with repository, key, current and desired values, plus optional block, warning, or endpoint payload. |
| `AppliedChange` | Success or failure outcome for an attempted executable change. |

Blocked changes remain `Change` instances so reports preserve intent and
reason. They have no `AppliedChange` because the applier never receives them.
See [state models](../behavior/state-models.md) for the lifecycle.
