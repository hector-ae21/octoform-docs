---
title: Branch-pattern examples
description: Compare four supported ways to target branches from repository rulesets.
---

# Branch targeting patterns

Rulesets can follow a repository's current default branch, name one branch,
match a family, or enumerate a fixed set. The correct form depends on the
repository's release model.

## Configuration

<div class="octoform-example" markdown>

```yaml title="octoform.yml"
--8<-- "docs/examples/files/branch-patterns/octoform.yml"
```

[:material-download: Download YAML](files/branch-patterns/octoform.yml){ .octoform-example-download download="octoform.yml" aria-label="Download the branch-pattern policy YAML" }

</div>

## Choose a targeting strategy

| Strategy | Use it when |
| --- | --- |
| `~DEFAULT_BRANCH` | Protection should follow a future default-branch rename. |
| Exact name | One branch has a permanent role independent of the default. |
| Glob such as `release/*` | New branches in a named family should inherit the policy. |
| Fixed list | A small, reviewed set of long-lived lines is maintained. |

Each placeholder repository is assigned a different type so the plan makes all
four strategies visible. Replace those names and type assignments with the
classification model used by the target owner.

!!! warning "Review destructive restrictions"

    Blocking deletion or force-push changes how maintainers recover and retire
    branches. Confirm the intended branch lifecycle before applying a ruleset.
