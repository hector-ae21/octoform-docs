---
title: Security and trust
description: Understand Octoform's token boundaries, read-only commands, confirmations, and failure behavior.
---

# Security and trust

Octoform operates with the authority of the token provided to it. A safe setup
starts with the smallest useful repository selection and permission set, then
expands only when a declared capability requires it.

## Trust boundaries

| Boundary | Contract |
| --- | --- |
| Configuration | Contains desired state and local file paths, never token values |
| Token input | Read from `GITHUB_TOKEN`, then `GH_TOKEN`; never written to the plan |
| `audit` and `plan` | Read-only GitHub operations |
| `apply` | Uses the reviewed plan, asks for confirmation, and reports each result |
| Unreadable state | Reported as blocked instead of assumed absent or disabled |
| Unsupported capability | Reported with evidence from the owner, repository, token, and endpoint |

## Token handling

- Use a short-lived GitHub App token for automation when practical.
- Restrict fine-grained tokens to the repositories under governance.
- Grant write permissions only for capabilities present in the policy.
- Mask secrets in CI and never enable shell tracing around authentication.
- Revoke or rotate a token immediately if it appears in output or history.

Octoform `0.3.1` performs no GraphQL request. Its current REST permissions vary
by feature: repository administration, contents, environments, rules, security
events, and organization custom properties are distinct capabilities.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability or exposed credential.
Follow the private reporting instructions in the
[security policy](https://github.com/hector-ae21/octoform/security/policy).
