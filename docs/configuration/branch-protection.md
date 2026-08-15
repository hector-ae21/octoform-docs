---
title: Classic branch protection
description: Declare classic branch protection, and understand why a branch governed by both protection and a ruleset blocks on both sides.
---

# Classic branch protection

Classic branch protection is GitHub's older mechanism, and it is still the only
one available in some situations. Octoform models it because those situations
exist, not because it is the better of the two.

```yaml title="octoform.yml"
owner: example-org

repos:
  example-service:
    branch_protection:
      - branch: main
        enforce_admins: true
        require_pull_request: true
        required_approvals: 2
        require_code_owner_review: true
        required_checks: [verify]
        strict_required_checks: true
        require_conversation_resolution: true
        allow_force_pushes: false
        allow_deletions: false
```

**Shape:** an optional list of protection objects in any policy layer, one per
branch. A narrower layer replaces the list.

## Fields

| Field | Required | Type |
| --- | --- | --- |
| `branch` | Yes | The exact branch name. No patterns. |
| `enforce_admins` | No | boolean |
| `require_pull_request` | No | boolean |
| `required_approvals` | No | number |
| `dismiss_stale_reviews` | No | boolean |
| `require_code_owner_review` | No | boolean |
| `require_last_push_approval` | No | boolean |
| `dismissal_restrictions` | No | `users`, `teams`, `apps` |
| `bypass_pull_request_allowances` | No | `users`, `teams`, `apps` |
| `restrict_pushes` | No | `users`, `teams`, `apps` |
| `required_checks` | No | string array |
| `strict_required_checks` | No | boolean |
| `require_linear_history` | No | boolean |
| `allow_force_pushes` | No | boolean |
| `allow_deletions` | No | boolean |
| `block_creations` | No | boolean |
| `require_conversation_resolution` | No | boolean |
| `lock_branch` | No | boolean |
| `allow_fork_syncing` | No | boolean |
| `require_signatures` | No | boolean |

The three restriction objects each take plain names:

```yaml
restrict_pushes:
  users: [example-lead]
  teams: [platform]
  apps: [release-bot]
```

GitHub's protection endpoint takes these by name rather than by id, unlike
ruleset bypass actors, so nothing here has to be resolved before it can be sent.

## One branch, one mechanism

A branch governed by **both** classic protection and a ruleset blocks on both
sides:

```text
2 not applied:

  example-service
    branch_protection.main: (unset) -> left as it is  [skipped: the ruleset "protect-main" both govern "main"; GitHub applies both and the stricter wins per rule, so neither block describes what is enforced]
    rulesets.protect-main: (unset) -> left as it is  [skipped: branch_protection both govern "main"; GitHub applies both and the stricter wins per rule, so neither block describes what is enforced]
```

GitHub applies both mechanisms, and the stricter of the two wins per rule. The
effective protection on that branch is therefore neither of the two things the
file says — and each run would report whichever half it was looking at as
correct.

**Both** sides are blocked rather than one, because there is no basis for
deciding which of the two the author meant. Delete one of them from the policy.

The conflict is reported even when neither side would otherwise produce a
change. A conflict that only surfaced on the runs where something happened to
differ would be a conflict nobody was told about on the runs where it mattered
least.

Note that this refusal is about **one policy declaring both**. An
[organization ruleset](organization-rulesets.md) reaching a branch that a
repository also protects is a different arrangement, and is not refused: it is
the intended way to put a floor under repositories that manage themselves.

## The request and the response are different shapes

GitHub takes a bare boolean for each switch and answers with `{ enabled: true }`;
it takes a restriction as plain logins and answers with objects. Both halves are
right about their own direction, and octoform bridges them, so a declared value
reads back as the value that was declared.

An omitted member of this body is read by GitHub as an instruction to remove
it, which is why the request always carries every modelled field.

## Risk

Every `branch_protection` change is `sensitive`.

## Observation and blocking

- Protection that could not be read blocks rather than being written over.
- A branch that does not exist blocks: there is nothing to protect.
- Protection is applied before file seeding and after any default-branch
  rename, so a rename does not leave the protection pointing at the old name.

## Recovery

Declare the previous values and run again. Removing the entry from the file
stops managing the branch; it does not remove the protection.

To take protection off a branch, remove it in GitHub after review. Octoform
`0.5` models the desired protection, not its deletion.

## When to prefer a ruleset

[Rulesets](branches-and-rulesets.md#rulesets) can target patterns rather than
one exact branch, can be aimed at many repositories at once from the
[organization](organization-rulesets.md), carry bypass actors with modes, and
support `evaluate` for a dry run. Classic protection does none of that.

Model classic protection when something you depend on still reads it, and
prefer a ruleset otherwise.
