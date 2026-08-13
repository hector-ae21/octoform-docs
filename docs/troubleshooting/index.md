---
title: Troubleshooting
description: Diagnose configuration, authentication, capability, planning, and apply failures in Octoform 0.3.1.
---

# Troubleshooting

Begin with the exit code, then preserve the complete diagnostic and the
affected change. Redact tokens and private repository names before sharing it.

## Fast diagnosis

| Symptom | Likely cause | Next action |
| --- | --- | --- |
| Exit `2` with usage | Unknown command/option or missing option value | Correct the command line |
| Exit `1` before repository output | Invalid configuration, unreadable import, or authentication failure | Validate paths, YAML, owner, and token |
| Missing classic scope message | Classic PAT lacks `repo` or `admin:org` | Refresh only the named scope |
| Blocked current value | GitHub did not expose enough state | Check feature availability and read permission |
| Ruleset blocked on a private repository | Repository/token capability probe was inconclusive or forbidden | Confirm administration access and repository plan capability |
| Environment reviewers blocked | Existing team reviewer cannot be represented by `0.3.1` | Preserve the remote setting or manage it outside this version |
| File creation fails | File appeared after planning or source path is wrong | Re-plan; verify `files[].from` relative to its declaring YAML |
| Branch rename warning | Workflow names the old branch explicitly | Update the workflow trigger before applying rename |
| Apply exits `1` after some successes | Independent endpoint group failed | Run a fresh plan and reconcile the remaining state |

## Configuration cannot be loaded

Check, in order:

1. `--config` points to a readable YAML mapping.
2. The resolved import chain declares exactly one compatible `owner`.
3. Import paths are relative to the file that declares them.
4. Imports contain no cycle.
5. Every `repos.<name>.type` exists under `types` when types are declared.
6. Every `files[].from` exists relative to its declaring file.

## A change is blocked

A block is an expected safety result, not an internal exception. Octoform
distinguishes unsupported, forbidden, and unreadable state when the GitHub
response provides enough evidence. Do not convert an unreadable value into an
assumed `false`.

## Fine-grained token appears to have no scopes

Fine-grained tokens do not expose the classic `x-oauth-scopes` header.
Octoform therefore lets the endpoint decide. A subsequent `403` should be
resolved by granting the smallest repository permission required for that
specific capability, not by replacing the token with an unrestricted classic
PAT.

## Apply was declined

Declining confirmation exits `1` and performs no mutation. This is deliberate;
scripts should not interpret every exit `1` as partial failure without reading
the preceding output.

## Report a reproducible problem

Include the exact Octoform and Node versions, command, exit code, sanitized
configuration fragment, public/fictitious reproduction, and complete redacted
diagnostic. Use private vulnerability reporting for any suspected security
issue or credential exposure.
