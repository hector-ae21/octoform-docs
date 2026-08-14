---
title: Produce the first plan
description: Restrict repository discovery, run a read-only plan, and interpret changes, warnings, and capability blocks.
---

# Produce the first plan

`plan` is read-only. It resolves policy, observes GitHub, detects applicable
capabilities, and reports the difference without applying it.

## Select one repository

```console
octoform plan --config octoform.yml --repo sample-repository
```

Replace `sample-repository` with a repository owned by the configured account.
If you use the pinned on-demand invocation instead, place the command after the
package name:

```console
npx --yes @hector21/octoform@0.3.2 plan --config octoform.yml --repo sample-repository
```

## Read the result

A plan can contain several kinds of evidence:

| Result | Meaning | Response |
| --- | --- | --- |
| Change | Observed and desired values differ | Confirm the repository, field, old value, and new value |
| No change | GitHub already matches the declared value | No apply is required |
| Warning | The change is available but has a known consequence | Resolve or explicitly accept the consequence |
| Blocked | Availability or current state cannot be proven | Correct access, applicability, or policy and plan again |

A blocked operation is not a completed operation and is not silently skipped.
Octoform will not ask `apply` to execute it.

## Review the boundary

Before applying, confirm all of the following:

- the owner and repository are the intended targets;
- only declared fields appear as candidates;
- the current values agree with what you expect from GitHub;
- every desired value is intentional;
- warnings and blocked changes are understood;
- the token has no broader write access than the operation requires.

If the plan is unexpectedly broad, stop and narrow the selector or policy.

## Exit behavior

A successful read-only plan exits `0`, including a plan with no changes.
Configuration, authentication, discovery, or observation failures use a
non-zero exit and include an actionable diagnostic. See the
[execution contract](../commands/execution-contract.md) before integrating the
command into automation.

## Next step

[Apply the reviewed change and verify convergence](safe-apply.md).
