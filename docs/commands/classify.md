---
title: octoform classify
description: Propose and optionally persist missing repository types with Octoform 0.3.1.
---

# `octoform classify`

`classify` evaluates repositories without a recorded type against ordered
[`classify.rules`](../configuration/classification-and-audit.md#classifyrules).

```console
octoform classify --config octoform.yml
octoform classify --config octoform.yml --apply
```

## Read-only proposal

Without `--apply`, the command reads repository metadata and any files named by
classification conditions, prints the first matching type, and writes nothing.
Repositories that already have a type are not re-evaluated. Unmatched
repositories remain unchanged.

This mode works for organization and personal owners. For a personal account,
the proposals can be copied into `repos.<name>.type` because there is no
organization custom property in which to store them.

## Persist proposals

`--apply` writes proposed types to the organization custom property named by
`classify.property`. It groups repositories by type to reduce API operations.
The mode requires an organization, a configured property name, and write
permission. It exits `1` on a personal account instead of pretending to save
the proposals.

Run [`properties sync`](properties-sync.md) first for a new organization so
the property and its allowed type values exist.

## Boundary

Classification fills missing values. It does not reconcile an existing type
with current rules and does not cause `plan` or `apply` to persist inferred
types automatically. Change an existing type explicitly when the recorded
decision should be revised.
