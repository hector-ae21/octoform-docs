---
title: Personal-account example
description: Govern personal repositories with local classification and repository-level rulesets.
---

# Personal account

Octoform determines the owner kind from GitHub rather than from a configuration
flag. This example therefore uses features that remain meaningful for a
personal account and avoids organization custom properties.

## Configuration

<div class="octoform-example" markdown>

```yaml title="octoform.yml"
--8<-- "docs/examples/files/personal-account/octoform.yml"
```

[:material-download: Download YAML](files/personal-account/octoform.yml){ .octoform-example-download download="octoform.yml" aria-label="Download the personal-account policy YAML" }

</div>

## How selection works

- When the token belongs to `your-username`, authenticated discovery can
  include private repositories that the credential may inspect.
- When the configured owner is another person, GitHub discovery exposes only
  that person's public repositories.
- `package.json` and `Cargo.toml` provide local classification evidence.
- The `npm-package` policy adds a repository-level ruleset; availability is
  decided from owner kind, visibility, permissions, and GitHub responses.

## Review before apply

Check the planned repository set first. In particular, verify private
repository visibility, the inferred project type, and whether enabling
vulnerability alerts or changing merge behavior matches each repository's
operating model.
