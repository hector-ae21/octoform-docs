---
title: Authentication and exit codes
description: Understand Octoform 0.3 credentials, failure categories, exit codes, and programmatic use.
---

# Authentication and exit codes

The CLI reads a token from `GITHUB_TOKEN` or `GH_TOKEN`. Configuration has no
credential field, and command output should be treated as potentially
sensitive repository information even when the token is not printed.

## Token behavior

Classic tokens report scopes through response headers. Octoform checks for
`repo` and, for organization custom-property writes, `admin:org`. A missing
reported scope fails early with a remediation message.

Fine-grained tokens do not report classic scope headers. Their absence is
treated as unknown rather than missing; GitHub endpoint responses remain the
authority for permitted repositories and operations.

Repository rulesets and administrative settings require suitable repository
administration permission. Capability checks do not grant permission and do
not infer authorization from a commercial plan name.

## Exit codes

| Code | Contract |
| --- | --- |
| `0` | Command completed. For `audit`, findings still count as success. For `plan`, blocked changes can still be present. |
| `1` | Configuration, authentication, API, declined confirmation, unsupported owner operation, or apply failure. |
| `2` | Invalid command line: unknown command or option, missing option value, or invalid subcommand. |

`--help` exits `0`; invoking the CLI without a command prints usage and exits
`2`.

## Automation considerations

- Use `audit` or `plan` for pull requests and scheduled observation.
- Protect any `apply --yes` job with reviewed input, environment approval, and
  minimum token permissions.
- Capture output as operational evidence but redact repository details before
  sharing logs outside their intended audience.
- Do not treat human-formatted output as a stable JSON contract.

## Programmatic API

The package root exports configuration, observation, planning, classification,
apply, and reporting building blocks used by the CLI. Prefer the CLI unless an
integration owns authentication, complete observation, confirmation, result
formatting, and error handling. See the [reference overview](../reference/index.md#programmatic-api)
for the exported surface.
