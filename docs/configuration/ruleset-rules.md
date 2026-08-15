---
title: Ruleset rules
description: Every rule, target and bypass actor a ruleset can carry, shared by repository rulesets and organization rulesets.
---

# Ruleset rules

A ruleset is a target, a set of rules, and a list of who may get past them. The
same three parts appear whether the ruleset sits on a repository or is aimed at
repositories by the organization, so they are described once here.

- [Repository rulesets](branches-and-rulesets.md#rulesets) declare where a
  ruleset lives.
- [Organization rulesets](organization-rulesets.md) add the one thing a
  repository's cannot have: a way of saying which repositories it reaches.

## Targets

Exactly one target key says what the ruleset governs, and the key name says
which. There is no separate `target` field, because a file could then say
`target: tag` beside a list of branches and nothing could resolve the
disagreement.

| Key | Type | Governs |
| --- | --- | --- |
| `target_branches` | string array | Branch names or patterns |
| `target_tags` | string array | Tag names or patterns |
| `target_pushes` | boolean | The whole repository. Matches no refs at all. |

`exclude` removes refs from whatever matched.

Two tokens are GitHub's own and are passed through untranslated:
`~DEFAULT_BRANCH` and `~ALL`. Any other plain name becomes `refs/heads/<name>`
or `refs/tags/<name>` at the API boundary, so a policy writes `main` rather
than a ref path.

```yaml
rulesets:
  - name: protected-releases
    target_tags: ['v*']
    exclude: ['v0.*']
    enforcement: active
    block_deletion: true
```

## Enforcement

| Value | Meaning |
| --- | --- |
| `active` | The rules block. This is the default. |
| `evaluate` | Report what would have been blocked, without blocking it. GitHub offers this only on some plans. |
| `disabled` | The ruleset exists and does nothing. |

## Rules

Every key is optional, and only a declared one is compared or sent. A rule
octoform never modelled, and a rule the policy simply did not mention, both
survive an update untouched.

That last sentence is a behaviour change, not a restatement. See
[what an update replaces](#what-an-update-replaces).

### Pull requests

| Key | Type |
| --- | --- |
| `require_pull_request` | boolean |
| `required_approvals` | number |
| `dismiss_stale_reviews` | boolean |
| `require_code_owner_review` | boolean |
| `require_last_push_approval` | boolean |
| `require_thread_resolution` | boolean |
| `allowed_merge_methods` | array of `merge`, `squash`, `rebase` |

Any of the configuring keys implies the pull-request rule. `required_approvals:
0` still requires the pull-request path; it requires no approvals on it.

### Status checks and deployments

| Key | Type | Meaning |
| --- | --- | --- |
| `required_checks` | string array | Check names that must pass |
| `strict_required_checks` | boolean | The branch must be up to date first |
| `checks_not_enforced_on_create` | boolean | Let a branch be created without the checks having run |
| `required_deployments` | string array | Environments that must have a successful deployment |

### Ref lifecycle

| Key | Type | Meaning |
| --- | --- | --- |
| `block_creation` | boolean | Refuse creating a matching ref |
| `block_update` | boolean | Refuse updating a matching ref |
| `allow_fetch_and_merge` | boolean | Allow an otherwise blocked update when it is a fetch and merge |
| `block_deletion` | boolean | |
| `block_force_push` | boolean | |
| `require_linear_history` | boolean | |
| `require_signatures` | boolean | |

GitHub has no "off" for a rule, only its absence. Writing `block_force_push:
false` is how a policy says so, and octoform translates the two spellings at
the API boundary.

### Merge queue

```yaml
rulesets:
  - name: queue-the-default-branch
    target_branches: ['~DEFAULT_BRANCH']
    merge_queue:
      merge_method: SQUASH
      grouping_strategy: ALLGREEN
      max_entries_to_build: 5
      max_entries_to_merge: 5
      min_entries_to_merge: 1
      min_entries_to_merge_wait_minutes: 5
      check_response_timeout_minutes: 60
```

`merge_queue` is a repository ruleset rule only. An organization ruleset that
declares one is blocked, naming the reason: a merge queue rule is not among the
rules an organization ruleset can carry.

### Scanning and review

| Key | Type | Meaning |
| --- | --- | --- |
| `required_code_scanning` | object array | Per tool: `tool`, `alerts_threshold`, `security_alerts_threshold` |
| `require_license_compliance_scanning` | boolean | |
| `copilot_code_review` | object | `review_draft_pull_requests`, `review_on_push` |

`alerts_threshold` is one of `none`, `errors`, `errors_and_warnings`, `all`.
`security_alerts_threshold` is one of `none`, `critical`, `high_or_higher`,
`medium_or_higher`, `all`.

### Patterns

Five rules match text against a pattern, and share one shape:

| Key | Matches |
| --- | --- |
| `commit_message_pattern` | The commit message |
| `commit_author_email_pattern` | The author's email address |
| `committer_email_pattern` | The committer's email address |
| `branch_name_pattern` | The branch name |
| `tag_name_pattern` | The tag name |

| Field | Type | Meaning |
| --- | --- | --- |
| `operator` | `starts_with`, `ends_with`, `contains`, `regex` | |
| `pattern` | string | |
| `negate` | boolean | Match everything the pattern does not |
| `name` | string | Shown by GitHub when the rule rejects a push |

```yaml
commit_message_pattern:
  operator: regex
  pattern: '^(feat|fix|docs|chore)(\(.+\))?: .+'
  name: Conventional commit subject
```

### File restrictions

| Key | Type |
| --- | --- |
| `restricted_file_paths` | string array of path globs |
| `restricted_file_extensions` | string array |
| `max_file_size` | number, in megabytes |
| `max_file_path_length` | number, in characters |

### Required workflows

```yaml
required_workflows:
  - path: .github/workflows/verify.yml
    repository: example-org/shared-workflows
    ref: main
workflows_not_enforced_on_create: true
```

| Field | Required | Meaning |
| --- | --- | --- |
| `path` | Yes | Path to the workflow file from the root of its repository |
| `repository` | No | `owner/name` holding it. Defaults to this repository. |
| `repository_id` | No | The numeric id of that repository |
| `ref` | No | Branch or tag to take the file from |
| `sha` | No | Commit to take the file from |

GitHub identifies the workflow's repository by numeric id rather than by name,
so `repository` is resolved before the rule can be sent. A name that does not
resolve blocks the whole ruleset rather than that one rule — sending the rest
would create a ruleset that enforces everything it was asked to and lets nobody
past.

Writing `repository_id` directly skips the lookup, which is the only way to
name a repository the token cannot read.

## Bypass actors

```yaml
rulesets:
  - name: protect-main
    target_branches: [main]
    block_force_push: true
    bypass:
      - users: [release-bot]
        teams: [platform]
      - mode: pull_request
        roles: [5]
```

**Shape:** a list of groups. Each group states one mode and the actors that
bypass in it. Grouping by mode keeps the common case — one exception granted to
several people — from repeating the mode on every line.

| Field | Type | Meaning |
| --- | --- | --- |
| `mode` | `always`, `pull_request`, `exempt` | Defaults to `always`. |
| `users` | string array | GitHub logins |
| `teams` | string array | Team slugs. Organization repositories only. |
| `apps` | string array | GitHub App slugs |
| `roles` | number array | Repository role ids |
| `deploy_keys` | boolean | Every deploy key on the repository, which GitHub grants as one actor |
| `organization_admins` | boolean | Organization owners. Organization repositories only. |

`pull_request` lets the actor past only on a pull request, and GitHub accepts it
on branch rulesets only. `exempt` skips the rules entirely and writes no bypass
entry to the audit log, so it is the one mode that leaves no trace of having
been used.

### Why roles are numbers

Everything in that table is named except `roles`. GitHub's ruleset endpoints
take a repository role as a numeric id, and its REST surface has no route that
maps a repository-role name to one — only *organization* roles can be listed.
So the number is what a policy writes, rather than a name octoform would have
to translate through a table it cannot verify.

[Organization roles](roles.md) do have that listing, which is why those are
declared by name.

### Names are resolved while reading

Users, teams and apps are resolved to the ids GitHub's endpoints take before
anything is sent. A name that resolves to nothing is a blocked line in the plan,
naming the actor, rather than an exception thrown partway through an apply.

## What an update replaces

GitHub's ruleset update endpoint replaces the entire rule list. Sending back
only the rules a policy mentions therefore deletes every other rule the ruleset
had — including ones octoform does not model.

Octoform reads the existing ruleset, keeps what the policy is silent about, and
sends the union.

!!! warning "Fixed in 0.5.0"

    Earlier releases did not. An update removed the rules octoform did not
    model and the ones the policy did not mention, with nothing in the plan to
    say so. Two related defects were fixed in the same release: an undeclared
    key was treated as a demand for GitHub's default, which made every run offer
    to strip approvals nobody had asked about; and two different lists of
    objects of the same length compared as identical, so a rule that had changed
    could read as unchanged.

## Recovery

Declare the values you want and run again. Octoform never deletes a ruleset
that the configuration does not name, so an unwanted ruleset created by an
earlier policy has to be deleted in GitHub after review.

Renaming a declared ruleset creates a second one: the name is the identity used
to find the existing resource.
