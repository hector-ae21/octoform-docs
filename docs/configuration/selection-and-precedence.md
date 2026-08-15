---
title: Selection and precedence
description: Resolve defaults, repository types, named overrides, and management boundaries in Octoform 0.4.
---

# Selection and precedence

Octoform resolves policy from the widest layer to the narrowest, one field at
a time. A narrow policy can override one value without copying its siblings.

The complete chain, widest first:

```text
imported files, in declaration order
  root policies referenced by the layer being resolved
    root defaults
      owner defaults
        types.<type>
          repos.<name>
```

Every step overlays the one before it field by field. A layer that says
nothing about a setting leaves the previous answer standing — which is what
lets an account, or one repository, state only what differs.

```yaml
version: 1

defaults:
  features:
    wiki: false

owners:
  example-org:
    types:
      library:
        merge:
          delete_branch_on_merge: true
    repos:
      exceptional-library:
        type: library
        features:
          wiki: null
```

A single-account file omits `owners` and declares `defaults`, `types`, and
`repos` at the root. The chain is the same, minus the owner layer.

The first two steps are described in
[document composition](document-composition.md): imports compose the document,
and a layer's `policies` list folds named fragments in before that layer's own
keys, so the layer referencing a policy always wins over it.

## `defaults`

**Shape:** optional policy set applied to every discovered repository that is
not excluded.

- Omitted fields remain unmanaged unless supplied by another applicable layer.
- `plan` compares only the resolved values.
- `apply` uses the endpoint associated with each resulting change; there is no
  GitHub operation corresponding to `defaults` itself.

## `types`

**Shape:** optional map from an operator-defined type name to a policy set.

```yaml
types:
  npm-package:
    environments:
      - name: npm
```

Type names have no built-in meaning. A repository receives at most one type,
from `repos.<name>.type` or the configured organization custom property. The
type policy is inserted between `defaults` and the named repository override.

## `repos`

**Shape:** optional map from exact repository name to a policy set plus an
optional `type` string.

```yaml
repos:
  octoform:
    type: npm-package
    repo:
      description: Declarative GitHub repository governance
```

`repos.<name>.type` overrides a custom-property value and is the only explicit
type source available for personal accounts. Referencing a type not declared
under `types` fails configuration loading.

Named entries do not create repositories. They refine policy only when a
repository with that name is discovered.

## Effective precedence

For each managed scalar field:

```text
defaults -> resolved type -> named repository
```

- A concrete narrower value replaces the wider value.
- `null` cancels a wider scalar value.
- An omitted narrower field leaves the wider value intact.

Resource lists are resolved as complete values at their layer. Octoform does
not merge two rulesets with the same name across layers field by field during
configuration resolution.

## `manage`

**Shape:** optional boolean accepted in `defaults`, a type policy, or a named
repository policy.

```yaml
repos:
  legacy-service:
    manage: false
```

`manage: false` keeps the repository in inventory and audit output but removes
its desired-state changes from apply consideration. This is distinct from
`exclude`, which removes the repository entirely.

### Plan and apply effect

A repository resolving to unmanaged produces no policy changes. Audit findings
can still be reported. Restoring `manage: true` or removing the narrow false
value makes the other resolved policy blocks effective again; always generate
a new plan before applying.

## Safe rollout pattern

1. Declare a narrow default or one type policy.
2. Run `plan --type <type>` or `plan --repo <name>`.
3. Use `null`, a repository override, or `manage: false` for known exceptions.
4. Expand the selection only after the narrow plan is understood.
