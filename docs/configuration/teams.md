---
title: Teams and membership
description: Declare an organization's teams, their nesting and who is on each one, with the two guards that stop an authoritative list from emptying a team.
---

# Teams and membership

```yaml title="octoform.yml"
owner: example-org

organization:
  teams:
    platform:
      name: Platform
      description: Owns the shared build and release tooling
      privacy: closed
    platform-oncall:
      name: Platform on-call
      parent: platform
      privacy: closed
      notifications: false
      membership:
        maintainers: [example-lead]
        members: [example-dev-a, example-dev-b]
```

**Shape:** a map under `organization.teams`, keyed by the slug GitHub addresses
each team by. Each value is a team object, or `null` to stop managing it.

A map rather than a list, because a team is referred to by its slug from
elsewhere — a child names its parent by it — and a list would make the
reference point at a position instead of at a name.

## The slug is the key

The key is the slug. `name` is what the team is called, which GitHub re-slugs
when it changes.

| Field | Type | Meaning |
| --- | --- | --- |
| `name` | string | Display name. Defaults to the slug it is declared under. |
| `description` | string | |
| `privacy` | `secret` or `closed` | `secret` is visible only to its own members and the owners; `closed` is visible to the whole organization. |
| `notifications` | boolean | Whether members are notified when the team is mentioned. |
| `parent` | slug | The team this one sits under. An empty string lifts it back to the top. |
| `membership` | object | [Who is on it](#membership). |
| `rename_from` | string array | Slugs this team may currently have. |
| `mode` | `present` or `absent` | Defaults to `present`. |

Declaring only the slug is enough to create a team: everything else has a
default, and the display name defaults to the slug rather than making a file
repeat it.

### `rename_from`

Without it, a renamed team reads as missing and creating it again would leave
two. It works the way it does for [labels and milestones](collections.md): the
list names the slugs the team may currently have.

```yaml
organization:
  teams:
    platform:
      name: Platform
      rename_from: [infra, infrastructure]
```

### Nesting

A child team names its parent by slug. Three shapes are refused while planning,
each with the reason:

- **A parent that is neither declared nor an existing team.** There is nowhere
  to put the child.
- **A parent declared `mode: absent`.** The child would have nowhere to sit.
- **Parents that lead back round to the team itself.** The plan names the cycle
  — `a under b under a` — rather than waiting for a team to be created before
  creating it.

Two privacy constraints come from GitHub and are checked the same way: a team
with a parent cannot be secret, and neither can a team that has children.

### Creation order is derived, not written

A child whose parent this run is also creating waits for that parent. The wait
is recorded on the change itself, so two things follow:

- The parent is attempted first, whatever order the file happens to be in.
- A child whose parent's creation **failed** is blocked rather than sent to sit
  under a team that does not exist.

A parent that already exists is nothing to wait for. See
[owner reconciliation](../architecture/behavior/owner-reconciliation.md) for
the graph this comes from.

## Membership

```yaml
membership:
  maintainers: [example-lead]
  members: [example-dev-a, example-dev-b]
  authoritative: false
```

| Field | Type | Meaning |
| --- | --- | --- |
| `maintainers` | string array | Logins who administer the team |
| `members` | string array | Logins who belong to it without administering it |
| `authoritative` | boolean | Remove anyone the lists do not name. Off unless asked for. |

A login in both lists is a contradiction in the file, and the plan says so
rather than picking whichever came last.

Promoting somebody to `maintainer` is reported as `sensitive`. Adding an
ordinary member is `normal`.

### A pending invitation counts as somebody already asked

Team membership is read including invitations that have not been answered.
Without that, every run would see the same person missing and send the same
invitation again.

The plan shows the difference:

```text
    organization.membership.platform-oncall.example-dev-b: member (invited) -> maintainer
```

### `authoritative`, and its two guards

By default, membership is additive: nobody is removed for not appearing in a
file, for the reason absence means "not managed" everywhere else. Deleting a
line from a configuration file should not quietly take somebody's access away.

`authoritative: true` asks for the other behaviour, and is refused in two
cases:

- **The lists name nobody.** An authoritative membership naming nobody empties
  the team. That is what a half-rendered template looks like, and never what
  anyone means by leaving a section blank.
- **It would remove the account the run is authenticated as.** That can be the
  last change the account is able to make to the team.

Neither refusal comes from GitHub. Both are decisions taken here, because
GitHub performs both happily.

### Removal is destructive

Taking somebody off a team takes them out of every repository that team
reached — the team was the reason they could reach any of them. Removal is
reported as `destructive`, and it withdraws a pending invitation as well as an
active membership.

## Deleting a team

```yaml
organization:
  teams:
    legacy-reviewers:
      mode: absent
```

GitHub deletes a parent's child teams along with it. So `mode: absent` on a
team whose children the configuration declares should exist is a file asking
for two contradictory things, and is refused rather than resolved — the plan
names the children that would go with it.

Deleting a team is `destructive` and is not recoverable: the team, its
children, and every repository grant they carried are gone. Recreating a team
with the same slug creates an empty team.

## What is not here

Teams grant repository access from the *repository* side, under
[`access.teams`](access.md). One grant, one place to read it: two places to
declare it would be two places for them to contradict each other.

Team *membership of the organization* is separate again. Somebody has to be in
the organization before they can be on one of its teams, and
[that is a command](../commands/members.md), not a declaration.

## Recovery

- A team's fields: declare the previous values. The update endpoint patches, so
  only what the file states is sent, and a field the file drops keeps whatever
  it had.
- A removed member: add them back to the list and run again. They are re-added,
  or re-invited if they had never accepted.
- A deleted team: not recoverable. See
  [incidents and recovery](../security/incidents-and-recovery.md).
