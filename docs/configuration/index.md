---
title: Configuration reference
description: Navigate every field and policy block accepted by Octoform 0.4.
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

| Area | Fields and decisions |
| --- | --- |
| [Document composition](document-composition.md) | `owner`, `imports`, `exclude`, relative paths, circular imports |
| [Selection and precedence](selection-and-precedence.md) | `defaults`, `types`, `repos`, `type`, `manage`, tri-state overrides |
| [Classification and audit](classification-and-audit.md) | `classify`, rule conditions, `audit`, read-only findings |
| [Repository settings](repository-settings.md) | `features`, `merge`, `repo` metadata and settings |
| [Security settings](security-settings.md) | Dependabot, secret scanning, private reporting, CodeQL default setup |
| [Branches and rulesets](branches-and-rulesets.md) | `default_branch`, `ensure_branches`, repository rulesets and capability evidence |
| [Environments](environments.md) | Environment creation and required user reviewers |
| [Files](files.md) | Safe `create-if-missing` repository file seeding |

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

See [core concepts](../concepts/index.md) for worked precedence examples and
the [plan command](../commands/plan.md) for interpreting the resulting diff.

## Global boundaries

- Archived repositories are observed but receive no planned mutations.
- An unreadable current value produces a blocked change, not an assumed value.
- Octoform `0.4` never deletes undeclared rulesets, environments, branches,
  or repository files.
- `features.discussions` is accepted but blocked because the released REST
  integration cannot mutate it.
- Owner plan names are not configuration. Availability is inferred from owner
  kind, visibility, permissions, and GitHub responses.
