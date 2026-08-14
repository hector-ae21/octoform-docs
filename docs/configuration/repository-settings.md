---
title: Repository settings
description: Manage GitHub repository features, merge behavior, and metadata with Octoform 0.3.
---

# Repository settings

The `features`, `merge`, and `repo` blocks map primarily to GitHub's repository
update operation. Octoform groups compatible changes into one request per
repository.

## `features`

**Shape:** optional toggle object inside any policy layer.

```yaml
defaults:
  features:
    issues: true
    wiki: false
    projects: false
```

| Field | GitHub value | Apply behavior |
| --- | --- | --- |
| `issues` | `has_issues` | Included in the repository update. |
| `wiki` | `has_wiki` | Included in the repository update. |
| `projects` | `has_projects` | Included in the repository update. |
| `discussions` | No released REST mapping | Reported as blocked; never sent. |

Each field accepts `true`, `false`, or `null`. Omission leaves the effective
value unchanged unless inherited from a wider policy layer.

## `merge`

**Shape:** optional toggle object inside any policy layer.

| Field | GitHub value |
| --- | --- |
| `allow_squash` | `allow_squash_merge` |
| `allow_merge_commit` | `allow_merge_commit` |
| `allow_rebase` | `allow_rebase_merge` |
| `allow_auto_merge` | `allow_auto_merge` |
| `allow_update_branch` | `allow_update_branch` |
| `delete_branch_on_merge` | `delete_branch_on_merge` |

```yaml
types:
  library:
    merge:
      allow_squash: true
      allow_merge_commit: false
      delete_branch_on_merge: true
```

`plan` reports each field separately even when `apply` bundles them into one
repository update. If that request fails, every bundled field receives the
same failed outcome because none can be proven successful independently.

### Recovery

Declare the previous boolean value and apply a new plan. Setting the field to
`null` stops future management but does not undo the value already stored on
GitHub.

## `repo`

**Shape:** optional repository attribute object inside any policy layer.

| Field | Type | Apply operation |
| --- | --- | --- |
| `description` | string or `null` | Repository update |
| `homepage` | string or `null` | Repository update |
| `topics` | string array or `null` | Replace all topics |
| `allow_forking` | boolean or `null` | Repository update |
| `web_commit_signoff_required` | boolean or `null` | Repository update |

```yaml
repos:
  octoform:
    repo:
      description: Declarative GitHub repository governance
      homepage: https://hector-ae21.github.io/octoform-docs/
      topics: [github, governance, typescript]
```

Topics are compared as a set, so order alone is not drift. GitHub can represent
an absent description or homepage as either an empty string or `null`; those
representations do not drift from one another.

Descriptions, homepages, and topics usually belong under a named repository
because they describe one project. Placing them in `defaults` or a type is
accepted but would converge every selected repository on the same metadata.

### Recovery and limits

Provide the intended previous value to restore it. Omit or cancel the field to
stop future management. Octoform does not keep a history of values applied in
earlier runs; GitHub and repository review records remain the recovery source.
