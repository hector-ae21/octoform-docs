---
title: octoform plan
description: Produce a read-only deterministic comparison of desired and observed GitHub state, and optionally save it.
---

# `octoform plan`

`plan` loads configuration, discovers repositories, resolves effective policy,
observes requested state, and reports executable and blocked differences. It
never mutates GitHub.

```console
octoform plan --config octoform.yml
octoform plan --config octoform.yml --owner example-org
octoform plan --config octoform.yml --repo example-org/octoform
octoform plan --config octoform.yml --type npm-package
octoform plan --config octoform.yml --format json
octoform plan --config octoform.yml --out plan.json --expires-in 30
```

## Selection

`--owner` limits the run to the named accounts and is repeatable. `--repo`
selects one exact discovered repository, and accepts a qualified `owner/name`
when the same repository name exists under more than one selected account.
`--type` selects every repository with one resolved type. Supplying none of
them evaluates the complete managed set after exclusions. Use a narrow
selector for initial rollout and incident diagnosis.

## Operation identity

Every operation carries:

- a stable identifier, unchanged between two runs that plan the same change,
  so results can be correlated across runs and across output formats;
- the account it belongs to;
- an operation kind: `create` or `update`;
- a risk level: `normal` or `sensitive`;
- its prerequisites, and its before and after values.

Identifiers address a change in Octoform's own model. They are never a GitHub
object identity.

## Determinism and concurrency

Two runs against unchanged state produce the same operations in the same
order, regardless of the order the API happened to answer in. Ordering is part
of the contract, not an accident of pagination.

`--concurrency <n>` bounds how many repositories are worked on at once within
one account; it defaults to `4`. Accounts themselves run one at a time, in the
order the configuration declares them, so their reports never interleave.

A failure inside one account does not stop another: by default the run
continues and reports every account's outcome. `--fail-fast` stops at the
first account that fails instead. A repository whose plan cannot be computed
at all is reported as a distinct failure and never treated as "no changes".

## Plan categories

| Result | Meaning |
| --- | --- |
| Executable change | Current state is readable, differs from policy, and the operation is available. |
| Warning | The change can execute but has a consequence requiring attention, such as workflow references during branch rename. |
| Blocked change | Desired and current state cannot be reconciled safely, or the capability is unavailable. It will never reach the applier. |
| No change | The field matches or is not managed. |

Blocked changes remain visible with their reason. Unreadable state is not
converted into a guessed current value.

## Saving a plan

`--out <path>` writes the reviewed plan to a versioned JSON file, with
owner-only permissions where the platform supports them. The file records the
schema version, the version of Octoform that produced it, the authenticated
actor, each target account's numeric identity, a digest of the resolved
configuration and of every source file that contributed to it, the observation
time, an expiry, and the operations themselves.

`--expires-in <minutes>` sets that expiry; it defaults to `60`.
[`apply --plan`](apply.md#applying-a-saved-plan) re-checks every one of those
claims before it touches anything.

The plan file is exactly as sensitive as the configuration it came from: it
names private repositories and their settings. It carries no credential.

## Exit and output

| Situation | Exit |
| --- | --- |
| Nothing to do | `0` |
| Executable changes found | `1` |
| One or more changes blocked | `4` |
| One or more repositories could not be examined | `5` |
| Configuration or selector error | `2` |
| Authentication or permission failure | `3` |

Text output is human-oriented; do not depend on its layout as a stable machine
API. Use `--format json` for a versioned envelope instead, described in the
[execution contract](execution-contract.md#json-output).
