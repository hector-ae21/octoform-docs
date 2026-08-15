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
| Configuration | Declares selected repositories and desired state | Cannot contain a credential: a token-shaped value is rejected when the file loads |
| Process environment | Supplies `GITHUB_TOKEN` or `GH_TOKEN` | Available to the Octoform process for the duration of the run |
| Saved plan | Records a reviewed plan for a later `apply --plan` | Written with owner-only permissions; carries no credential, but names private repositories |
| GitHub responses | Provide current state and capability evidence | May reveal private repository and organization metadata |
| Local files and imports | Compose policy and classification evidence | Resolved from trusted, reviewable source paths |

## Observation precedes mutation

`audit` and `plan` observe GitHub without sending desired-state mutations.
`apply` performs its own planning pass, presents the result, requests the
required confirmation, and then sends ordered mutations. Given `--plan`, it
sends exactly the operations a reviewed plan recorded, after re-checking the
actor, each account's numeric identity, the configuration and source digests,
and the expiry — or refuses, naming which check failed.

An unreadable setting is not equivalent to a disabled or absent setting. When
Octoform lacks enough evidence to compare current and desired state safely, the
operation is blocked.

## Output privacy

Plans necessarily include repository names, settings, branches, environments,
rulesets, and selected current and desired values. Treat output from a private
owner as private operational metadata. Do not upload it to a public artifact
or paste it unchanged into an issue.

Octoform never displays the token itself. Values that came from GitHub —
repository names, descriptions, topics, property values, API error text — are
writable by anyone with access to the account being audited, so control
characters in them are escaped before they are printed. A crafted value
cannot overwrite lines already on screen, hide a blocked change from the
report, or imitate the confirmation prompt. Still sanitize GitHub diagnostics
before sharing them when they contain request or private-resource information.

## Capability evidence

Availability is derived from the authenticated owner, repository visibility,
token permissions, API responses, and feature behavior. A commercial plan name
alone is not proof that a mutation is permitted.

Continue with [Credentials and permissions](credentials-and-permissions.md) to
choose the authentication boundary for a run.
