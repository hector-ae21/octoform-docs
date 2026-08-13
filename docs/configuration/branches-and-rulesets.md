---
title: Branches and rulesets
description: Rename default branches, ensure branches, and manage repository rulesets safely with Octoform 0.3.1.
---

# Branches and rulesets

Branch changes can affect automation and contributor workflows. Octoform
therefore exposes anticipated consequences and capability blocks in the plan.

## `default_branch`

```yaml
default_branch:
  name: main
  rename_from: [master]
```

| Field | Type | Omission |
| --- | --- | --- |
| `name` | string or `null` | No rename policy. |
| `rename_from` | string array or `null` | Rename from any current default branch when `name` differs. |

`rename_from` is a safety condition. When declared and the current default
branch is not listed, the plan reports a blocked rename rather than silently
filtering the repository or renaming an unanticipated branch.

Before planning a rename, Octoform inspects workflow files that name the
current default branch. GitHub redirects branch references and retargets open
pull requests, but it does not rewrite workflow triggers. Matching workflow
paths appear as a warning; Octoform never edits them automatically.

An empty repository with no default branch produces a blocked operation.
Executable renames use GitHub's branch rename endpoint and occur before ruleset,
branch, or file operations that may depend on the new name.

### Recovery

Update workflow references before applying. To reverse a completed rename,
declare the former name and include the current name in `rename_from`, then
review another plan. Removing the policy does not rename the branch back.

## `ensure_branches`

**Shape:** optional string array inside any policy layer.

```yaml
ensure_branches: [main, stable]
```

Each missing branch is created from the current default branch tip. Existing
branches are left in place: Octoform neither moves nor deletes them. If the
source default branch is unavailable, creation is blocked or fails without
inventing a commit.

Recovery is manual deletion in GitHub after checking open pull requests and
downstream automation; Octoform `0.3.1` does not model branch deletion.

## `rulesets`

**Shape:** optional list of repository ruleset objects.

```yaml
rulesets:
  - name: version-branches
    target_branches: ['v*.x']
    required_approvals: 1
    required_checks: [verify]
    block_force_push: true
    block_deletion: true
```

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | Yes | Identity used to find an existing ruleset. Renaming creates another ruleset. |
| `target_branches` | Yes | Literal names, globs, `~DEFAULT_BRANCH`, or `~ALL`. |
| `required_approvals` | No | Approving reviews required for pull requests. Zero still requires the pull-request path. |
| `required_checks` | No | Status check names that must pass. |
| `block_force_push` | No | Add the non-fast-forward restriction. |
| `block_deletion` | No | Add the deletion restriction. |

Plain branch names are converted to `refs/heads/<name>` at the API boundary.
Rulesets are always active and target branches.

### Comparison boundary

Octoform compares only modeled fields. It preserves bypass actors and rules it
does not understand by excluding them from the managed comparison. Undeclared
rulesets are never deleted. Renaming a declared ruleset therefore creates a
new one and leaves the old resource untouched.

### Private repository capability

GitHub enforces private-repository rulesets only when the owner context and
credential expose the capability. Octoform probes the default branch's
protection, which follows the same availability boundary:

- Existing protection proves availability.
- GitHub's explicit “branch not protected” response also proves availability.
- Forbidden or opaque not-found responses do not prove availability.
- An empty repository has no branch to probe and remains blocked.

The probe is read-only and applies identically to organization and personal
owners, including access granted through GitHub Education. Octoform does not
encode plan names.

### Recovery

Declare the previous modeled values to correct an existing named ruleset.
Delete unwanted superseded rulesets directly in GitHub after review; deletion
is outside the `0.3.1` contract.
