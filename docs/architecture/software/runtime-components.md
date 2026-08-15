---
title: Runtime components
description: Trace responsibilities and dependencies inside the Octoform 0.5 Node.js process.
---

# Runtime components

The component view separates interface adapters, application orchestration,
domain logic, configuration, and GitHub infrastructure. This makes the shared
path between CLI and public ESM consumers explicit.

<div class="octoform-diagram" role="region" aria-label="Scrollable UML runtime component diagram" tabindex="0" markdown>

![UML component diagram of Octoform interfaces, application services, domain services, configuration services, GitHub infrastructure, and reports](../../assets/diagrams/runtime-components.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/runtime-components.puml)

## Interface adapters

- **CLI parser and dispatcher** validates arguments, selects a command, checks
  authentication requirements, and translates completion into an exit code.
- **Public ESM exports** expose supported configuration, observation,
  classification, planning, apply, reporting, and type building blocks.
- **Report formatter** converts findings, changes, blocks, warnings, and apply
  outcomes into human-oriented text.

## Application services

The command-services component exposes audit, classification, property
synchronization, inspection, membership, plan, and apply operations and owns
their workflow order. `apply` depends on planning and retains the displayed
`Change[]`; it does not independently construct another desired-state diff.

The three membership commands are the exception to that shape, and are kept
apart from it: each reads the organization's people, states one intended change
to one person, and asks. They produce no `Change` and go through no plan. See
[`octoform members`](../../commands/members.md#why-these-are-commands-and-not-policy).

## Domain and configuration

- The loader composes imports and validates a normalized `Config`.
- The selector establishes the repository set and filters.
- The resolver produces an effective `PolicySet` for one repository.
- The planner compares policy, observed detail, and capability evidence without
  performing network calls or mutations. It plans the account itself and each
  repository through the same `Change` model.
- The dependency graph orders confirmed changes by what each one waits for, and
  blocks a dependent whose prerequisite failed. See
  [owner reconciliation](../behavior/owner-reconciliation.md).

Domain modules layer in one direction: the GitHub adapters may depend on the
domain, and the domain never depends on them. A comparison, a request body and
the reasons a change is refused are all decidable without a network.

## GitHub infrastructure

The observer gathers only policy-relevant state. Capability probes preserve
uncertainty instead of converting opaque responses into availability. The
applier groups confirmed executable changes by endpoint behavior.

Two transports sit here. The Octokit client owns REST. A separate GraphQL
transport carries the four repository settings REST does not expose, and
normalizes its failures — including a response that carries data and errors
together under HTTP `200` — into the same vocabulary a REST status produces, so
nothing above this layer can tell which one observed a value it could not read.
