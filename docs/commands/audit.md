---
title: octoform audit
description: Inventory repositories and report read-only compliance findings with Octoform 0.4.
---

# `octoform audit`

`audit` inventories repositories and evaluates the root
[`audit`](../configuration/classification-and-audit.md#audit) expectations.
It never changes GitHub state.

```console
octoform audit --config octoform.yml
```

## Reads

- Repositories visible for the configured owner and token.
- Repository name, visibility, archived state, description, and topics.
- Resolved type, including organization custom-property values when available.

It does not gather every detailed setting required by `plan`; audit remains a
lighter inventory operation.

## Output

The report lists discovered repositories, exclusions, owner context, and
findings such as missing descriptions, topics, or types. Archived repositories
produce no findings.

`audit` exits `1` when it reports findings and `0` when it reports none, so a
scheduled job fails on drift without having to interpret its output. This
changed in `0.4`: on the `0.3` line, findings still exited `0`. A pipeline
that treats drift as informational should test for the exact code rather than
for success.

`audit` has no `--format json` in this release. A gate that needs structured
detail rather than a pass or fail should use [`plan --format json`](plan.md)
instead.

## Permissions and failure

The command requires a token accepted for repository reads. Authentication,
invalid configuration, and GitHub API failures exit `1`. A missing token never
falls back to credentials embedded in configuration because token fields are
not accepted.

Use the [scheduled-audit example](../examples/scheduled-audit.md) and
[CI/CD guide](../automation/index.md) for a read-only automation boundary.
