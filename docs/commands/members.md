---
title: octoform members
description: See who is in an organization, and invite, remove or convert one person at a time with confirmation.
---

# `octoform members`

Four commands about the people in an organization: one that reports, and three
that change one person each.

```console
octoform inspect members --config octoform.yml
octoform members invite  --user example-newcomer --role direct_member
octoform members remove  --user example-leaver
octoform members convert --user example-contractor
```

All four are organizations only. A personal account has no members, no outside
collaborators and no invitations.

## Why these are commands and not policy

Every other thing Octoform manages is a state a file can describe and a run can
converge on. Organization membership is not, for three reasons:

- **An invitation is an act addressed to a person.** They are emailed about it.
  Sending one is not the same kind of event as setting a boolean.
- **An authoritative member list would remove somebody the first time a name
  was mistyped.** Team membership can afford that risk because
  [it has guards and a bounded blast radius](../configuration/teams.md#authoritative-and-its-two-guards);
  organization membership does not.
- **GitHub says so too.** Its own note on the invitation endpoint is that
  inviting people too quickly runs into secondary rate limiting. That is an API
  telling you this is not a bulk reconciliation operation.

So each command takes one login, says what it is about to do, asks, and does it
once.

## `inspect members`

Read-only. It changes nothing and needs only `read:org` on a classic token.

```console
octoform inspect members --config octoform.yml --owner example-org
```

```text
Organisation: example-org
  owners: example-lead
  members: example-dev-a, example-dev-b
  outside collaborators: example-contractor
  without two-factor authentication: not visible to this token
  invited and waiting:
    example-newcomer as direct_member, 23 day(s)
  invitations that failed:
    someone@example.invalid: email address is not verified
  named by the configuration but not in the organisation:
    example-reviewer: organization.teams.reviewers.membership.members, repos.example-service.access.users
```

Four listings and one answer.

The listings are things GitHub will show anybody with access: owners, members,
outside collaborators, and the invitations that are waiting or that failed.

**The answer is the part a configuration file makes possible.** Of the people
this file grants things to, which ones are in no part of the organization?
Those are the grants that will turn into invitations — and an invitation nobody
accepts is access that never arrives while the file goes on claiming it does.

Every login is collected with the paths that name it, because a login that
appears once because somebody typed it into one repository's access list is a
different finding from one that three teams and an organization role all depend
on. The sources are:

- `organization.teams.<slug>.membership.maintainers` and `.members`
- `organization.roles.<name>.users`
- `access.users` in `defaults`, in any `types.<type>`, and in any `repos.<name>`

A revocation is not a grant, so `access.users` entries set to `none` are not
counted as naming anybody.

An outside collaborator counts as known: having repository access without being
a member is a legitimate arrangement, not an omission. Somebody already invited
counts as known too — they have been asked, and asking again is not the finding.

### Invitation ages, and why they are in days

A pending invitation carries the number of whole days it has been waiting. The
useful question is whether something has been sitting there for a fortnight,
not how many seconds ago it was sent, and a stale invitation is not visible at
all without it.

Failed invitations carry GitHub's own reason rather than a paraphrase.

### Two-factor authentication

GitHub answers the `2fa_disabled` filter only for an organization owner. When
the token is not one, the report says **not visible to this token** rather than
listing nobody — an empty list would read as "everybody has it enabled", which
is a different and possibly untrue statement.

### Output

`--format json` wraps the report in the versioned envelope described in the
[execution contract](execution-contract.md#json-output).

## `members invite`

```console
octoform members invite --user example-newcomer --role direct_member
```

| Option | Meaning |
| --- | --- |
| `--user <login>` | The one person. Required. |
| `--role <role>` | `admin`, `direct_member` or `billing_manager`. Defaults to `direct_member`. |
| `--owner <login>` | Which declared account, when the configuration names more than one |
| `--yes`, `-y` | Skip the confirmation |

The command stops early, successfully, in two cases: the person is already a
member, or an invitation to them is already waiting. The second reports how
long it has been waiting rather than sending a second one.

GitHub's invitation endpoint takes a numeric user id or an email address — not
a login. So the login is resolved first, and one that no GitHub account answers
to is refused before anything is sent. Inviting a stranger by a name nobody
checked is exactly the mistake that one request avoids.

Before asking, the command states who will be invited, as what, and that they
will be emailed about it.

## `members remove`

```console
octoform members remove --user example-leaver
```

| Option | Meaning |
| --- | --- |
| `--user <login>` | The one person. Required. |
| `--owner <login>` | Which declared account |
| `--yes`, `-y` | Skip the confirmation |

One endpoint removes an active member and cancels a pending invitation, so one
command covers both states — and says which of the two it found before it asks.

Afterwards it reports something the request does not make obvious: **membership
held through an enterprise team survives this.** The request looks like it did
more than it did, and that membership has to be removed at the enterprise.

## `members convert`

```console
octoform members convert --user example-contractor
```

Turns a member into an outside collaborator. They stop being a member and keep
only the repositories their current teams allow.

That is a narrowing rather than a removal, but it *is* a removal from the
organization, so it is guarded exactly like one. Somebody who is not a member
is refused; somebody who is already an outside collaborator is reported and
nothing changes.

## The two refusals

`members remove` and `members convert` both refuse two people, whatever else is
true:

- **The only remaining owner.** An organization with no owners cannot be
  administered by anybody, including the people trying to fix it.
- **The account the run is authenticated as.** It could not put itself back,
  whatever it was allowed to do a moment earlier.

Neither is an API error. GitHub performs both happily; these are decisions
taken here rather than failures reported back.

```console
$ octoform members remove --user example-lead
Refused: "example-lead" is the only owner of this organisation, and an organisation with no owners cannot be administered by anybody.
```

The same two guards protect
[team membership](../configuration/teams.md#authoritative-and-its-two-guards)
and [role holders](../configuration/roles.md#authoritative-and-its-two-guards),
where they take the form of a refused authoritative block.

## Exit codes

| Code | When |
| --- | --- |
| `0` | The change was made, or there was nothing to do |
| `1` | The confirmation was declined; nothing was sent |
| `2` | The command line or the configuration could not be understood |
| `3` | The token is missing, lacks a scope, or was rejected |
| `4` | A guard refused it, or the login or role does not exist |
| `5` | GitHub refused the request |

## Permissions

`inspect members` needs `read:org` on a classic token. The three write commands
need `admin:org`. Fine-grained equivalents are listed per route in the
generated permission model; see
[credentials and permissions](../security/credentials-and-permissions.md).

## What is not here

Personal access token request review is not implemented, and will not be while
Octoform authenticates with a personal access token. Every one of GitHub's
fine-grained PAT endpoints — the request listing, both review routes, the grant
listing, both update routes and the two repository listings — states that only
GitHub Apps can use it. Commands for them would refuse every call whatever
permissions the token carried, so the capability register records them as
`unsupported` with that reason instead.
