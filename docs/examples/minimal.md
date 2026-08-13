---
title: Minimal policy example
description: Download the smallest Octoform configuration that produces a mutable plan.
---

# Minimal policy

This policy manages one explicit merge setting for every repository selected
under the owner. Everything else remains unmanaged.

## Configuration

<div class="octoform-example" markdown>

```yaml title="octoform.yml"
--8<-- "docs/examples/files/minimal/octoform.yml"
```

[:material-download:](files/minimal/octoform.yml){ .octoform-example-download download="octoform.yml" aria-label="Download the minimal policy YAML" title="Download YAML" }

</div>

## Adapt and review

1. Replace `org-name` with an organization or personal account the token can
   inspect.
2. Run `octoform plan --config octoform.yml`.
3. Confirm that every listed repository should delete its source branch after
   a pull request is merged.

Omitting another setting does not reset it. Octoform manages only
`merge.delete_branch_on_merge` in this example.

## Expected plan

Repositories already configured with automatic branch deletion produce no
change. Other selected repositories produce one proposed update. If Octoform
cannot read the current setting or prove the mutation is available, it reports
a blocked operation instead of guessing.
