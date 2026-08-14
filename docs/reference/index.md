---
title: Reference
description: Audited behavior, public programmatic exports, and GitHub API coverage for Octoform 0.3.1.
---

# Reference

Reference pages describe the exact `@hector21/octoform@0.3.1` package. Guides
explain how to operate it; this section records the contract and its evidence.

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
repository observation, output, and error handling. Generated TypeDoc coverage
for these supported exports will be added alongside the application package's
release artifacts.

## Compatibility notes

- Runtime: Node.js `20` or newer.
- Package format: ESM.
- Machine-readable CLI output: not available in `0.3.1`.
- REST API version header: not explicitly set by `0.3.1`.
- GraphQL transport: not used by `0.3.1`.
- Documentation version: `0.3`; exact verified application patch: `0.3.1`.
