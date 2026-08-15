---
title: Operate plan and apply safely
description: Review scope, blocked operations, confirmations, partial failure, and recovery for Octoform 0.4.
---

# Operate `plan` and `apply` safely

The safe unit of work is not an entire account. It is a reviewed plan for an
explicit policy and a deliberately selected repository set.

## Before planning

1. Pin the Octoform patch used by the operator or workflow.
2. Review the configuration diff and every imported file.
3. Confirm the `owner` and the token's repository selection.
4. Start with `--repo` or `--type` when introducing a new policy.
5. Ensure no secret or private repository name will enter a public log.

## Read the result by category

| Result | Meaning | Operator response |
| --- | --- | --- |
| Planned | GitHub differs and the operation appears available | Review current value, desired value, and scope |
| Blocked | Octoform cannot safely attempt the change | Fix access/applicability or remove the declaration |
| Warning | The change is available but has a known consequence | Resolve the consequence before confirmation |
| No change | Observed and desired state agree | No action |

Blocked work is part of the plan. Do not remove it from a report or count it as
successful convergence.

## Understand ordering

Octoform groups settings that share a GitHub endpoint. Repository settings can
therefore succeed or fail together in one request. Default-branch rename runs
before resources that name branches, so rulesets and created files target the
declared branch name.

## Confirm interactively

```console
octoform apply --config octoform.yml --repo sample-repository
```

The command uses the plan it just presented. Confirmation authorizes those
displayed operations for that run; it is not a permanent approval.

To apply exactly a plan reviewed earlier — the shape to prefer when the
reviewer and the applier are not the same person or process — save it and hand
the file over:

```console
octoform plan  --config octoform.yml --repo sample-repository --out plan.json
octoform apply --plan plan.json
```

See [apply](../commands/apply.md#applying-a-saved-plan) for every check that
runs before it acts, and the reason it reports when one fails.

## Work across several accounts

When the configuration declares several accounts, they run one at a time in
declaration order, so their reports never interleave. A failure in one does
not stop the rest: by default the run continues and reports every account's
outcome, and `--fail-fast` stops at the first failure instead. Narrow with
repeatable `--owner`, and bound the work inside an account with
`--concurrency <n>`.

The run's exit code is the most severe class any account produced.

## Handle partial failure

Octoform attempts independent endpoint groups even if another group fails. A
failure does not imply that every operation was rolled back.

1. Preserve the complete command output without exposing its token.
2. Inspect every per-change result, not only the final exit code. The code
   distinguishes blocked (`4`) from failed (`5`), but not which operation.
3. Run `plan` again to observe the resulting GitHub state.
4. Correct the permission, capability, conflict, or policy error.
5. Review the new plan before applying again.

## Recover from an unwanted value

Octoform `0.4` has no generic rollback command. Declare the previous value
explicitly, plan it, and apply the compensating change. Removing a key only
stops managing it; omission does not restore an earlier value.

!!! danger "Never infer deletion from omission"

    Rulesets, environments, branches, and files are not removed merely because
    they disappear from a policy. File management is create-if-missing only.

## Automate with the same boundaries

Scheduled jobs should run `audit` or `plan`. If an organization permits
non-interactive apply, protect it with a reviewed workflow revision, a GitHub
environment, narrow repository access, and `--repo`/`--type` selectors. See the
[automation guide](../automation/index.md).
