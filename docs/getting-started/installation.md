---
title: Install Octoform
description: Pin Octoform 0.3.1, choose an invocation model, and verify the executable before connecting to GitHub.
---

# Install Octoform

Use the exact Octoform release shown by the documentation selector. Pinning the
patch keeps commands, configuration fields, permissions, and limitations
aligned with the instructions you are reading.

## Check the runtime

```console
node --version
npm --version
```

Octoform `0.3.1` requires Node.js 20 or newer. Use a supported Node.js release
in local development and automation.

## Choose an invocation model

=== "Run without installing globally"

    Use this for evaluation, CI jobs, and occasional administration:

    ```console
    npx --yes @hector21/octoform@0.3.1 --help
    ```

=== "Install in a project"

    Use this when a repository owns its governance automation and lockfile:

    ```console
    npm install --save-dev --save-exact @hector21/octoform@0.3.1
    npx octoform --help
    ```

=== "Install globally"

    Use this for an administrator-controlled workstation where global package
    updates are deliberate:

    ```console
    npm install --global @hector21/octoform@0.3.1
    octoform --help
    ```

## Verify what will run

The help output must list `audit`, `plan`, `apply`, `classify`, and
`properties sync`. If a shell resolves a different installation, inspect the
executable path or use the fully pinned `npx` form.

!!! note "Documentation releases are separate"

    The Git tag of this documentation repository may have a later editorial
    patch. The selector and commands on this site remain tied to Octoform
    `0.3.1` until the npm dependency changes.

## Next step

[Choose and expose a GitHub credential](authentication.md).
