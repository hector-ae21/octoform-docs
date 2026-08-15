---
title: Organization example
description: Govern an account's profile, member policies, custom properties and organization rulesets in the same reviewed plan as its repositories.
---

# Organization

The account above the repositories, declared as state and reviewed in the same
plan. This is the shape the 0.5 line introduced.

<div class="octoform-example" markdown>

```yaml title="octoform.yml"
--8<-- "docs/examples/files/organization/octoform.yml"
```

[:material-download: Download YAML](files/organization/octoform.yml){ .octoform-example-download download="octoform.yml" aria-label="Download the organization YAML" }

</div>

## What the plan looks like

Organization changes are grouped under a heading that cannot be mistaken for a
repository name — a repository really can be called the same thing as the
organization that owns it:

```text
5 change(s) across 2 repositories:

  (example-org: the organisation itself)
    organization.profile.description: (unset) -> Platform engineering for the example estate
    organization.members.base_permission: write -> read
    organization.properties.tier: (unset) -> tier: single_select; bronze, silver, gold
    organization.rulesets.watched-default-branches: (unset) -> evaluate on ~DEFAULT_BRANCH; ...

  example-service
    properties.tier: (unset) -> gold
```

The owner-level work is applied first, and the organization ruleset last within
it, because it reaches furthest. See
[owner reconciliation](../architecture/behavior/owner-reconciliation.md).

## The order to introduce this in

Do not apply all of it at once against an organization that has repositories in
it. The three steps below each have a different failure mode, and separating
them is what makes each one reviewable.

### 1. The profile alone

```console
octoform plan --config octoform.yml
```

Comment out `members`, `properties` and `rulesets` for the first run. The
profile is `normal` risk and reaches nothing; it is the cheapest way to confirm
the token, the account and the file all work.

### 2. `members`, read carefully

`base_permission` is a floor under every repository the organization owns,
including repositories this file never names. Lowering it takes access away
from people who never appeared in any policy.

Before applying it, find out who that is:

```console
octoform inspect members --config octoform.yml
```

### 3. The ruleset, in `evaluate` first

The example ships with `enforcement: evaluate` on purpose. A property condition
covers whatever currently answers `tier: gold` — including repositories added
tomorrow — and `evaluate` reports what would have been blocked without blocking
it.

Switch it to `active` once you have seen a week of that.

## Definitions and values are different halves

`organization.properties.tier` defines the property. `properties.tier` under
`types.service` answers it. Neither can stand in for the other, and the same
word twice is GitHub's.

The definition endpoint replaces rather than patches, so octoform reads the
current definition and carries forward every field this file does not mention.
That is why correcting a description does not silently reset who may edit the
values — which is exactly what earlier releases did.

## What is not in this file

Membership of the organization itself. That is
[three commands](../commands/members.md), not a declaration, and this example
deliberately leaves it out: a file that listed members authoritatively would
remove somebody the first time a name was mistyped.

See the [teams and access example](teams-and-access.md) for who is on which
team and what each team may reach.
