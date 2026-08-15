---
title: Labels and milestones
description: Declare a repository's labels and milestones, rename them without creating duplicates, and remove one only by saying so.
---

# Labels and milestones

Two collections that behave identically: both are matched by name, both support
renaming, and both remove an entry only when a policy says `mode: absent`.

```yaml title="octoform.yml"
owner: example-org

defaults:
  labels:
    - name: bug
      color: '#D73A4A'
      description: Something is broken
    - name: needs-triage
      color: '#FBCA04'
      rename_from: [triage, untriaged]
    - name: wontfix
      mode: absent

  milestones:
    - title: 'Next release'
      description: Work committed to the next tagged version
      due: '2026-12-01'
      state: open
```

## `labels`

**Shape:** an optional list of label objects in any policy layer. A narrower
layer replaces the list rather than merging into it.

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | Yes | The label's identity |
| `color` | No | Hex, with or without the leading `#` |
| `description` | No | |
| `rename_from` | No | Names this label may currently have |
| `mode` | No | `present` (the default) or `absent` |

## `milestones`

**Shape:** an optional list of milestone objects in any policy layer, replaced
the same way.

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | Yes | The milestone's identity |
| `description` | No | |
| `due` | No | A date, `YYYY-MM-DD` |
| `state` | No | `open` or `closed` |
| `rename_from` | No | Titles this milestone may currently have |
| `mode` | No | `present` (the default) or `absent` |

## `rename_from`

Without it, a renamed label reads as missing, and creating it again leaves two
labels where the file describes one.

```yaml
labels:
  - name: needs-triage
    rename_from: [triage, untriaged]
```

The list names what the entry **may currently be called**. Octoform looks for
the declared name first, and only then for each name in the list, in order,
renaming the first one it finds.

Looking for the declared name first does two things. A stale `rename_from` is
safe — once the rename has happened, later runs match the new name and the old
names match nothing, so there is no need to remove them. And a repository that
happens to have **both** names keeps both: renaming `a` to `b` where `b`
already exists leaves `a` alone rather than collapsing two entries into one.

An entry that matches neither the declared name nor any name in the list is
created, because as far as the file is concerned it is not there.

## Colours and dates

A label colour is compared with the leading `#` and the case removed, so
`#D73A4A`, `D73A4A` and `d73a4a` are the same colour and none of them drifts
from the others.

A milestone `due` is a calendar day. GitHub stores it as a timestamp and picks
the time itself, so the comparison is on the UTC day rather than the instant —
a milestone does not read as drifted because GitHub chose a different hour.

## Removing an entry

```yaml
labels:
  - name: wontfix
    mode: absent
```

Deleting a label takes it off every issue and pull request that carried it, and
GitHub does not record where it had been. It is reported as `destructive`.

Removing the entry from the YAML list does **not** delete anything. `mode:
absent` has to be written, for the same reason `none` has to be written to
revoke [access](access.md#revocation-is-a-word-not-a-deletion).

Closing a milestone is not deleting it: `state: closed` keeps the milestone and
everything attached to it.

## Undeclared entries are left alone

A label or milestone the configuration does not mention is not touched, and is
not reported as drift. The configuration describes what it manages, not an
exhaustive inventory of the repository.

## Recovery

- A renamed entry: declare the old name and put the new one in `rename_from`.
- A changed colour, description, due date or state: declare the previous value.
- A deleted label: recreating it restores the label. It does not restore its
  place on the issues it marked, which GitHub did not keep.
- A deleted milestone: recreating it restores the milestone, not the issues'
  membership of it.
