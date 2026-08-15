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

The three `members` commands are the one exception to "observation precedes
mutation", and they replace it with something narrower rather than nothing:
each takes one login, reads the organization's current people, states what it
is about to do and to whom, and asks. See
[why these are commands and not policy](../commands/members.md#why-these-are-commands-and-not-policy).

## Two transports, one meaning for failure

Four repository settings are read and written through GitHub's GraphQL API
rather than REST. A GraphQL response can carry data and errors together under
HTTP `200`, which is a shape a REST client never has to consider — so the
transport reports what arrived alongside what failed, instead of letting a
partial observation read as a complete one.

Every GraphQL failure is reduced to the same vocabulary a REST status carries,
and an unrecognized error type is treated as unavailable rather than as a
confirmed absence. One failed field narrows to the same unreadable state a REST
read produces, so the planner blocks it for the same reason and cannot tell
which transport observed it.

Reads are retried only while every failure is transient and nothing arrived. A
mutation is never retried, because a mutation that timed out may have happened.

## Output privacy

Plans necessarily include repository names, settings, branches, environments,
rulesets, and selected current and desired values. An organization plan also
includes team slugs, member logins and role holders, and
[`inspect members`](../commands/members.md) reports the organization's people
by name, including pending invitations and the email addresses of invitations
that were sent to one. Treat output from a private owner as private operational
metadata. Do not upload it to a public artifact or paste it unchanged into an
issue.

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
