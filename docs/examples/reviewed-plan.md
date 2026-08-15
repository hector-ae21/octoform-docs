---
title: Reviewed-plan example
description: Separate the approval of an Octoform change from its execution using a saved plan that refuses to drift.
---

# Reviewed plan

The person who approves a change and the process that carries it out need not
be the same. This example is written for that split.

<div class="octoform-example" markdown>

```yaml title="octoform.yml"
--8<-- "docs/examples/files/reviewed-plan/octoform.yml"
```

[:material-download: Download YAML](files/reviewed-plan/octoform.yml){ .octoform-example-download download="octoform.yml" aria-label="Download the reviewed-plan YAML" }

</div>

## The two commands

```console
octoform plan  --config octoform.yml --repo example-service --out plan.json --expires-in 30
octoform apply --plan plan.json
```

The first can run with read-only credentials. The second needs write access,
and performs exactly the operations the file records — it does not re-plan and
does not re-observe.

## What the second command checks first

Before it touches anything it re-checks six things, and refuses naming which
one failed if any of them moved:

| Check | A failure means |
| --- | --- |
| Artifact schema version | The file came from an incompatible release |
| Expiry | The observation behind the plan is too old to act on |
| Authenticated actor | A different identity is applying than planned |
| Account numeric identity | The account was renamed or replaced |
| Configuration source digests | A contributing file changed after review |
| Resolved configuration digest | The document now means something different |

A stale plan is never silently repaired and never quietly re-planned into
something else. The remedy is always to plan again, review the new plan, and
hand over the new artifact.

!!! warning "Treat the artifact like the configuration"

    It carries no credential, but it does name private repositories and their
    settings. It is not a build-log attachment.

## Why the settings here are worth reviewing

A saved plan is only useful if someone actually reads it. This configuration
declares a ruleset with required approvals, required checks, and force-push
blocking on the default branch — the kind of change where a reviewer will want
to see the exact current and desired values before anyone applies it.

The expiry is deliberately short. Thirty minutes is enough for a review and
short enough that an unattended artifact stops being applicable.

## In automation

This is the shape to prefer when a workflow applies changes. The approval that
`apply`'s interactive prompt would have represented becomes the review of the
plan artifact, and `--yes` no longer stands in for a review that never
happened. See the [automation guide](../automation/index.md).
