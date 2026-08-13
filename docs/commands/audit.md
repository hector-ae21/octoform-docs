---
title: octoform audit
description: Inventory repositories and report read-only compliance findings with Octoform 0.3.1.
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

Findings are information, not command failure. `audit` exits `0` whether it
finds zero or many findings. A pipeline that needs a compliance gate must
interpret captured output itself; `0.3.1` has no machine-readable result mode.

## Permissions and failure

The command requires a token accepted for repository reads. Authentication,
invalid configuration, and GitHub API failures exit `1`. A missing token never
falls back to credentials embedded in configuration because token fields are
not accepted.

Use the [scheduled-audit example](../examples/scheduled-audit.md) and
[CI/CD guide](../automation/index.md) for a read-only automation boundary.
