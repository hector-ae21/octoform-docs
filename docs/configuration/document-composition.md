---
title: Document composition
description: Define the owner, compose reusable imports, and exclude repositories from Octoform 0.3.
---

# Document composition

The root document establishes account identity and can compose owner-neutral
presets. Composition completes before repository discovery or planning.

## `owner`

**Shape:** required string at the document root.

```yaml
owner: your-account
```

Octoform asks GitHub whether the login identifies an organization or a user.
The configuration does not declare the owner kind because GitHub is the
authority for that fact.

| Concern | Organization | Personal account |
| --- | --- | --- |
| Repository discovery | Organization repositories visible to the token | Private repositories only when inspecting the authenticated user's own account; otherwise public repositories |
| Custom properties | Available when permissions and GitHub expose them | Not available |
| Repository rulesets | Probed per repository and credential | Probed per repository and credential |

Changing `owner` redirects every read and possible mutation. Treat that edit
as a new rollout: run `audit`, narrow a `plan`, and review the full repository
set before applying.

## `imports`

**Shape:** optional string array at the document root.

```yaml
imports:
  - presets/security-baseline.yml
  - presets/npm-library.yml
```

Paths resolve relative to the file that declares them. Imported files can
import additional files, which allows a preset directory to remain portable.

### Resolution order

1. The earliest import supplies the widest base.
2. Each later import overrides matching values from earlier imports.
3. The importing file overrides every imported value.
4. Repository policy precedence runs after document composition.

An imported preset may omit `owner`. If composed files declare conflicting
owners, loading fails before GitHub is contacted. Circular imports also fail
with the complete import chain.

### Plan and apply effect

`imports` has no GitHub endpoint. Its effect is indirect: imported fields
become part of the resolved configuration used by `audit`, `plan`, and
`apply`. Regenerate plans for every consuming root after changing a shared
preset.

### Recovery

Remove the import or cancel individual inherited scalar fields with `null` at
a narrower layer. Removing an import stops managing values that only came from
that file; it does not revert settings already applied to GitHub.

## `exclude.repos`

**Shape:** optional string array nested under `exclude`.

```yaml
exclude:
  repos:
    - scratch
    - retired-prototype
```

Excluded repositories are removed from inventory, audit, plan, apply, and
counts. The names are exact repository names under `owner`.

Use [`manage: false`](selection-and-precedence.md#manage) when the repository
should remain visible in audit output but receive no desired-state changes.

### Recovery

Removing a name restores normal discovery on the next run. Exclusion itself
never changes GitHub state, so there is nothing to roll back remotely.
