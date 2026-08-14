---
title: Install Octoform
description: Install a verified Octoform 0.3 patch and confirm the executable before connecting to GitHub.
---

# Install Octoform

Choose the `MAJOR.MINOR` documentation line that matches the package, then pin
an exact patch. This page currently verifies `0.3.2`; the
[changelog](../releases/changelog.md) identifies when patch-specific guidance
begins to apply.

## Check the runtime

```console
node --version
npm --version
```

Octoform `0.3` requires Node.js 20 or newer. Use a supported Node.js release
in local development and automation.

## Choose an invocation model

=== "Run without installing globally"

    Use this for evaluation, CI jobs, and occasional administration:

    ```console
    npx --yes @hector21/octoform@0.3.2 --help
    ```

=== "Install in a project"

    Use this when a repository owns its governance automation and lockfile:

    ```console
    npm install --save-dev --save-exact @hector21/octoform@0.3.2
    npx octoform --help
    ```

=== "Install globally"

    Use this for an administrator-controlled workstation where global package
    updates are deliberate:

    ```console
    npm install --global @hector21/octoform@0.3.2
    octoform --help
    ```

## Verify what will run

The help output must list `audit`, `plan`, `apply`, `classify`, and
`properties sync`. If a shell resolves a different installation, inspect the
executable path or use the fully pinned `npx` form.

!!! note "Documentation and package versions"

    The Git tag of this documentation repository may have a later editorial
    patch. The selector remains `0.3` for every compatible `0.3.x` package;
    executable examples use the exact patch validated by the current
    publication.

## Next step

[Choose and expose a GitHub credential](authentication.md).
