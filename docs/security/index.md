---
title: Security and trust
description: Understand Octoform's trust boundaries, credential model, automation controls, and recovery procedures.
---

# Security and trust

Octoform has no authority of its own. It can observe and mutate only what the
supplied GitHub credential, owner role, repository selection, feature
availability, and API endpoint permit.

Use this section to choose the smallest useful credential, keep planning and
mutation in separate trust boundaries, and recover safely when an operation
does not complete.

<div class="octoform-grid octoform-grid--security" markdown>

<div class="octoform-card octoform-card--linked" markdown>

## Trust and data boundaries

Review which inputs Octoform reads, which GitHub state it observes, and what
operational information may appear in plans and logs.

[Review the trust model](trust-and-data.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Credentials and permissions

Choose between personal access tokens and GitHub App installation tokens, then
grant only the permission families required by the policy.

[Select a credential](credentials-and-permissions.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Secure automation

Separate pull-request planning from protected apply jobs, constrain
concurrency, and prevent untrusted input from reaching write credentials.

[Design a secure workflow](secure-automation.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Incidents and recovery

Contain an exposed credential, assess partial mutation, produce a fresh plan,
and report suspected vulnerabilities through a private channel.

[Follow the recovery procedure](incidents-and-recovery.md)

</div>

</div>

## Core guarantees

| Boundary | Octoform `0.5` contract |
| --- | --- |
| Configuration | Desired state and local source paths; never credential values |
| Token input | `GITHUB_TOKEN`, then `GH_TOKEN`; never part of policy or plan |
| `audit` | Read-only inventory and findings |
| `plan` | Read-only observation and deterministic comparison |
| `apply` | Displays its plan, confirms, then sends ordered mutations |
| `inspect` | Read-only, including `inspect members` |
| `members` | One person per invocation, stated and confirmed before it is sent |
| Unreadable state | Blocked instead of treated as absent or disabled, whichever transport failed to read it |
| Unsupported capability | Reported from owner, repository, token, and API evidence when available |
| Files | Create-if-missing; no overwrite or deletion |
| Removal | Never implied by an omission. Every removable resource has a word that has to be written. |
| Lockout | Refused: not the only organization owner, and not the account the run is authenticated as |

## Governing the account is not the same as governing its repositories

The difference is worth stating before granting it.

A [base permission](../configuration/organization.md#reach-and-why-eight-of-these-are-sensitive),
an [organization ruleset](../configuration/organization-rulesets.md) and an
[organization role](../configuration/roles.md) each reach every repository the
organization owns, including ones no configuration names. Each is reported as
`sensitive`.

Deleting a [team](../configuration/teams.md) takes its child teams with it, and
taking somebody off a team takes them out of every repository that team
reached. Both are `destructive`.

Nothing at this level is removed because a file stopped mentioning it. A team,
a property definition or a member is removed only where the configuration says
so, or through a command that names the person and asks.

!!! warning "Keep security reports private"

    Do not open a public issue for a suspected vulnerability, privilege
    escalation, token exposure, or private repository disclosure. Use the
    project's [private vulnerability reporting](https://github.com/hector-ae21/octoform/security/advisories/new)
    channel.
