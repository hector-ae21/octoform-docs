---
title: Reference
description: Audited behavior, public programmatic exports, and GitHub API coverage for Octoform 0.5.
---

# Reference

Reference pages describe the Octoform `0.5` contract. Guides explain how to
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
| Configuration | `loadConfig`, `resolvePolicy`, `repoType`, `isManaged`, `UNREADABLE` |
| Observation | `createClient`, `listRepos`, `getRepoDetail`, `readRepoFile` |
| Organization | `getOrganizationDetail`, `readTeams`, `readOrganizationPeople` |
| Planning | `planRepo`, `planOrganization`, `plan`, `summarizePlan` |
| Classification | `classifyRepo`, `pathsUsedBy`, `classify` |
| Apply | `applyRepoChanges`, `applyOrganizationChanges`, `propertiesSync` |
| Membership | `inviteMember`, `removeMember`, `convertMember` |
| Inspection | `inspectConfig`, `inspectCapabilities`, `inspectMembers` |
| Saved plans | `buildPlanArtifact`, `readPlanArtifact`, `verifyPlanArtifact` |
| Reporting | `formatChange`, `groupByRepo`, `printable`, `audit` |
| Types | Configuration, organization, repository, change and owner-kind types |

That table names the entry point of each area rather than every export. The
[TypeDoc JSON reference][typedoc] published with each release is the complete
list.

Prefer the CLI unless an integration already owns authentication, complete
repository observation, output, and error handling. The latest verified `0.5`
patch publishes that reference and checksummed configuration, CLI, capability,
permission, and API manifests.

## Compatibility notes

- Runtime: Node.js `20` or newer.
- Package format: ESM.
- Machine-readable CLI output: `--format json` on `plan`, `inspect config`,
  `inspect capabilities`, and `inspect members`. The remaining commands are
  text-only.
- Exit codes: six frozen classes, documented in the
  [execution contract](../commands/execution-contract.md#exit-codes).
- REST API version header: pinned and sent on every request.
- GraphQL transport: used for four repository settings only, and requested only
  when a policy manages one of them.
- Documentation line: `0.5`; latest verified application patch: `0.5.0`.

## What changed in `0.5.0`

Every existing configuration file keeps working and produces the plans it
produced on `0.4.x` — with the exception described under
[fixed behaviour](#fixed-behaviour).

Two exported shapes moved, which is what makes this a minor bump rather than a
patch:

- **`Change.repo` is optional.** A change to the account itself has no
  repository to name, and inventing one would make it group and count as
  though it did. Programmatic callers that read `change.repo` as a string have
  to handle its absence.
- **`planOrganization`, `setPropertyValues` and `putPropertySchema` take
  different arguments.** The first now receives the organization as it stands
  rather than only its settings; the other two take a list of repositories and
  a body built by the caller, because a definition has to be read before it is
  written.

`Change` also gained the operation kinds `attach`, `detach` and `delete`, the
risk level `destructive`, and `prerequisites`. Adding an enum member is a
compatible change; a caller that exhaustively switched on the old sets is the
case to check.

### Fixed behaviour

Three fixes change what a run does to a configuration you have not edited. Each
is a correction, and each is worth knowing before the first `0.5` apply:

- **Ruleset updates no longer delete the rules Octoform does not model, or the
  ones the policy does not mention.** Rules lost to an earlier release are not
  restored automatically; declare them, or re-add them in GitHub.
- **An undeclared ruleset key is no longer treated as a demand for GitHub's
  default**, so runs stop offering to strip approvals and protections nobody
  asked about.
- **`properties sync` no longer clears the fields it says nothing about.** On
  earlier releases it reset a property's description, default value and editor
  setting on every run. Check those three fields before assuming the
  definitions are as you left them.

The [0.3.1 behavior baseline](v0.3.1-baseline.md) remains the audited
implementation evidence for the `0.3` line, which stays published. Consult the
[changelog](../releases/changelog.md) for patch-level availability.

[typedoc]: https://github.com/hector-ae21/octoform/releases/download/v0.5.0/api.json
