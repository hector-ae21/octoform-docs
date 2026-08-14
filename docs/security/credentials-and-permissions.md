---
title: Credentials and permissions
description: Choose an Octoform credential and grant only the GitHub permissions required by the active policy.
---

# Credentials and permissions

The credential determines the maximum authority available to Octoform. Owner
roles, repository access, and feature availability may narrow that authority
further.

## Interactive operation

A fine-grained personal access token is preferable to a classic PAT. Select
only the repositories being evaluated and begin with read permissions. Add a
write permission only when the reviewed policy contains that capability.

The CLI preflight for classic tokens requires `repo`. Organization custom
property writes additionally require `admin:org`. Those coarse scopes do not
describe minimum fine-grained permissions.

## Automated operation

Prefer a GitHub App installation token because it provides:

- installation-scoped repository access;
- a short lifetime;
- centrally reviewable permissions;
- no long-lived personal credential;
- revocation independent from an employee account.

Use an environment secret only as a transitional mechanism. Never accept a
credential from a pull-request payload or configuration file.

## Permission families

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
7. Revoke immediately if a value reaches a log, artifact, shell history,
   issue, or committed file.

Continue with [Secure automation](secure-automation.md) before exposing a
write-capable credential to a workflow.
