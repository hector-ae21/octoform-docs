---
title: Security and trust
description: Token lifecycle, permission boundaries, planning guarantees, redaction, automation controls, and incident response.
---

# Security and trust

Start with the [trust and data-flow diagram](../architecture/index.md#trust-and-data-flow)
for the credential, process, network, GitHub, and logging boundaries described
throughout this guide.

Octoform has no authority of its own. It can observe and mutate only what the
supplied GitHub token, owner role, repository selection, feature availability,
and API endpoint permit.

## Trust model

| Boundary | Octoform `0.3.1` contract |
| --- | --- |
| Configuration | Desired state and local source paths; never credential values |
| Token input | `GITHUB_TOKEN`, then `GH_TOKEN`; never part of policy or plan |
| `audit` | Read-only inventory and findings |
| `plan` | Read-only observation and deterministic comparison |
| `apply` | Displays its plan, confirms, then sends ordered mutations |
| Unreadable state | Blocked instead of treated as absent or disabled |
| Unsupported capability | Reported with owner/repository/token/API evidence when available |
| Files | Create-if-missing; no overwrite or deletion |

## Choose the credential

### Interactive operation

A fine-grained personal access token is preferable to a classic PAT. Select
only the repositories being evaluated and begin with read permissions. Add a
write permission only when the reviewed policy contains that capability.

### Automation

Prefer a GitHub App installation token:

- installation-scoped repository access;
- short lifetime;
- centrally reviewable permissions;
- no long-lived personal credential;
- revocation independent from an employee account.

Use an environment secret only as a transitional mechanism. Never accept a
credential from a pull-request payload or configuration file.

## Permission model

The CLI preflight for classic tokens requires `repo`. Organization custom
property writes additionally require `admin:org`. Those scopes are coarse and
do not describe minimum fine-grained permissions.

GitHub evaluates distinct permission families for:

- repository administration and settings;
- contents and branch creation;
- rules and rulesets;
- environments and deployment protection;
- security events and code-scanning setup;
- organization custom properties.

Grant only families declared by the active policy. A read-only audit should
not receive write permissions merely because a future policy might need them.

## Token lifecycle

1. Issue the narrowest token for the owner and selected repositories.
2. Inject it through the process environment immediately before execution.
3. Disable shell tracing and ensure CI masking is active.
4. Run `audit` or `plan` before granting write access.
5. Remove the environment value after an interactive run.
6. Let short-lived installation tokens expire; rotate long-lived tokens on a
   documented schedule.
7. Revoke immediately if a value reaches a log, artifact, shell history, issue,
   or committed file.

## What may appear in output

Plans necessarily include repository names, settings, branches, environments,
rulesets, and selected current/desired values. Treat output from a private
owner as private operational metadata. Do not upload it to a public artifact
or paste it unchanged into an issue.

Octoform should never need to display the token itself. If a GitHub diagnostic
contains sensitive request information, redact it before sharing.

## Apply and partial failure

`apply` does not provide a transaction spanning GitHub endpoints. Independent
groups may succeed even when another group fails. Recovery therefore begins
with a fresh plan, not an assumption that the account returned to its original
state.

There is no generic rollback command. Reversal is another explicit desired
value, plan, review, and apply. Omission only stops management.

## Automation controls

An apply workflow should have:

- no pull-request access to write credentials;
- reviewed and pinned dependencies;
- manual dispatch or another explicit authorization event;
- a protected environment with required reviewers;
- exact repository/type selection;
- concurrency preventing overlapping apply jobs;
- minimal log and artifact retention;
- a new read-only plan after any failure.

See [CI/CD automation](../automation/index.md) for supported `0.3.1` examples and its
important immutable-plan limitation.

## Threats and mitigations

| Threat | Primary mitigation |
| --- | --- |
| Malicious policy change | Protected branch, CODEOWNERS, reviewed diff |
| Pull request exfiltrates a token | No apply secrets or write permissions in PR workflows |
| Token can see too many repositories | Fine-grained selection or GitHub App installation scope |
| Unreadable state causes overwrite | Planning block; never infer an absent value |
| Concurrent applies race | Owner/repository concurrency group |
| Plan becomes stale | Apply immediately after review and re-plan after failure |
| Public logs reveal private inventory | Private workflow/artifacts and sanitized support reports |
| Dependency compromise | Exact Octoform patch, lockfiles, provenance and dependency review |

## Report a vulnerability

Do not open a public issue for a suspected vulnerability, privilege escalation,
token exposure, or private repository disclosure. Use the project's
[private vulnerability reporting](https://github.com/hector-ae21/octoform/security/advisories/new)
channel. Revoke an exposed credential before preparing the report.
