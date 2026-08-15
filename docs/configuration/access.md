---
title: Repository access
description: Grant collaborators and teams access to a repository, with revocation stated rather than inferred from a deleted line.
---

# Repository access

```yaml title="octoform.yml"
owner: example-org

defaults:
  access:
    teams:
      platform: maintain
      security: read

repos:
  example-service:
    access:
      users:
        example-contractor: write
      teams:
        payments: admin
```

**Shape:** an optional `access` object in any policy layer, holding two maps.

| Key | Keyed by | Value |
| --- | --- | --- |
| `access.users` | GitHub login | A permission level |
| `access.teams` | Team slug | A permission level |

Both maps merge by key across precedence layers, so a narrower layer adds
grants rather than replacing the set.

## Levels

| Level | |
| --- | --- |
| `read` | |
| `triage` | |
| `write` | |
| `maintain` | |
| `admin` | |
| `none` | Octoform's word for revoking the grant |
| Any other string | A custom repository role, granted by name |

GitHub has three vocabularies for the same five levels — the grant endpoints
take `pull` and `push`, invitations take `read` and `write`, and a collaborator
reads back as `role_name`. A policy writes one spelling and octoform sends
whichever each endpoint wants, so a grant does not read as drift on the next
run.

A personal repository grants collaborators write access and nothing else. Any
other level under a personal account is blocked with that reason.

## Revocation is a word, not a deletion

Deleting a line from a configuration file never removes access. Absence means
unmanaged, here as everywhere.

```yaml
access:
  users:
    example-former-contractor: none
```

`none` is the instruction. It is reported as `destructive`, because the person
loses the repository.

One revocation is refused: taking admin access away from the account octoform
is authenticated as, on a repository it is being run against. That would lock
the run out of the repository it is in the middle of governing.

## Pending invitations are read

A grant to somebody who is not a collaborator yet produces an invitation, and
an invitation sits unanswered until the person accepts it.

Octoform reads those invitations. Treating one as "no access" would make every
run send the same invitation again, and the plan would never converge on a
repository whose invitee has simply not answered.

```text
    access.users.example-contractor: invited as read -> write
```

An invitation already offering the right level produces no change. One offering
the wrong level is amended rather than re-sent — except to a custom role, which
invitations cannot carry. That case is blocked, naming the reason: the
invitation has to be answered or withdrawn before a custom role can be granted.

## Team grants live here

A team's *repository* access is declared from the repository side, including
when the team itself is declared under
[`organization.teams`](teams.md). One grant, one place to read it.

Two places to declare a single grant would be two places for them to
contradict each other, so there is deliberately no team-side spelling of the
same thing.

There are no teams on a personal repository, and a `access.teams` declaration
under one is reported as not applicable.

## Risk

Every `access` change is `sensitive`, and a revocation is `destructive`.
Granting somebody `read` and taking away their `admin` are the same setting;
what differs is which direction the change goes.

The plan reports the operation as `attach` for a grant and `detach` for a
revocation, rather than as create or update: the person and the team exist
either way, and what changes is whether they are linked to this repository.

## Observation and blocking

- Collaborators and invitations that could not be read block, rather than
  granting access on top of a state nobody saw.
- Teams whose access could not be read block the same way.
- An archived repository receives no access changes, like every other change.

## Recovery

Declare the previous level and run again. A revoked collaborator has to accept
a new invitation; a revoked team is re-granted immediately.

Access removed through `none` is recoverable in the sense that the grant can be
re-issued. What is not recoverable is anything the person did with it in the
meantime, and what a *team* deletion took with it — see
[teams](teams.md#deleting-a-team).
