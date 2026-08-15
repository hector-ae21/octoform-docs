---
title: Document composition
description: Declare accounts, state the contract version, reuse named policies, compose imports, and exclude repositories in Octoform 0.4.
---

# Document composition

The root document establishes which accounts are governed and can compose
owner-neutral presets. Composition completes before repository discovery or
planning.

## `version`

**Shape:** optional integer at the document root. `1` is the only accepted
value.

```yaml
version: 1
```

It states which configuration contract the file is written against, so a
future contract can be told apart from this one instead of guessed at. It is
optional for a single-account file and **required whenever `owners` is used** —
a file declaring `owners` without it is rejected, because the shape is new and
silently accepting it would make a typo look like a valid old-style document.

## `owners`

**Shape:** optional mapping at the document root, keyed by GitHub login.

```yaml
version: 1

defaults:
  features: { issues: true }

owners:
  example-org:
    types:
      npm-package:
        merge: { allow_squash: true }
  example-personal:
    defaults:
      features: { issues: false }
```

Each key is one account. Everything at the root — `defaults`, `types`,
`policies` — is shared by all of them, and each account's block states only
what differs. The account's own layer wins key by key, so
`example-personal` above keeps every root default except `issues`.

Accounts are resolved, planned, and applied in the order they are declared,
one at a time, so their reports never interleave. A failure in one does not
stop another; see [plan](../commands/plan.md#determinism-and-concurrency).

Each login is checked against GitHub's own account-name format when the file
loads. One carrying a path separator, a control character, a leading or
trailing hyphen, or a character GitHub does not issue is rejected with the
reason, rather than becoming an opaque `404` several requests into a run.

Declaring both `owner` and `owners` fails: with both, there is no single
answer to which accounts the file governs. Declaring `repos` at the root
alongside `owners` fails for the same reason — a bare repository name no
longer identifies one repository.

## `owner`

**Shape:** optional string at the document root, and the alternative to
`owners` for a file that governs exactly one account.

```yaml
owner: your-account
```

A single-account file keeps its exact meaning: the same document produces the
same plans it did before `owners` existed. Nothing has to be migrated.
[`octoform config migrate`](../commands/config.md) converts one to the
multi-account shape when you want it, previewing by default and preserving
comments.

Octoform asks GitHub whether the login identifies an organization or a user.
The configuration does not declare the owner kind because GitHub is the
authority for that fact. [`inspect capabilities`](../commands/inspect.md)
prints what it resolved, together with the numeric identity behind the login.

| Concern | Organization | Personal account |
| --- | --- | --- |
| Repository discovery | Organization repositories visible to the token | Private repositories only when inspecting the authenticated user's own account; otherwise public repositories |
| Custom properties | Available when permissions and GitHub expose them | Not available |
| Repository rulesets | Probed per repository and credential | Probed per repository and credential |

Changing `owner` redirects every read and possible mutation. Treat that edit
as a new rollout: run `audit`, narrow a `plan`, and review the full repository
set before applying.

## `policies`

**Shape:** optional mapping at the document root, keyed by policy name.

```yaml
version: 1

policies:
  strict-merges:
    merge:
      allow_merge_commit: true
      allow_rebase: false
  protected-default:
    rulesets:
      - name: protected-branches
        target_branches: ['~DEFAULT_BRANCH']
        block_force_push: true

owners:
  example-org:
    defaults:
      policies: [strict-merges, protected-default]
      merge: { allow_rebase: true }
```

A policy is a reusable fragment of ordinary policy and nothing more. It has no
meaning of its own and cannot express anything a layer could not write inline.
Any layer folds them in through its own `policies` list, in the order listed,
**before** that layer's own keys — so the layer that references a policy always
wins over it. In the example, `allow_rebase` resolves to `true`, because the
layer states it itself.

A policy may reference other policies. A reference to a name that was never
declared fails and lists the ones that were; a cycle fails with the chain that
produced it, rather than a stack overflow.

The resolved configuration never carries the references onward: by the time
anything is planned, the fragments have been folded in and `policies` is gone.
[`inspect config`](../commands/inspect.md) shows that resolved shape.

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

An imported preset may omit `owner` and `owners` entirely, which is what makes
it portable: a preset directory can be shared by unrelated accounts because it
names none of them. An import may also declare `owners` for a file that
declares none, and an account declared in two files has its blocks merged
rather than replaced.

Regrouping imports without reordering them does not change the result:
importing `a` then `b` resolves identically to importing a file that itself
imports `a` then `b`. Circular imports fail with the complete import chain.

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
counts. The names are exact repository names, and an exclusion belongs to the
account that declares it: excluding `scratch` under one account never hides a
repository of the same name under another.

Use [`manage: false`](selection-and-precedence.md#manage) when the repository
should remain visible in audit output but receive no desired-state changes.

### Recovery

Removing a name restores normal discovery on the next run. Exclusion itself
never changes GitHub state, so there is nothing to roll back remotely.
