---
title: The organization block
description: Declare an organization's profile and member policies as desired state, and understand why some of those settings reach every repository it owns.
---

# The organization block

Everything else in a configuration describes a repository. The `organization`
block describes the account above them.

```yaml title="octoform.yml"
owner: example-org

organization:
  profile:
    description: Platform engineering for the example estate
    website: https://example.invalid
  members:
    base_permission: read
    create_public_repositories: false
    fork_private_repositories: false
```

**Shape:** an optional `organization` object at the root of a single-owner
file, or under `owners.<login>` in a multi-owner one. It is resolved per
account and is never inherited from one account to another: an organization
policy is about one specific organization.

The block has six parts. This page covers the first two; each of the others has
its own page.

| Key | What it declares |
| --- | --- |
| `profile` | The organization's public identity |
| `members` | What members may do without being asked |
| [`properties`](custom-properties.md) | Custom property definitions |
| [`rulesets`](organization-rulesets.md) | Rulesets aimed at repositories the organization selects |
| [`teams`](teams.md) | Teams, their nesting, and who is on them |
| [`roles`](roles.md) | Who holds each organization role |

## It is planned, not commanded

Nothing here has a command of its own. Organization changes appear in the same
plan as repository changes, are confirmed the same way, and are grouped under a
heading that cannot be mistaken for a repository name:

```text
2 change(s) across 1 repositories:

  (example-org: the organisation itself)
    organization.members.base_permission: write -> read
    organization.profile.description: (unset) -> Platform engineering for the example estate
```

A setting that decides something about every repository an account owns should
never be the one thing nobody saw a diff for. That is the whole reason for
putting it in the plan rather than behind a subcommand.

## `profile`

```yaml
organization:
  profile:
    name: Example Platform
    description: Platform engineering for the example estate
    company: Example
    website: https://example.invalid
    location: Remote
    email: platform@example.invalid
    twitter_username: example
```

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string or `null` | Display name. It is not the login, and setting it does not rename the account. |
| `description` | string or `null` | |
| `company` | string or `null` | |
| `website` | string or `null` | GitHub's API calls this field `blog`. The configuration does not, because nothing about it is a blog. |
| `location` | string or `null` | |
| `email` | string or `null` | The public contact address, which is not the billing address. |
| `twitter_username` | string or `null` | |

An empty string and an unset value are the same absence, so declaring `''`
clears a field. `null` means what it means everywhere else in the
configuration: stop managing this key at this layer.

Every profile field is reported as `normal` risk. Changing the description of
an organization is a change to a description.

## `members`

What members may do without asking anybody.

```yaml
organization:
  members:
    base_permission: read
    create_repositories: true
    create_public_repositories: false
    create_private_repositories: true
    create_internal_repositories: false
    fork_private_repositories: false
    create_pages: true
    create_public_pages: false
    create_private_pages: true
    web_commit_signoff_required: true
    deploy_keys_enabled: false
    organization_projects: true
    repository_projects: false
```

| Field | Type | Meaning |
| --- | --- | --- |
| `base_permission` | `none`, `read`, `write`, `admin` | What every member gets on every repository, before any grant adds to it. |
| `create_repositories` | boolean | Whether members may create repositories at all. |
| `create_public_repositories` | boolean | |
| `create_private_repositories` | boolean | |
| `create_internal_repositories` | boolean | Enterprise Cloud only. GitHub ignores it elsewhere. |
| `fork_private_repositories` | boolean | Whether a private repository of this organization can be forked at all. |
| `create_pages` | boolean | |
| `create_public_pages` | boolean | |
| `create_private_pages` | boolean | |
| `web_commit_signoff_required` | boolean | Require every web commit to be signed off, across the organization. |
| `deploy_keys_enabled` | boolean | Whether repositories may use deploy keys at all. |
| `organization_projects` | boolean | |
| `repository_projects` | boolean | |

### Reach, and why eight of these are sensitive

`base_permission` is a floor, not a grant. Every member holds at least that
level on every repository the organization owns — including repositories no
configuration names and nobody was reading the plan for. Lowering it takes
access away from people who never appeared in any policy; raising it hands
access to people no policy mentions.

The same argument covers the creation switches, forking, web commit sign-off
and deploy keys: each decides something about repositories that do not exist
yet, or about all of them at once. Those eight are reported as `sensitive`:

- `base_permission`
- `create_repositories`
- `create_public_repositories`
- `create_private_repositories`
- `create_internal_repositories`
- `fork_private_repositories`
- `web_commit_signoff_required`
- `deploy_keys_enabled`

The remaining member settings, and every profile field, are `normal`.

### One deliberate omission

`members_allowed_repository_creation_type` is not modelled. GitHub documents it
as closing down, and documents that using it overrides `create_repositories` —
so a file that set both would have the field on its way out silently win. The
three per-visibility switches say the same thing without that hazard.

The security defaults for new repositories are absent for the same kind of
reason. GitHub documents every one of them as closing down on this endpoint in
favour of code security configurations, and a governance tool has no business
writing a setting whose own API says to stop using it.

## Personal accounts

A personal account has no profile block, no member policies, no custom
properties, no teams, no roles and no organization rulesets. Declaring any of
them under a personal account produces a blocked change naming the account and
the reason, so a shared preset stays shareable:

```text
1 not applied:

  (example-personal: the organisation itself)
    organization.members.base_permission: (unset) -> read  [skipped: "example-personal" is a personal account, which has none of the organisation settings]
```

Pass `--strict` to fail the run instead of reporting it.

## Observation and blocking

The organization is read once per account, before any repository is touched.

- Settings that could not be read block rather than being planned over. There
  is no default assumed for an organization setting.
- An unreadable individual value blocks only itself.
- A change is applied in one `PATCH`, before any repository work begins, so a
  lowered base permission is never briefly wider than the file asks for.

## Recovery

Declare the previous value and run again. There is no rollback command; see
[incidents and recovery](../security/incidents-and-recovery.md) for what a
second run can and cannot undo.

Removing the block from the file stops managing those keys. It does not restore
what they were.
