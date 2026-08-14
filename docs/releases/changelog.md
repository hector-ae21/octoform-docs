---
title: Changelog
description: Review Octoform 0.3 changes by exact package patch and identify when guidance becomes applicable.
---

# Changelog

The documentation selector remains `0.3` for compatible `0.3.x` packages.
Entries below identify the exact patch that introduced each change. A page
marked **Available since 0.3.1** applies to `0.3.1` and every later `0.3.x`
patch, but not to `0.3.0`.

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
