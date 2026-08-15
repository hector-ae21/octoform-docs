---
title: Repository settings
description: Manage GitHub repository features, merge behavior, metadata, visibility and archive state with Octoform 0.5.
---

# Repository settings

The `features`, `merge`, and `repo` blocks map primarily to GitHub's repository
update operation. Octoform groups compatible changes into one request per
repository.

Four of these settings exist only in GitHub's GraphQL API and are read and
written there; they are marked below and explained under
[settings that only GraphQL exposes](#settings-that-only-graphql-exposes).

## `features`

**Shape:** optional toggle object inside any policy layer.

```yaml
defaults:
  features:
    issues: true
    wiki: false
    projects: false
    discussions: false
```

| Field | GitHub value | Transport |
| --- | --- | --- |
| `issues` | `has_issues` | REST repository update |
| `wiki` | `has_wiki` | REST repository update |
| `projects` | `has_projects` | REST repository update |
| `discussions` | `has_discussions` | REST repository update |
| `sponsorships` | `hasSponsorshipsEnabled` | GraphQL |
| `pull_requests` | `hasPullRequestsEnabled` | GraphQL |

Each field accepts `true`, `false`, or `null`. Omission leaves the effective
value unchanged unless inherited from a wider policy layer.

!!! info "Changed in 0.5.0"

    `features.discussions` was blocked in earlier releases because the released
    REST integration could not mutate it. It is an ordinary managed setting
    now. `features.sponsorships` and `features.pull_requests` are new.

## `merge`

**Shape:** optional toggle object inside any policy layer.

| Field | GitHub value |
| --- | --- |
| `allow_squash` | `allow_squash_merge` |
| `allow_merge_commit` | `allow_merge_commit` |
| `allow_rebase` | `allow_rebase_merge` |
| `allow_auto_merge` | `allow_auto_merge` |
| `allow_update_branch` | `allow_update_branch` |
| `delete_branch_on_merge` | `delete_branch_on_merge` |

```yaml
types:
  library:
    merge:
      allow_squash: true
      allow_merge_commit: false
      delete_branch_on_merge: true
```

### Merge message defaults

What GitHub pre-fills in the commit title and body when a pull request is
merged.

| Field | Accepted values |
| --- | --- |
| `squash_title` | `PR_TITLE`, `COMMIT_OR_PR_TITLE` |
| `squash_message` | `PR_BODY`, `COMMIT_MESSAGES`, `BLANK` |
| `merge_commit_title` | `PR_TITLE`, `MERGE_MESSAGE` |
| `merge_commit_message` | `PR_BODY`, `PR_TITLE`, `BLANK` |

```yaml
merge:
  allow_squash: true
  squash_title: PR_TITLE
  squash_message: PR_BODY
```

The values are GitHub's own spelling, in capitals, and are sent unchanged.

`plan` reports each field separately even when `apply` bundles them into one
repository update. If that request fails, every bundled field receives the
same failed outcome because none can be proven successful independently.

### Recovery

Declare the previous boolean value and apply a new plan. Setting the field to
`null` stops future management but does not undo the value already stored on
GitHub.

## `repo`

**Shape:** optional repository attribute object inside any policy layer.

| Field | Type | Apply operation |
| --- | --- | --- |
| `description` | string or `null` | Repository update |
| `homepage` | string or `null` | Repository update |
| `topics` | string array or `null` | Replace all topics |
| `allow_forking` | boolean or `null` | Repository update |
| `web_commit_signoff_required` | boolean or `null` | Repository update |
| `issue_creation` | `ALL`, `COLLABORATORS_ONLY` | GraphQL |
| `pull_request_creation` | `ALL`, `COLLABORATORS_ONLY` | GraphQL |
| `template` | boolean or `null` | Repository update |
| `visibility` | `public`, `private` | Repository update |
| `archived` | boolean or `null` | Repository update |
| `name` | string or `null` | Repository rename |
| `rename_from` | string array or `null` | Safety condition on the rename |

```yaml
repos:
  octoform:
    repo:
      description: Declarative GitHub repository governance
      homepage: https://hector-ae21.github.io/octoform-docs/
      topics: [github, governance, typescript]
```

Topics are compared as a set, so order alone is not drift. GitHub can represent
an absent description or homepage as either an empty string or `null`; those
representations do not drift from one another.

Descriptions, homepages, and topics usually belong under a named repository
because they describe one project. Placing them in `defaults` or a type is
accepted but would converge every selected repository on the same metadata.

## The four guarded changes

`visibility`, `archived`, `template` and the repository rename are not ordinary
metadata. Each is reported as `sensitive`, and the order they are applied in is
part of the contract.

### `visibility`

```yaml
repos:
  example-prototype:
    repo:
      visibility: private
```

Making a repository public exposes everything in its history, and making it
private hides it from anybody who is not a collaborator, including forks and
stars. `internal` is not an accepted value and a repository that currently has
it is blocked rather than converted.

### `archived`

An archived repository is read-only. Octoform respects that everywhere: an
archived repository receives no planned mutation at all.

That creates an ordering requirement, and octoform follows it:

- **Unarchiving is sent first**, and every other change to that repository
  waits for it. There is no point planning work against a repository that is
  still read-only.
- **Archiving is sent last**, and only if everything else succeeded. Archiving
  a repository whose other changes failed would lock in a state nobody asked
  for.

### `name` and `rename_from`

```yaml
repos:
  example-service:
    repo:
      name: example-payments
      rename_from: [example-service]
```

Renaming a repository changes every URL that names it. GitHub redirects, but
nothing rewrites a workflow, a submodule or a package reference.

`rename_from` is a safety condition, exactly as it is for the
[default branch](branches-and-rulesets.md#default_branch): when the current
name is not in the list, the plan reports a blocked rename rather than renaming
an unanticipated repository.

The rename is keyed against the repository the policy layer selected, so a
`repo.name` in `defaults` would try to converge every selected repository on
one name. Declare it under `repos.<name>`.

## Settings that only GraphQL exposes

Four settings have no REST representation:

- `features.sponsorships`
- `features.pull_requests`
- `repo.issue_creation`
- `repo.pull_request_creation`

They are asked for only when a policy manages one of them, so a configuration
that does not mention any of the four never makes a GraphQL request at all.
They need a token GraphQL accepts, and a change to one is blocked rather than
attempted when the repository's node identity could not be read.

A GraphQL failure narrows to the same unreadable state a REST failure does, so
the planner blocks it for the same reason without knowing which transport
observed it. See
[trust and data boundaries](../security/trust-and-data.md) for what a partial
GraphQL response means.

## Recovery and limits

Provide the intended previous value to restore it. Omit or cancel the field to
stop future management. Octoform does not keep a history of values applied in
earlier runs; GitHub and repository review records remain the recovery source.

Two of the guarded changes are not fully reversible by a second run. Making a
private repository public cannot be undone in the sense that matters: the
history was readable while it was public. Renaming back restores the name but
not anything that was rebuilt against the new one.
