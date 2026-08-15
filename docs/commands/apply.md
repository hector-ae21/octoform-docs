---
title: octoform apply
description: Confirm and execute an Octoform plan, or apply exactly a previously reviewed one.
---

# `octoform apply`

`apply` has two modes. By default it calls the same planning implementation as
`plan`, displays the resulting executable changes, requests confirmation, and
applies only that change set. Given `--plan`, it applies exactly a plan that
was saved earlier, without planning again.

```console
octoform apply --config octoform.yml --repo example-org/octoform
octoform apply --plan plan.json
```

## Confirmation

Interactive execution asks before mutation and defaults to refusal. Declining
returns exit code `1` and writes nothing. `--yes` or `-y` skips the prompt and
is intended for an externally protected automation boundary, not initial use.

Blocked changes are counted and reported but excluded from mutation. A change
shown only as blocked cannot be made executable by confirmation.

## Applying a saved plan

```console
octoform plan  --config octoform.yml --out plan.json
octoform apply --plan plan.json
```

This is the mode to prefer in automation, because the job that mutates applies
exactly what the reviewing job produced. Before anything is touched, every
claim the file makes is re-checked, and the run refuses with a distinct named
reason when:

| Reason | Meaning |
| --- | --- |
| `unsupported-schema-version` | The file was written by a version of Octoform this one cannot read. |
| `expired` | The plan is older than the expiry it recorded. |
| `actor-mismatch` | The current token authenticates as a different account than the one that produced the plan. |
| `owner-identity-mismatch` | A target account now resolves to a different numeric identity — a rename, or a different account reusing the login. |
| `source-digest-mismatch` | A configuration file that contributed to the plan has changed, or can no longer be read. |
| `config-digest-mismatch` | The configuration still loads, but no longer resolves to what the plan was made against. |

A stale plan fails. It is never silently repaired or re-planned. Verification
answers `2`, a usage error, because the input was wrong rather than the
operation.

The saved plan is trusted exactly as far as the configuration file is: both
are ordinary files on disk. Its digests detect a plan that no longer matches
the world it was made in, not an attacker who can rewrite files at will.

## Accounts and concurrency

`--owner` limits the run to the named accounts and is repeatable.
`--concurrency <n>` bounds how many repositories are worked on at once within
one account, defaulting to `4`. A failure in one account does not stop
another; `--fail-fast` stops at the first one that fails instead. Every run
ends with a stable summary of applied, failed, and blocked counts, per account
and across the whole selection.

## Operation order

The account is brought into agreement with the file before any repository is
touched:

1. Organization settings, in one request.
2. Custom property definitions, one at a time, each read before it is written.
3. Teams, team membership, and organization role assignments, ordered by their
   dependencies rather than by the order the file happens to be written in.
4. Organization rulesets, last of the owner-level work, because they reach
   furthest.

Then, per repository:

1. Unarchive, when planned. Everything else waits for it.
2. Rename the repository or the default branch when planned.
3. Apply repository settings in endpoint-compatible groups.
4. Execute branch, ruleset, protection, access, collection, environment,
   security, and file operations in their defined groups.
5. Archive, when planned, and only if everything else succeeded.
6. Report the outcome of every attempted change.

The default branch is renamed before operations that can name a branch. Fields
accepted by the repository update endpoint are bundled into one request. If a
group request fails, every field in that request receives the same failure
because individual success cannot be established.

## Order comes from a dependency graph

!!! info "Available since 0.5.0"

    Apply order is derived from what each change waits for, not from the order
    the steps are written in. A change records its prerequisites, and the graph
    does two things with them: it attempts a prerequisite first, and it
    **blocks** — rather than attempts — anything whose prerequisite failed.

    A child team is not sent to sit under a parent whose creation failed. A
    member is not added to a team that does not exist. A repository setting is
    not written to a repository that is still archived.

    See [owner reconciliation](../architecture/behavior/owner-reconciliation.md)
    for the graph itself.

## Partial failure

A failure in one endpoint group does not suppress unrelated groups, unless
something depended on it — in which case the dependent is reported as blocked
with the reason, rather than attempted and failing for a second time.

The command exits `5` when any attempted change fails, `4` when nothing failed
but something was blocked, and leaves successful earlier groups in place. There
is no transaction or automatic rollback across GitHub endpoints.

## Recovery

1. Preserve the output and identify successful and failed groups.
2. Run `plan` again to observe actual post-failure state.
3. Correct permissions, availability, configuration, or repository state.
4. Apply a narrowed plan only after reviewing the new diff.

To revert a successful value, declare its previous value and apply another
reviewed plan. Removing a field stops management but does not reverse an
already applied value.

There is no rollback command, and some changes a second run cannot undo. See
[incidents and recovery](../security/incidents-and-recovery.md) for which ones
and why.

See the [plan and apply guide](../guides/plan-and-apply.md) for a complete
operator procedure.
