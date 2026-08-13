---
title: Authenticate safely
description: Choose the narrowest suitable GitHub credential and keep it out of configuration, output, and repository history.
---

# Authenticate safely

Octoform reads GitHub state before it plans anything. The credential determines
which repositories are visible, which settings can be observed, and which
operations GitHub reports as available.

## Choose the credential

| Context | Preferred credential | Why |
| --- | --- | --- |
| First interactive plan | Fine-grained personal access token | Repository selection and permissions can be kept narrow |
| Organization automation | GitHub App installation token | Short-lived token with installation-scoped access |
| GitHub Actions | Installation token or deliberately scoped workflow token | Avoids a long-lived user credential |
| Local use with GitHub CLI | Existing `gh` credential, when its access is appropriate | Octoform can fall back to `GH_TOKEN` |

Start with repository read access. Add write permissions only after a plan
shows an operation you intend to apply and the relevant reference page names
the required permission.

## Expose the token to the process

Octoform reads `GITHUB_TOKEN`, then `GH_TOKEN`.

=== "macOS and Linux"

    ```bash
    export GITHUB_TOKEN="your-token"
    ```

=== "PowerShell"

    ```powershell
    $env:GITHUB_TOKEN = "your-token"
    ```

Do not place a token in `octoform.yml`, a committed workflow, an example,
command history, an issue, or copied plan output.

## Understand incomplete evidence

A token can discover a repository but still lack permission to read one of its
settings. Octoform treats that value as unreadable and blocks any dependent
mutation. It does not interpret a failed read as a disabled feature.

Likewise, commercial availability is detected from GitHub evidence for the
owner, repository visibility, operation, and current credential. Product-plan
names are not a substitute for that evidence.

## Remove the interactive token

When the session is finished, clear the variable from that shell.

=== "macOS and Linux"

    ```bash
    unset GITHUB_TOKEN
    ```

=== "PowerShell"

    ```powershell
    Remove-Item Env:GITHUB_TOKEN
    ```

## Next step

[Write a deliberately small policy](first-policy.md).
