---
title: Reference
description: Audited behavior, public programmatic exports, and GitHub API coverage for Octoform 0.4.
---

# Reference

Reference pages describe the Octoform `0.4` contract. Guides explain how to
operate it; this section records the contract, patch availability, and
evidence.

## Product contract

<div class="octoform-grid" markdown>

<div class="octoform-card octoform-card--linked" markdown>

### Configuration

Every accepted field, precedence rule, observation boundary, plan result,
endpoint mapping, recovery path, and unsupported case.

[Browse configuration](../configuration/index.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

### Command line

Read/write boundaries, options, selection, confirmation, output, partial
failure, authentication, and exit codes.

[Browse CLI commands](../commands/index.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

### Audited evidence

Published package contents, confirmed implementation behavior, permissions,
limitations, and the reviewed GitHub API disposition register.

[Open the 0.3.1 baseline](v0.3.1-baseline.md)

</div>

</div>

The [GitHub API surface register](github-api-surface.md) records relevant REST
and GraphQL operations. Its [machine-readable source](github-api-surface.json)
contains the complete generated operation data.

## Programmatic API

The package root exports the same building blocks used by the CLI:

| Area | Exports |
| --- | --- |
| Configuration | `loadConfig`, `resolvePolicy`, `repoType`, `isExcluded`, `isManaged`, `ConfigError` |
| GitHub observation | `createClient`, `listRepos`, `getRepoDetail`, `readRepoFile`, capability helpers |
| Planning | `planRepo`, `plan` |
| Classification | `classifyRepo`, `pathsUsedBy`, `classify` |
| Apply | `applyRepoChanges`, `apply`, `propertiesSync` |
| Reporting | `formatChange`, `groupByRepo`, `audit` |
| Types | Configuration, policy, repository state, change, resource, and owner-kind types |

Prefer the CLI unless an integration already owns authentication, complete
repository observation, output, and error handling. The latest verified `0.4`
patch publishes the deterministic [TypeDoc JSON reference][typedoc] and
checksummed configuration, CLI, capability, permission, and API manifests.

## Compatibility notes

- Runtime: Node.js `20` or newer.
- Package format: ESM.
- Machine-readable CLI output: `--format json` on `plan`, `inspect config`,
  and `inspect capabilities`. The remaining commands are text-only.
- Exit codes: six frozen classes, documented in the
  [execution contract](../commands/execution-contract.md#exit-codes).
- REST API version header: pinned and sent on every request.
- GraphQL transport: not used by `0.4`.
- Documentation line: `0.4`; latest verified application patch: `0.4.0`.

`0.4.0` keeps every existing configuration file working: the same document
produces the same plans it did on `0.3.x`. Two contracts did change. `audit`
and `apply` now follow the frozen exit-code classes, so `audit` exits `1` when
it reports findings rather than `0`; and programmatic callers see a resolved
configuration holding one scope per owner, a `planRepo` that takes the account
as its first argument, and `PlanOptions.rulesetCapability` in place of
`rulesetsEnforcedOnPrivate`.

The [0.3.1 behavior baseline](v0.3.1-baseline.md) remains the audited
implementation evidence for the `0.3` line, which stays published. Consult the
[changelog](../releases/changelog.md) for patch-level availability.

[typedoc]: https://github.com/hector-ae21/octoform/releases/download/v0.4.0/api.json
