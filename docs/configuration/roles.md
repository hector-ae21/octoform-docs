---
title: Organization roles
description: Grant and revoke organization roles for users and teams, and understand why Octoform assigns roles rather than defining them.
---

# Organization roles

```yaml title="octoform.yml"
owner: example-org

organization:
  roles:
    Security manager:
      teams: [security]
    All-repository read:
      users: [example-auditor]
      authoritative: true
```

**Shape:** a map under `organization.roles`, keyed by the role's name as GitHub
spells it. Each value states who holds it, or `null` to stop managing it.

| Field | Type | Meaning |
| --- | --- | --- |
| `users` | string array | Logins that hold the role directly |
| `teams` | string array | Team slugs whose members hold it |
| `authoritative` | boolean | Revoke the role from anyone the lists do not name. Off unless asked for. |

## Assignment only, and that is the API's limit

GitHub's description lists organization roles and grants or revokes them to
users and teams. It has **no endpoint that creates one**, and none at all for
custom repository roles.

So a role name here is a role that already exists. Naming one that does not is
refused as a name rather than treated as a request to define it:

```text
1 not applied:

  (example-org: the organisation itself)
    organization.roles.Release manager.users.example-lead: (unset) -> Release manager  [skipped: no organisation role called "Release manager", and there is no endpoint that creates one, so this is a name rather than a definition]
```

Custom repository roles are not modelled at all, for the same reason.

## Why these are names and ruleset roles are numbers

The organization role listing maps a name to the id the assignment endpoints
take, so a file can say `Security manager` and octoform can still send a
number.

A ruleset's [repository roles](ruleset-rules.md#why-roles-are-numbers) have no
such listing, which is why those stay numeric ids. The difference is not a
style choice; it is which lookups GitHub offers.

## Both directions are sensitive

An organization role carries permissions across the whole organization, so
granting one reaches every repository it owns — the same argument that makes
[`base_permission`](organization.md#reach-and-why-eight-of-these-are-sensitive)
sensitive. Revoking one takes that reach away.

Every grant and every revocation is reported as `sensitive`, whichever role it
is.

## `authoritative`, and its two guards

Additive by default, so nobody loses a role for not being written down. The
guards are the ones [team membership](teams.md#authoritative-and-its-two-guards)
already needed, for the same reasons:

- **The lists name nobody.** That would revoke the role from everyone, which is
  what a half-rendered template looks like.
- **It would revoke the role from the account the run is authenticated as.**
  That may be the permission it needs to grant it back.

## Teams the same run is creating

A team granted a role that this run is also creating waits for the team, the
same way a [membership](teams.md#creation-order-is-derived-not-written) does.
If the team's creation failed, the grant is blocked rather than attempted
against a team that does not exist.

## Observation and blocking

- Roles that could not be read block every declared assignment, rather than
  granting a role whose current holders are unknown.
- A role whose holders could not be read blocks that role only.
- A personal account has no organization roles, and a declaration under one is
  reported as not applicable.

## Recovery

Declare the previous holders and run again. A revoked role is re-granted by
naming the holder; nothing about the role's own definition was ever octoform's
to change, so nothing about it can have been lost.
