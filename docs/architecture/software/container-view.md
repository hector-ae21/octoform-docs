---
title: Container view
description: Locate Octoform runtime, local inputs, credential, transport, output, and GitHub state boundaries.
---

# Container view

In this view, a container is a separately executing or stored unit, not
necessarily a Docker image. Octoform runs as one Node.js process whether
invoked through its CLI or imported as an ESM library.

<div class="octoform-diagram" role="region" aria-label="Scrollable UML container diagram" tabindex="0" markdown>

![UML container diagram showing the Octoform process, configuration, seed files, environment credential, Octokit and GraphQL transports, console output, and GitHub state](../../assets/diagrams/container-view.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/container-view.puml)

## Runtime containers and stores

| Element | Boundary |
| --- | --- |
| Octoform Node.js process | Executes CLI adapters, exported services, domain planning, and apply orchestration in memory. |
| Root YAML and imports | Version-controlled desired state managed by the operator or checked-out workflow revision. |
| Local seed files | Content read only when an effective `files` policy names it. |
| Process environment | Supplies `GITHUB_TOKEN` or `GH_TOKEN`; configuration cannot carry a token. |
| Octokit client | Adds authentication and transports REST requests over HTTPS. |
| GraphQL transport | Carries the four settings REST does not expose, using the same credential, and normalizes its failures into the same vocabulary. |
| Standard output and error | Carries human-readable repository details, plans, failures, and exit status context. |
| GitHub state | External source of truth for identity, permissions, repositories, settings, and resource outcomes. |

## Two transports, one vocabulary

!!! info "Available since 0.5.0"

    Four repository settings exist only in GitHub's GraphQL API:
    `features.sponsorships`, `features.pull_requests`, `repo.issue_creation`
    and `repo.pull_request_creation`. A configuration that manages none of them
    makes no GraphQL request at all.

The second transport is a container rather than a detail because GraphQL fails
differently, and the difference had to be contained somewhere:

- **A GraphQL response can carry data and errors together, under HTTP `200`.**
  A request therefore reports what arrived alongside what failed, instead of
  letting a partial observation read as a complete one.
- **Failures are reduced to the same vocabulary a REST status carries**, and an
  unrecognized error type is treated as unavailable rather than as a confirmed
  absence.
- **One failed field narrows to the same unreadable sentinel a REST read
  produces**, so the planner blocks it for the same reason and cannot tell
  which transport observed it.
- **Reads are retried only while every failure is transient and nothing
  arrived. A mutation is never retried**, because a mutation that timed out may
  have happened.

A change to one of the four is blocked rather than attempted when the
repository's GraphQL node identity could not be read.

## Deployment consequences

There is no Octoform server, database, or queue in `0.5`. The only thing that
outlives the process is a plan the operator asked for with `plan --out`: a
file, not a service, which a later `apply --plan` verifies before acting on.
Without it, process exit loses the computed plan and a later invocation
observes and plans again. Configuration history belongs in version control,
while applied state and mutation audit evidence belong to GitHub.

See [trust and data flow](../trust/trust-and-data-flow.md) for disclosure and
credential implications.
