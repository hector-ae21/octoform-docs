---
title: Bring an organization under governance
description: Introduce Octoform to an organization that already has repositories, people and teams, in an order where each step is reviewable on its own.
---

# Bring an organization under governance

Governing repositories is additive: a policy that manages three settings leaves
everything else alone. Governing the **account** is not, because some of its
settings are floors and ceilings under repositories the file never names.

This guide is an order to introduce it in. Each step is reviewable on its own
and each one tells you something you need before the next.

## Before anything: what is there

```console
octoform inspect capabilities --config octoform.yml
octoform inspect members      --config octoform.yml
```

The first proves the account is an organization, gives you its numeric
identity, and reports any declaration in your file that does not apply to it.

The second is the one people skip, and it is the one that saves work later:

```text
Organisation: example-org
  owners: example-lead
  members: example-dev-a, example-dev-b
  outside collaborators: example-contractor
  without two-factor authentication: not visible to this token
  invited and waiting:
    example-newcomer as direct_member, 61 day(s)
  named by the configuration but not in the organisation:
    example-reviewer: organization.teams.reviewers.membership.members
```

Two things to act on before writing any more policy. An invitation waiting 61
days is not going to be accepted; withdraw it. And `example-reviewer` cannot be
put on a team until they are in the organization, so that line will block on
every run until somebody invites them.

## Step 1: the profile

Start with the part that reaches nothing.

```yaml
organization:
  profile:
    description: Platform engineering for the example estate
    website: https://example.invalid
```

```console
octoform plan --config octoform.yml
```

Every profile field is `normal` risk. This step exists to confirm the token,
the account and the file, not to change anything important.

If the plan reports the change as blocked with *could not read the current
organisation settings*, the token cannot administer the organization. Fix that
before continuing, because everything after this needs more, not less.

## Step 2: teams, before the things that name them

```yaml
organization:
  teams:
    platform:
      name: Platform
      privacy: closed
    platform-oncall:
      parent: platform
      privacy: closed
      membership:
        maintainers: [example-lead]
        members: [example-dev-a]
```

Teams first, because [roles](../configuration/roles.md) and
[repository grants](../configuration/access.md) both refer to them by slug, and
a reference to a team that does not exist blocks.

Leave `authoritative` alone at this stage. Additive membership cannot remove
anybody, which is what you want while the lists are still being written from
memory.

Read the plan for one thing in particular: a team you thought existed appearing
as a **creation**. That means the slug in your file is not the slug GitHub
uses, and the fix is [`rename_from`](../configuration/teams.md#rename_from),
not a second team.

## Step 3: property definitions, if you use them

```yaml
organization:
  properties:
    tier:
      value_type: single_select
      allowed_values: [bronze, silver, gold]
      default_value: bronze
```

Definitions before any [organization ruleset](../configuration/organization-rulesets.md)
that selects on them, and before the repository values that answer them.

If the plan blocks every definition with *could not read the current custom
property definitions*, that is not a per-property problem: the write endpoint
replaces, so a definition that cannot be read cannot be written without
discarding fields nobody looked at.

## Step 4: `base_permission`, deliberately

This is the step to slow down on.

```yaml
organization:
  members:
    base_permission: read
```

`base_permission` is a floor. Every member holds at least that level on every
repository the organization owns, including repositories no policy names.
Lowering it takes access away from people who never appeared in any file.

Before applying it, know who loses what. `inspect members` gives you the
members; the repositories they were reaching through the floor are the ones no
`access` block mentions.

The safe order is to add the explicit grants **first**, confirm them, and lower
the floor in a separate run:

```yaml
defaults:
  access:
    teams:
      platform: write
```

## Step 5: organization rulesets, in `evaluate`

```yaml
organization:
  rulesets:
    - name: watched-default-branches
      enforcement: evaluate
      target_branches: ['~DEFAULT_BRANCH']
      block_force_push: true
      repositories:
        properties:
          - name: tier
            values: [gold]
```

`evaluate` reports what would have been blocked without blocking it. For a
ruleset selected by property, that is the only honest way to find out what it
actually covers — the condition matches whatever answers `tier: gold` today,
including a repository created tomorrow.

Leave it evaluating for a week. Then set `active`.

## Step 6: roles, last

```yaml
organization:
  roles:
    Security manager:
      teams: [security]
```

Roles last because they refer to teams, and because both granting and revoking
one is `sensitive`: an organization role reaches every repository the account
owns.

A role name that matches nothing is refused as a name. GitHub has no endpoint
that creates an organization role, so Octoform cannot define one for you.

## When to turn `authoritative` on

Not until the lists have been correct for several runs.

`authoritative: true` on a [team membership](../configuration/teams.md#authoritative-and-its-two-guards)
or a [role](../configuration/roles.md) is what asks for removal. Two guards
protect you from the obvious mistakes — a list naming nobody, and a list that
would remove the account you are authenticated as — and neither protects you
from a list that is simply out of date.

Turn it on one team at a time, and read the `detach` lines in the plan before
confirming.

## What stays outside the file

Organization membership itself. Adding and removing people is
[three commands](../commands/members.md), one person per invocation, each
stating what it will do and asking first.

That is not an omission waiting to be filled in a later release. An invitation
is an act addressed to a person who is emailed about it, and a file that listed
members authoritatively would remove somebody the first time a name was
mistyped.

## If something goes wrong

There is no rollback command, and for the owner-level settings a second run
recovers most but not all of it. See
[incidents and recovery](../security/incidents-and-recovery.md), particularly
[recovering from an owner-level change](../security/incidents-and-recovery.md#recovering-from-an-owner-level-change).

## Related

- [The organization block](../configuration/organization.md)
- [Organization example](../examples/organization.md)
- [Teams and access example](../examples/teams-and-access.md)
- [Owner reconciliation](../architecture/behavior/owner-reconciliation.md)
