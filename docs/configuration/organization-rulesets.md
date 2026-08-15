---
title: Organization rulesets
description: Aim one ruleset at repositories selected by name or by custom property value, and understand why every one of them is reported as sensitive.
---

# Organization rulesets

A repository ruleset governs the repository it sits on. An organization ruleset
governs whatever its condition matches — which can include repositories no
configuration names and nobody was reading the plan for.

That difference is the whole page. The rules themselves are the same rules; see
[ruleset rules](ruleset-rules.md) for every target, rule and bypass actor.

```yaml title="octoform.yml"
owner: example-org

organization:
  rulesets:
    - name: no-force-push-anywhere
      enforcement: active
      target_branches: ['~DEFAULT_BRANCH']
      block_force_push: true
      block_deletion: true
      repositories:
        include: ['~ALL']
        exclude: [example-sandbox]
```

**Shape:** an optional list under `organization.rulesets`. Each entry is a
[ruleset](ruleset-rules.md) plus one extra key: `repositories`.

## `repositories`

Which repositories the ruleset reaches. This is the only thing an organization
ruleset has that a repository's cannot.

```yaml
repositories:
  properties:
    - name: tier
      values: [gold, silver]
  exclude_properties:
    - name: retired
      values: ['true']
```

| Field | Type | Meaning |
| --- | --- | --- |
| `include` | string array | Names or patterns. `~ALL` is GitHub's word for every repository. |
| `exclude` | string array | Names or patterns the ruleset does not reach, whatever else matched. |
| `properties` | object array | Repositories carrying **all** of these property values |
| `exclude_properties` | object array | Repositories carrying **any** of these are exempt |
| `protected` | boolean | Prevent the repositories this reaches from being renamed |

A property match is:

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | Yes | The property name |
| `values` | Yes | Any one of these matches |
| `source` | No | `custom` (the default) or `system` |

`source` distinguishes a property the organization defined from one GitHub
maintains itself. `custom` is the only kind anything else in this configuration
can declare; see [custom properties](custom-properties.md).

### By name or by property, never both

GitHub's ruleset conditions take one repository form beside the refs. A ruleset
declaring both a name condition and a property condition is a question the API
has already answered by refusing it, so octoform refuses it while planning and
says which two keys disagree.

`protected` is a field of the *name* condition, which is why it cannot be asked
for alongside property targeting.

### Targeting by property is the interesting one

Selecting by name means the ruleset covers what somebody remembered to list.
Selecting by property means it covers whatever currently answers `tier: gold`,
including a repository created tomorrow that answers the same way.

That is the point, and it is also the hazard. A repository's property value is
reported as `sensitive` for exactly this reason: changing `tier` from `bronze`
to `gold` can change what is enforced on that repository's default branch,
without any ruleset changing at all.

## Every one of these is sensitive

A repository ruleset reaches the repository it is on, and somebody looking at
that repository can see it. An organization ruleset reaches whatever matched.

So every organization ruleset change — creating one, updating one, widening one
— is reported as `sensitive`, whatever the rules inside it happen to be.

```text
1 change(s) across 1 repositories:

  (example-org: the organisation itself)
    organization.rulesets.no-force-push-anywhere: (unset) -> active on ~DEFAULT_BRANCH; block force push, block deletion; every repository except example-sandbox
```

## What an organization ruleset cannot carry

`merge_queue` is not among the rules an organization ruleset can hold. GitHub's
organization rule union does not include it, so a policy that declares one is
blocked with that reason rather than sent and refused.

Everything else in [ruleset rules](ruleset-rules.md) applies unchanged,
including bypass actors, required workflows and the pattern rules.

## Observation and blocking

- Rulesets that could not be read block, rather than being created a second
  time under the same name.
- A bypass actor or a required workflow whose name resolves to nothing blocks
  the whole ruleset. Sending the rest would create a ruleset that enforces
  everything it was asked to and lets nobody past.
- A selection that names nothing at all is refused while planning.
- Organization rulesets are applied last of the owner-level work, after teams,
  membership and roles, because they reach furthest.
- A personal account has no rulesets of its own to aim at repositories, and a
  declaration under one is reported as not applicable.

## Interaction with repository rulesets

Both can govern the same branch, and GitHub applies both. Octoform does not
refuse that combination: an organization ruleset that a repository cannot see
is the intended arrangement, and a repository can neither weaken nor remove one.

What *is* refused is governing one branch through both a ruleset and
[classic branch protection](branch-protection.md) in the same policy, which is
a different problem with a different answer.

## Recovery

Declare the previous rules and run again. Octoform never deletes an
organization ruleset the configuration does not name, so an unwanted one has to
be deleted in GitHub after review.

Because these reach repositories the file may not list, prefer `enforcement:
evaluate` for one run before `active`. It reports what would have been blocked
without blocking it, which is the only way to find out what a `~ALL` condition
actually covers.
