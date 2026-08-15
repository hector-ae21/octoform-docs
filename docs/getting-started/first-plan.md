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
npx --yes @hector21/octoform@0.4.1 plan --config octoform.yml --repo sample-repository
```

## When the configuration names several accounts

Add `--owner` to narrow the run to one of them, and qualify `--repo` when the
same repository name exists under more than one:

```console
octoform plan --config octoform.yml --owner example-org
octoform plan --config octoform.yml --repo example-org/sample-repository
```

A bare `--repo` name that matches repositories under two selected accounts is
rejected, and the error lists the qualified forms that would resolve it. A
login the configuration does not declare is rejected too, rather than quietly
resolving to every account except the one you meant.

Before the first run against a new account, check what Octoform resolved
about it:

```console
octoform inspect capabilities --config octoform.yml --owner example-org
```

That prints the account kind, its numeric identity, whether organisation-wide
rulesets are available, and any declaration that does not apply to this kind
of account — each with the evidence behind it rather than an assumption.

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

A plan that finds nothing to do exits `0`. A plan that finds executable
changes exits `1` — the command succeeded, and the class reports that drift
exists and was not applied. Blocked work exits `4`, and a run that failed
exits `5`.

That distinction matters the moment the command goes into a pipeline: `plan`
is read-only, but a non-zero exit from it is not automatically a failure to
investigate. See the
[execution contract](../commands/execution-contract.md) before integrating the
command into automation.

## Next step

[Apply the reviewed change and verify convergence](safe-apply.md).
