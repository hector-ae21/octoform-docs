---
title: Write the first policy
description: Create a narrow octoform.yml that manages one repository setting and leaves every omission untouched.
---

# Write the first policy

Begin with one reversible setting. A small policy makes the relationship
between declared intent, observed GitHub state, and the resulting plan easy to
inspect.

## Create `octoform.yml`

```yaml title="octoform.yml"
owner: your-account

defaults:
  merge:
    delete_branch_on_merge: true
```

Replace `your-account` with the login that owns the repositories. Octoform asks
GitHub whether that login represents a personal account or an organization;
the configuration does not duplicate that fact.

## What this policy means

- `delete_branch_on_merge` must be enabled for selected managed repositories.
- Every omitted setting is unmanaged.
- The file does not disable absent features, remove rulesets, replace topics,
  or infer organization defaults.

Omission is a safety boundary, not a default value. `false` explicitly asks
Octoform to keep a boolean setting disabled; omitting it asks Octoform to leave
the setting alone.

## Keep the first selection narrow

The policy uses `defaults`, so it can describe every selected repository. The
first command will add `--repo` to restrict discovery and planning to one known
repository without changing the reusable policy.

Choose a repository where enabling automatic branch deletion after merge is
acceptable. The repository can already match the policy; a no-change plan is a
valid and useful result.

## Configuration failures are read-only

`plan` loads imports, validates the configuration shape, resolves the owner,
and obtains GitHub state before producing changes. A syntax or validation error
stops that command before any mutation.

## Next step

[Produce and interpret the first plan](first-plan.md).
