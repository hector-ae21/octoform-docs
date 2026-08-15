---
title: Branches and rulesets
description: Rename default branches, ensure branches, and manage repository rulesets safely with Octoform 0.5.
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
downstream automation; Octoform `0.5` does not model branch deletion.

## `rulesets`

**Shape:** optional list of repository ruleset objects.

```yaml
rulesets:
  - name: version-branches
    target_branches: ['v*.x']
    enforcement: active
    required_approvals: 1
    required_checks: [verify]
    block_force_push: true
    block_deletion: true
    bypass:
      - users: [release-bot]
```

`name` is the identity used to find an existing ruleset, so renaming a declared
ruleset creates a second one and leaves the first untouched.

Every rule, every target and every bypass actor a ruleset can carry is
documented on one page, because a repository ruleset and an
[organization ruleset](organization-rulesets.md) share all of them:

**[Ruleset rules →](ruleset-rules.md)**

`0.5.0` completed that surface. Earlier releases modelled branch targets,
approvals, checks and two restrictions; a ruleset can now declare tags, pushes,
the merge queue, pattern rules, file restrictions, required workflows, code
scanning thresholds and bypass actors.

### Comparison boundary

Octoform compares only the fields a policy declares. A rule it does not model,
and a rule the policy does not mention, both survive an update untouched:
before sending, it reads the existing ruleset and keeps what the policy is
silent about.

!!! warning "Fixed in 0.5.0"

    Earlier releases did not preserve those rules. GitHub's update endpoint
    replaces the whole rule list, and what was not sent back was removed with
    nothing in the plan to say so. See
    [what an update replaces](ruleset-rules.md#what-an-update-replaces) for the
    three related defects fixed together.

Undeclared rulesets are never deleted.

### One branch, one mechanism

A branch governed by both a ruleset and
[classic branch protection](branch-protection.md) in the same policy blocks on
both sides. GitHub applies both and the stricter wins per rule, so neither
block describes what is actually enforced.

### Private repository capability

!!! info "Available since 0.3.1"

    Per-repository capability probing for private repositories owned by
    personal accounts arrived in `0.3.1` and is present throughout the `0.4`
    and `0.5` lines. Since `0.4.0` the answer also carries its evidence —
    status, reason, source, and when it was observed — which
    [`inspect capabilities`](../commands/inspect.md) prints per account. Since
    `0.5.0`, `inspect capabilities --repo <name>` answers the same question for
    one named repository.

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
is outside the `0.5` contract.
