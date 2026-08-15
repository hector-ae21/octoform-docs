---
title: Changelog
description: Review Octoform 0.4 changes by exact package patch and identify when guidance becomes applicable.
---

# Changelog

The documentation selector remains `0.4` for compatible `0.4.x` packages.
Entries below identify the exact patch that introduced each change. A page
marked **Available since 0.4.1** would apply to `0.4.1` and every later
`0.4.x` patch, but not to `0.4.0`.

Earlier lines keep their own published documentation; the `0.3` entries below
remain here as the patch index for that line.

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
compatible within `0.3`, its guidance and selector entry move to the next minor
line instead of silently changing the `0.3` contract.

[checksums-032]: https://github.com/hector-ae21/octoform/releases/download/v0.3.2/SHA256SUMS
[release-030]: https://github.com/hector-ae21/octoform/releases/tag/v0.3.0
[release-031]: https://github.com/hector-ae21/octoform/releases/tag/v0.3.1
[release-032]: https://github.com/hector-ae21/octoform/releases/tag/v0.3.2
