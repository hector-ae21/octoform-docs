---
title: Configuration reference
description: Navigate every field and policy block accepted by Octoform 0.5.
---

# Configuration reference

An Octoform configuration declares the GitHub state the operator intends to
manage. The root file requires only `owner`; every omitted policy value remains
unmanaged.

```yaml title="octoform.yml"
owner: your-account

defaults:
  merge:
    delete_branch_on_merge: true
```

## Configuration map

### The account

| Area | Fields and decisions |
| --- | --- |
| [Document composition](document-composition.md) | `owner`, `owners`, `imports`, `policies`, `exclude`, relative paths, circular imports |
| [Selection and precedence](selection-and-precedence.md) | `defaults`, `types`, `repos`, `type`, `manage`, tri-state overrides |
| [Classification and audit](classification-and-audit.md) | `classify`, rule conditions, `audit`, read-only findings |
| [The organization block](organization.md) | `organization.profile`, `organization.members`, reach and risk |
| [Custom properties](custom-properties.md) | `organization.properties` definitions and repository `properties` values |
| [Organization rulesets](organization-rulesets.md) | `organization.rulesets` and the repositories they select |
| [Teams and membership](teams.md) | `organization.teams`, nesting, and who is on each one |
| [Organization roles](roles.md) | `organization.roles`, granted to users and teams |

### The repository

| Area | Fields and decisions |
| --- | --- |
| [Repository settings](repository-settings.md) | `features`, `merge`, `repo` metadata, visibility, archive state and rename |
| [Security settings](security-settings.md) | Dependabot, secret scanning, private reporting, CodeQL default setup, immutable releases |
| [Branches and rulesets](branches-and-rulesets.md) | `default_branch`, `ensure_branches`, repository rulesets and capability evidence |
| [Ruleset rules](ruleset-rules.md) | Every target, rule and bypass actor a ruleset can carry |
| [Classic branch protection](branch-protection.md) | `branch_protection`, and why one branch takes one mechanism |
| [Repository access](access.md) | `access.users`, `access.teams`, and stating a revocation |
| [Labels and milestones](collections.md) | `labels`, `milestones`, `rename_from`, `mode: absent` |
| [Environments](environments.md) | Environment creation and required user reviewers |
| [Files](files.md) | Safe `create-if-missing` repository file seeding |

Organization membership is the one area that is deliberately not declarative.
See [`octoform members`](../commands/members.md).

## Common field contract

Every field page answers the same operational questions:

1. **Shape:** where the field appears and which values it accepts.
2. **Omission:** whether an absent or `null` value remains unmanaged.
3. **Resolution:** which precedence layer supplies the effective value.
4. **Observation:** which GitHub evidence Octoform reads before planning.
5. **Plan:** how drift, warnings, and blocked operations appear.
6. **Apply:** which endpoint or mutation receives an executable change.
7. **Recovery:** how to restore or stop managing the setting.

## Value semantics

Scalar policy values are tri-state:

| Declared value | Meaning |
| --- | --- |
| A concrete value | Manage the field and converge on that value. |
| `null` | Cancel an inherited value at this narrower layer. |
| Omitted | Do not introduce a value at this layer. |

After resolution, `null` and omission both mean that the effective field is
unmanaged. Lists such as `rulesets`, `environments`, and `files` are compared
according to their resource-specific rules; they are not scalar toggles.

Because `null` is already taken, every resource that can be *removed* has its
own word for it, and each one has to be written:

| To remove | Write |
| --- | --- |
| A collaborator or team grant | `none` |
| A label, milestone, team, or property definition | `mode: absent` |
| A repository custom property value | `''` or `[]` |

Deleting a line from the file never removes anything.

See [core concepts](../concepts/index.md) for worked precedence examples and
the [plan command](../commands/plan.md) for interpreting the resulting diff.

## Global boundaries

- Archived repositories are observed but receive no planned mutations, unless
  the policy is unarchiving them.
- An unreadable current value produces a blocked change, not an assumed value.
- Octoform `0.5` never deletes an undeclared ruleset, environment, branch, team,
  property definition, or repository file. Removal happens only where a policy
  states it.
- Owner plan names are not configuration. Availability is inferred from owner
  kind, visibility, permissions, and GitHub responses.
- A declaration that does not apply to the kind of account that declared it is
  reported, not silently ignored. `--strict` turns that report into a failure.
