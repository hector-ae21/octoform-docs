---
title: octoform apply
description: Confirm and execute the current Octoform plan with explicit failure reporting.
---

# `octoform apply`

`apply` calls the same planning implementation as `plan`, displays the
resulting executable changes, requests confirmation, and applies only the
retained in-memory change set.

```console
octoform apply --config octoform.yml --repo octoform
```

## Confirmation

Interactive execution asks before mutation and defaults to refusal. Declining
returns exit code `1` and writes nothing. `--yes` or `-y` skips the prompt and
is intended for an externally protected automation boundary, not initial use.

Blocked changes are counted and reported but excluded from mutation. A change
shown only as blocked cannot be made executable by confirmation.

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
command exits `1` when any attempted change fails and leaves successful earlier
groups in place. There is no transaction or automatic rollback across GitHub
endpoints.

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
