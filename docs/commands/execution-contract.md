---
title: Authentication and exit codes
description: Understand Octoform 0.4 credentials, failure categories, frozen exit codes, JSON output, and programmatic use.
---

# Authentication and exit codes

Command output should be treated as potentially sensitive repository
information even though no token is ever printed.

## Where a token comes from

Octoform searches exactly three places, in this order, and nothing else:

1. a token passed by a programmatic caller, either directly or through a token
   provider function;
2. `GITHUB_TOKEN`;
3. `GH_TOKEN`.

Configuration has no credential field, and a secret is never accepted as a
command-line flag: process arguments are readable by other processes on the
same machine.

A configuration value shaped like an issued GitHub token — `ghp_`, `gho_`,
`ghu_`, `ghs_`, `ghr_`, or `github_pat_` — is rejected when the file loads.
The error names the YAML path and never repeats the value, so it is safe to
paste into a bug report. Mapping keys are checked too: a token pasted where a
login or a repository name belongs is reported against its parent.

## Token behavior

Classic tokens report scopes through response headers. Octoform checks for
`repo` and, for organization custom-property writes, `admin:org`. A missing
reported scope fails early with a remediation message.

Fine-grained tokens do not report classic scope headers. Their absence is
treated as unknown rather than missing; GitHub endpoint responses remain the
authority for permitted repositories and operations.

Repository rulesets and administrative settings require suitable repository
administration permission. Capability checks do not grant permission and do
not infer authorization from a commercial plan name. Use
[`inspect capabilities`](inspect.md) to see what a token and account actually
support, with the evidence behind each answer.

## Exit codes

These classes are frozen for the whole `v0` line. A script may branch on them.

| Code | Contract |
| --- | --- |
| `0` | Success. Nothing needed changing, or everything requested was applied. |
| `1` | Drift found and not applied. `audit` reported findings, `plan` found executable changes, or `apply` was declined at the confirmation prompt. |
| `2` | Usage or configuration error: unknown command or option, missing option value, invalid subcommand, an undeclared `--owner`, or a configuration that does not load. Also a saved plan that failed verification. |
| `3` | Authentication or permission failure, including a missing token and a `401` or `403` from GitHub. |
| `4` | One or more operations were blocked. Nothing that was blocked was attempted. |
| `5` | One or more operations failed, or the run itself failed. |

`--help` exits `0`; invoking the CLI without a command prints usage and exits
`2`. When a run reaches several accounts, its exit code is the most severe
class any of them produced.

Stable per-reason diagnostic codes for individual blocked changes and warnings
are not part of this release. A blocked change carries a human-readable
reason, not a code, so match on the exit class rather than on that text.

## JSON output

`plan`, `inspect config`, and `inspect capabilities` accept
`--format json`. Output is wrapped in an envelope with its own schema version,
independent of the package version:

```json
{ "schemaVersion": 1, "command": "plan", "data": {} }
```

Adding a field is a compatible change. Removing or repurposing one increments
`schemaVersion`. The envelope never contains a token, an authorization header,
or private file content.

`audit`, `apply`, `classify`, and `properties sync` remain text-only in this
release.

## Reading terminal output safely

Repository names, descriptions, topics, and custom-property values are
writable by anyone with access to the account being audited, which is not
always the person running Octoform. Control characters in any of those are
escaped before they are printed, so a crafted value cannot emit escape
sequences that rewrite lines already on screen, hide a blocked change, or
imitate the confirmation prompt.

## Automation considerations

- Use `audit` or `plan` for pull requests and scheduled observation.
- Protect any `apply --yes` job with reviewed input, environment approval, and
  minimum token permissions. Prefer `plan --out` in the reviewing job and
  `apply --plan` in the protected one, so the job that mutates applies exactly
  what was reviewed.
- Capture output as operational evidence but redact repository details before
  sharing logs outside their intended audience.
- Do not treat human-formatted text output as a stable machine contract. Use
  `--format json` where it is available.

## Programmatic API

The package root exports configuration, observation, planning, classification,
apply, and reporting building blocks used by the CLI. Prefer the CLI unless an
integration owns authentication, complete observation, confirmation, result
formatting, and error handling. See the
[reference overview](../reference/index.md#programmatic-api) for the exported
surface.
