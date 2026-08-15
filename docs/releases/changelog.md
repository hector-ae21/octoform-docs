---
title: Changelog
description: Review Octoform 0.5 changes by exact package patch and identify when guidance becomes applicable.
---

# Changelog

The documentation selector remains `0.5` for compatible `0.5.x` packages.
Entries below identify the exact patch that introduced each change. A page
marked **Available since 0.5.1** would apply to `0.5.1` and every later
`0.5.x` patch, but not to `0.5.0`.

Earlier lines keep their own published documentation; the `0.4` and `0.3`
entries below remain here as the patch index for those lines.

## 0.5.0 — 2026-08-16

**Applies from:** `0.5.0`  
**Compatibility:** every existing configuration file keeps working. Two
exported shapes moved, and three fixes change what a run does to a file you
have not edited — see **Changed** and **Fixed**.

Octoform now governs the account above the repositories as well as the
repositories themselves, and finishes the repository surface it had started.

### Added — the organization itself

- An [`organization` block](../configuration/organization.md), planned and
  applied like any other change rather than through a command of its own. Its
  profile, and what members may do without being asked: the base permission,
  what they may create, forking, Pages, web commit sign-off, deploy keys and
  projects.
- The base permission and the creation switches are reported as `sensitive`,
  because they reach every repository the organization owns including ones no
  policy names. The organization is applied before any repository, so a lowered
  floor is never briefly wider than the file asks for.
- [Custom property definitions](../configuration/custom-properties.md) under
  `organization.properties`. The write endpoint replaces rather than patches,
  so the current definition is read first and every field the configuration is
  silent about is carried forward.
- [Organization rulesets](../configuration/organization-rulesets.md) under
  `organization.rulesets`: the same rules a repository can carry, aimed at
  repositories selected by name or by custom property value. Every one is
  `sensitive`.
- [Teams](../configuration/teams.md) under `organization.teams`, keyed by slug,
  with nesting. A child team waits for a parent the same run is creating, and
  is blocked rather than attempted when that creation fails.
- Team membership under `organization.teams.<slug>.membership`: additive unless
  the block says `authoritative`, and a pending invitation counts as somebody
  already asked.
- [Organization role assignment](../configuration/roles.md) under
  `organization.roles`, granting and revoking a role for users and teams.
- [`octoform inspect members`](../commands/members.md): owners, members,
  outside collaborators, waiting and failed invitations, and which people the
  configuration names are in no part of the organization.
- [`octoform members invite`, `remove` and `convert`](../commands/members.md):
  one login per invocation, each saying what it will do and asking first.

### Added — the repository surface, completed

- Every [ruleset rule type, target and condition](../configuration/ruleset-rules.md),
  modelled as one table that reading, writing and comparison are all derived
  from.
