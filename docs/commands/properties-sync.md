---
title: octoform properties sync
description: Synchronize the organization custom property used for repository types.
---

# `octoform properties sync`

`properties sync` creates or updates the organization custom property named by
`classify.property` and records explicit `repos.<name>.type` values.

```console
octoform properties sync --config octoform.yml
```

## Desired schema

The allowed property values are exactly the keys under `types`. Keeping one
source prevents a separately declared allowed-value list from diverging from
the policies those values select.

```yaml
classify:
  property: project-type

types:
  application: {}
  library: {}

repos:
  octoform:
    type: application
```

## Writes and idempotence

The command writes only schema or value differences, so a second run against
matching state is a no-op. It operates on organization custom properties and
is unavailable for personal accounts.

Use it before `classify --apply` on a new organization. Review removal or
renaming of a type carefully: changing allowed values can affect repositories
whose current property value is no longer represented.

## Recovery

Restore the prior type keys and explicit assignments, then run the command
again. Octoform does not retain schema history, so retrieve former values from
version control and GitHub audit records.
