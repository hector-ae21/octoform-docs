---
title: Audit-only example
description: Inspect repository metadata without declaring mutable desired state.
---

# Audit only

This configuration defines compliance checks but no `defaults`, `types`, or
repository overrides. It is suitable when visibility should precede policy
enforcement.

## Configuration

<div class="octoform-example" markdown>

```yaml title="octoform.yml"
--8<-- "docs/examples/files/audit-only/octoform.yml"
```

[:material-download:](files/audit-only/octoform.yml){ .octoform-example-download download="octoform.yml" aria-label="Download the audit-only policy YAML" title="Download YAML" }

</div>

## What it reports

- Public repositories without a description.
- Public repositories without topics.
- Repositories with more than 20 topics.
- No missing type finding, because `require_type` is explicitly disabled.

Run `octoform audit --config octoform.yml`. The audit command observes and
reports; it does not build an apply queue. Because this file also declares no
desired policy, invoking `apply` cannot infer mutations from the audit rules.

## When to use it

Use this shape to establish a fleet baseline, introduce scheduled reporting,
or discover metadata debt before deciding which settings Octoform should own.
