---
title: Get started
description: Install Octoform, authenticate safely, and produce a first read-only plan.
---

# Get started

This path installs Octoform, authenticates it for the repositories you intend to
inspect, and produces a read-only plan. No repository is changed.

## Prerequisites

- Node.js 20 or newer
- a GitHub token that can read the target repositories
- a personal account or organization login to use as `owner`

Prefer a fine-grained personal access token or GitHub App installation token
with access limited to the repositories and permissions required by your policy.

## Install

```console
npm install --global @hector21/octoform
octoform --help
```

## Authenticate

=== "macOS and Linux"

    ```bash
    export GITHUB_TOKEN="your-token"
    ```

=== "PowerShell"

    ```powershell
    $env:GITHUB_TOKEN = "your-token"
    ```

Do not write the token into `octoform.yml`, shell history, examples, logs, or a
committed workflow. In GitHub Actions, provide it through the workflow's
permission-scoped token or an approved secret source.

## Create the policy

```yaml title="octoform.yml"
owner: your-account

defaults:
  features:
    wiki: false
```

An omitted key is unmanaged. The example asks Octoform to disable wikis and
makes no claim about any other repository setting.

## Review a plan

```console
octoform plan --config octoform.yml
```

Read blocked and unsupported results as evidence, not skipped work. Octoform
does not guess that an unreadable setting is safe to overwrite.

!!! tip "Keep the first run read-only"

    Confirm owner selection, repository scope, token permissions, and planned
    values before using `octoform apply`.
