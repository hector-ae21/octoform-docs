---
title: Apply and verify
description: Apply one reviewed Octoform plan, verify the result, and recover safely from a partial failure.
---

# Apply and verify

Use `apply` only after the immediately preceding plan is understood. Octoform
uses the plan it just produced for confirmation and execution; it does not hide
an independent mutation path behind the command.

## Apply to the same repository

```console
octoform apply --config octoform.yml --repo sample-repository
```

Review the displayed plan again. Enter `y` only when every executable change is
expected. Any other answer declines the operation and exits without mutation.

Do not use `--yes` for this first run. That option belongs in a protected
automation path where configuration review, plan retention, credentials, and
environment approval replace the interactive prompt.

## Inspect the result

Octoform reports each attempted change separately. A successful operation does
not prove that an independent operation succeeded, and partial failures are not
rolled back automatically.

Confirm the setting in GitHub, then produce the same narrow plan again:

```console
octoform plan --config octoform.yml --repo sample-repository
```

An idempotent result contains no remaining change for
`delete_branch_on_merge`. This second plan is the verification step.

## Recover from failure

If an operation fails:

1. Record the affected repository, field, requested value, and GitHub error
   without copying credentials.
2. Inspect which independent operations succeeded.
3. Correct permissions, repository state, or policy.
4. Run a new plan; do not assume the original plan is still current.
5. Apply only the newly reviewed executable changes.

Octoform does not invent a rollback because the previous state may no longer be
valid and another actor may have changed the repository after observation.

## Continue safely

- Learn [tri-state values and precedence](../concepts/index.md).
- Adopt the complete [plan and apply procedure](../guides/plan-and-apply.md).
- Choose a broader [validated example](../examples/index.md).
- Design a protected [automation workflow](../automation/index.md).
