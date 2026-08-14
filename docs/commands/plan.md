---
title: octoform plan
description: Produce a read-only deterministic comparison of desired and observed GitHub state.
---

# `octoform plan`

`plan` loads configuration, discovers repositories, resolves effective policy,
observes requested state, and reports executable and blocked differences. It
never mutates GitHub.

```console
octoform plan --config octoform.yml
octoform plan --config octoform.yml --repo octoform
octoform plan --config octoform.yml --type npm-package
```

## Selection

`--repo` selects one exact discovered repository. `--type` selects every
repository with one resolved type. Supplying neither evaluates the complete
managed set after exclusions. Use a narrow selector for initial rollout and
incident diagnosis.

## Plan categories

| Result | Meaning |
| --- | --- |
| Executable change | Current state is readable, differs from policy, and the operation is available. |
| Warning | The change can execute but has a consequence requiring attention, such as workflow references during branch rename. |
| Blocked change | Desired and current state cannot be reconciled safely or the capability is unavailable. It will never reach the applier. |
| No change | The field matches or is not managed. |

Blocked changes remain visible with their reason. Unreadable state is not
converted into a guessed current value.

## Consistency boundary

The plan is a point-in-time comparison, not a stored artifact. Octoform
`0.3` has no serializable plan format and cannot apply a plan produced by an
earlier process. [`apply`](apply.md) invokes the same planning implementation,
shows that invocation's changes, and retains them in memory for confirmation.

## Exit and output

A successful plan exits `0` even when blocked operations are present. Invalid
configuration, authentication failure, or an unhandled GitHub read failure
exits `1`. Output is human-oriented text; do not depend on its layout as a
stable machine API.
