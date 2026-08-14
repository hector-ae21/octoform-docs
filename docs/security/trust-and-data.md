---
title: Trust and data boundaries
description: Identify the inputs, observations, outputs, and evidence that cross Octoform's trust boundaries.
---

# Trust and data boundaries

Start with the [trust and data-flow diagram](../architecture/trust/trust-and-data-flow.md)
for the credential, process, network, GitHub, and logging boundaries described
on this page.

## Inputs

| Input | Purpose | Security boundary |
| --- | --- | --- |
| Configuration | Declares selected repositories and desired state | Must not contain tokens or other credentials |
| Process environment | Supplies `GITHUB_TOKEN` or `GH_TOKEN` | Available to the Octoform process for the duration of the run |
| GitHub responses | Provide current state and capability evidence | May reveal private repository and organization metadata |
| Local files and imports | Compose policy and classification evidence | Resolved from trusted, reviewable source paths |

## Observation precedes mutation

`audit` and `plan` observe GitHub without sending desired-state mutations.
`apply` performs its own planning pass, presents the result, requests the
required confirmation, and then sends ordered mutations.

An unreadable setting is not equivalent to a disabled or absent setting. When
Octoform lacks enough evidence to compare current and desired state safely, the
operation is blocked.

## Output privacy

Plans necessarily include repository names, settings, branches, environments,
rulesets, and selected current and desired values. Treat output from a private
owner as private operational metadata. Do not upload it to a public artifact
or paste it unchanged into an issue.

Octoform should never need to display the token itself. Sanitize GitHub
diagnostics before sharing them when they contain request or private-resource
information.

## Capability evidence

Availability is derived from the authenticated owner, repository visibility,
token permissions, API responses, and feature behavior. A commercial plan name
alone is not proof that a mutation is permitted.

Continue with [Credentials and permissions](credentials-and-permissions.md) to
choose the authentication boundary for a run.