- [Ruleset bypass actors](../configuration/ruleset-rules.md#bypass-actors) —
  users, teams, apps, repository roles, deploy keys and organization admins —
  resolved by name while reading, so an unknown name is a blocked line in the
  plan rather than an exception thrown mid-apply.
- [Classic branch protection](../configuration/branch-protection.md) under
  `branch_protection`. A branch governed by both protection and a ruleset
  blocks on both sides.
- [`access.users` and `access.teams`](../configuration/access.md), with pending
  invitations read so a grant to somebody who is not a collaborator yet is not
  re-sent on every run. Revocation is spelled `none`.
- [Labels, milestones](../configuration/collections.md) and repository custom
  property values, with `rename_from` and `mode: absent`.
- [`repo.visibility`, `repo.archived`, `repo.template` and repository rename](../configuration/repository-settings.md#the-four-guarded-changes).
  Unarchiving is sent first and everything waits for it; archiving is sent last
  and only if everything else succeeded.
- The [four repository settings only GraphQL exposes](../configuration/repository-settings.md#settings-that-only-graphql-exposes).
  `features.discussions` is now changeable instead of permanently blocked.
- Merge message defaults and `security.immutable_releases`.
- A [warning](../configuration/security-settings.md#codeql-setup-boundary) when
  `security.code_scanning_default_setup` would disable a workflow that uploads
  code scanning results, which GitHub refuses without either side reporting a
  failure.
- A [resource dependency graph](../architecture/behavior/owner-reconciliation.md):
  apply order comes from the graph rather than from the order the steps happen
  to be written in, and a dependent whose prerequisite failed is blocked rather
  than attempted.
- [`octoform inspect capabilities --repo <name>`](../commands/inspect.md#one-repository-at-a-time).
- A [GraphQL transport](../architecture/software/container-view.md#two-transports-one-vocabulary),
  normalized against the REST one.

### Changed

- **`Change.repo` is now optional.** An organization setting has no repository
  to name. Programmatic callers that read `change.repo` as a string have to
  handle its absence.
- **`planOrganization`, `setPropertyValues` and `putPropertySchema` take
  different arguments.**
- `classify --apply` and `properties sync` send thirty repositories per
  request. Neither did, and exceeding that limit is the ordinary case for an
  organization large enough to want either command.

### Fixed

- **`properties sync` no longer clears the fields it says nothing about.** It
  sent the allowed values alone, which on a property that already existed reset
  its description, its default value and who may edit it — every run, silently.
- **Updating a ruleset no longer deletes the rules Octoform does not model, or
  the ones the policy does not mention.** The update replaces the whole rule
  list, and what was not sent back was being removed with nothing in the plan
  to say so.
- **An undeclared ruleset key is no longer treated as a demand for GitHub's
  default**, which made every run offer to strip approvals and protections
  nobody had asked about.
- Two different lists of objects of the same length no longer compare as
  identical when a ruleset is compared.
- A seeded file is read as bytes, so a file that is not valid UTF-8 text is no
  longer corrupted, and its existence is checked on the branch it would be
  created on rather than on the default branch.
- The topics, PUT/DELETE toggle, code scanning and branch rename steps record
  their failures, so anything depending on them is blocked instead of
  attempted.
- [`config migrate`](../commands/config.md) moves a `repos` block at an
  imported file's root under the account the root file declares, instead of
  refusing the whole migration.

The [0.5.0 application Release][release-050] contains the package evidence and
[SHA-256 manifest][checksums-050].

## 0.4.1 — 2026-08-15

**Applies from:** `0.4.1`  
**Compatibility:** no exit class, schema, or exported signature moved. Every
change is a fix to what a command reports or refuses.

These came from running `0.4.0` against real multi-account configurations
rather than against fixtures.

### Fixed

- [`config migrate`](../commands/config.md) no longer produces a configuration
  that fails to load. It converted the root file's `owner` to `owners` while
  leaving a `repos` block at the root of an imported file, which is accepted
  beside `owner` and rejected beside `owners`. It now stops, names the files
  that have to move first, and writes nothing.
- A setting whose current value could not be read is explained from what was
  observed rather than from a guessed commercial plan. Where repository
  visibility settles the question, the reason names it.
- A [plan](../commands/plan.md#reading-the-summary) states how many
  repositories carry blocked work, instead of leaving those that also have
  changes counted only as changed.

### Added

- `PlanSummary` gains `blockedRepositories`: repositories with at least one
  blocked change, whether or not they also changed.

## 0.4.0 — 2026-08-15

**Applies from:** `0.4.0`  
**Compatibility:** every existing configuration file keeps its exact meaning
and produces the same plans. Two contracts changed — see **Changed** below.

### Added

- One configuration can describe several GitHub accounts. A root `owners`
  mapping keyed by login replaces one file per account, and the root of the
  file holds whatever those accounts share.
- A root `version` field states the configuration contract a file is written
  against. `1` is the only accepted value, required whenever `owners` is used.
- A root `policies` mapping declares named, reusable policy fragments that any
  layer folds in before its own keys.
- `--owner <login>`, repeatable, narrows a run to the named accounts and
  rejects a login the configuration does not declare. `--repo` accepts a
  qualified `owner/name`.
- `--strict` fails a run when a declaration does not apply to the account that
  declared it.
- [`octoform config validate`](../commands/config.md) and
  [`octoform config migrate`](../commands/config.md), both offline.
- [`octoform inspect config`](../commands/inspect.md) and
  [`octoform inspect capabilities`](../commands/inspect.md).
- Capability answers carry status, reason, source, and observation time
  instead of a bare boolean, so an opaque `404` no longer reads the same as a
  confirmed denial.
- Owner discovery resolves an account's kind and GitHub's numeric identity for
  it, which is the identity that survives a rename.
- `--concurrency <n>` bounds repositories worked on at once per account, and a
  failure in one account no longer aborts the rest; `--fail-fast` opts back
  into stopping at the first failure.
- [`plan --out`](../commands/plan.md#saving-a-plan) saves a versioned plan and
  [`apply --plan`](../commands/apply.md#applying-a-saved-plan) performs
  exactly that plan or refuses with a named reason.
- `--format json` wraps output in a versioned envelope on `plan` and both
  `inspect` commands.
- The pinned REST API version is now sent on every request.

### Changed

- **Exit codes are a frozen set of six classes.** `audit` now exits `1` when
  it reports findings rather than `0`, and `apply` follows the same classes. A
  pipeline that tested for success without inspecting the code will now fail
  on drift, which is the intended behaviour. See the
  [execution contract](../commands/execution-contract.md#exit-codes).
- **The programmatic API changed.** `loadConfig` returns a resolved
  configuration holding one scope per owner, so `config.owner` becomes
  `config.owners[n].owner`; `planRepo` takes the account as its first
  argument; and `PlanOptions.rulesetCapability` replaces
  `rulesetsEnforcedOnPrivate`. Configuration files are unaffected.

### Security

- Credentials come from an explicit token or token provider, then
  `GITHUB_TOKEN`, then `GH_TOKEN`, and nowhere else. A credential-shaped value
  in a configuration file is rejected when it loads, naming the YAML path
  without echoing the value.
- A declared owner is checked against GitHub's own login format, so one
  carrying a path separator, a control character, or a homoglyph fails with
  the reason instead of an opaque `404` mid-run.
- Control characters in anything read from GitHub — repository names,
  descriptions, topics, property values, API errors — are escaped before being
  printed, so a crafted value cannot rewrite the report or imitate the
  confirmation prompt.

## 0.3.2 — 2026-08-14

**Applies from:** `0.3.2`  
**Compatibility:** maintenance-only; no configuration, CLI, public API,
capability, permission, or plan/apply migration.

### Changed

- Unified deterministic formatting, verification, generated-reference, test,
  build, and packed-package checks.
- Hardened pull-request and release workflows with pinned actions, explicit
  permissions, timeouts, concurrency, and Node.js 20, 22, and 24 coverage.
- Added dependency review, CodeQL, secret-scanning verification, and scheduled
  read-only REST/GraphQL contract-drift detection.
- Enforced valid TSDoc for authored production and tooling comments.
- Published deterministic TypeDoc, configuration-schema, CLI, capability,
  permission, GitHub API, and SHA-256 release artifacts.
- Moved maintained product guidance to this dedicated documentation site.

The [0.3.2 application Release][release-032] contains the package evidence and
[SHA-256 manifest][checksums-032].

## 0.3.1 — 2026-08-12

**Applies from:** `0.3.1`

### Fixed

- Private repositories owned by personal accounts no longer have repository
  rulesets blocked solely because organization-wide rulesets are unavailable.
  Planning probes capability for the repository and current token without
  hard-coding commercial plan names.

See [Branches and rulesets](../configuration/branches-and-rulesets.md) for the
operational boundary and [the 0.3.1 Release][release-031] for the immutable
application record.

## 0.3.0 — 2026-08-10

**Applies from:** `0.3.0`

### Added

- Existing environment reviewers can be reconciled; a team reviewer remains a
  blocked operation because the `0.3` model resolves declared reviewers as
  users.
- The domain model documents declared policy, observed repository state, and
  planned changes.

### Changed

- `RepoStructure.environments` changed from `string[]` to
  `ExistingEnvironment[]`. This affects direct programmatic consumers of
  `getRepoDetail`; the CLI and YAML configuration remain compatible.

See [the 0.3.0 Release][release-030] for the immutable application record.

## Upgrade rule

Before changing the installed patch, review every entry after the current
version and up to the target. If a future change cannot be documented as
compatible within `0.5`, its guidance and selector entry move to the next minor
line instead of silently changing the `0.5` contract.

[checksums-032]: https://github.com/hector-ae21/octoform/releases/download/v0.3.2/SHA256SUMS
[checksums-050]: https://github.com/hector-ae21/octoform/releases/download/v0.5.0/SHA256SUMS
[release-050]: https://github.com/hector-ae21/octoform/releases/tag/v0.5.0
[release-030]: https://github.com/hector-ae21/octoform/releases/tag/v0.3.0
[release-031]: https://github.com/hector-ae21/octoform/releases/tag/v0.3.1
[release-032]: https://github.com/hector-ae21/octoform/releases/tag/v0.3.2
