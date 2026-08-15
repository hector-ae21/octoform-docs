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

1. Rename the default branch when planned.
2. Apply repository settings in endpoint-compatible groups.
3. Execute branch, ruleset, environment, security, and file operations in
   their defined groups.
4. Report the outcome of every attempted change.

The default branch is renamed before operations that can name a branch. Fields
accepted by the repository update endpoint are bundled into one request. If a
group request fails, every field in that request receives the same failure
because individual success cannot be established.

## Partial failure

A failure in one endpoint group does not suppress unrelated groups. The
command exits `5` when any attempted change fails, `4` when nothing failed but
something was blocked, and leaves successful earlier groups in place. There is
no transaction or automatic rollback across GitHub endpoints.

## Recovery

1. Preserve the output and identify successful and failed groups.
2. Run `plan` again to observe actual post-failure state.
3. Correct permissions, availability, configuration, or repository state.
4. Apply a narrowed plan only after reviewing the new diff.

To revert a successful value, declare its previous value and apply another
reviewed plan. Removing a field stops management but does not reverse an
already applied value.

See the [plan and apply guide](../guides/plan-and-apply.md) for a complete
operator procedure.
