---
title: Get started
description: Install Octoform 0.3.1, authenticate safely, validate a policy, and produce a first read-only plan.
---

# Get started

This path takes you from a clean environment to a reviewed, read-only plan. It
does not change a repository.

## What you need

| Requirement | Minimum | Why it is needed |
| --- | --- | --- |
| Node.js | `20` | Octoform is an ESM command-line package |
| GitHub identity | Personal account or organization | Becomes the policy `owner` |
| GitHub token | Repository read access | Discovers repositories and observed settings |
| Local file | `octoform.yml` | Declares only the state you intend to manage |

Use a fine-grained personal access token for an interactive first run. For
automation, prefer a short-lived GitHub App installation token with access
limited to the repositories and permissions your policy requires.

## Install the exact release

=== "Run without a global installation"

    ```console
    npx --yes @hector21/octoform@0.3.1 --help
    ```

=== "Install globally"

    ```console
    npm install --global @hector21/octoform@0.3.1
    octoform --help
    ```

Pinning the patch makes the command behavior match this documentation. Review
the [release page](../releases/index.md) before upgrading.

## Provide the token

=== "macOS and Linux"

    ```bash
    export GITHUB_TOKEN="your-token"
    ```

=== "PowerShell"

    ```powershell
    $env:GITHUB_TOKEN = "your-token"
    ```

Octoform reads `GITHUB_TOKEN`, then `GH_TOKEN`. Do not place a token in
`octoform.yml`, a committed workflow, an example, command history, or issue.

## Create a deliberately small policy

```yaml title="octoform.yml"
owner: your-account

defaults:
  merge:
    delete_branch_on_merge: true
```

Replace `your-account` with the login that owns the repositories. Octoform
asks GitHub whether the login is a personal account or organization; the file
does not declare that distinction.

The policy manages one value. Every omitted setting remains unmanaged.

## Produce the first plan

```console
octoform plan --config octoform.yml
```

A successful plan exits `0` and ends by stating that nothing was changed. It
may contain:

- changes, showing observed and desired values;
- blocked changes, with the evidence Octoform could not obtain or use;
- warnings, where an available change has a known consequence;
- no changes, when the declared state already matches GitHub.

!!! warning "Do not treat a blocked change as completed"

    A block means Octoform cannot prove that operation safe or available for
    the owner, repository, visibility, and token involved. Adjust permissions
    or policy, then plan again.

## Narrow the review

Use a repository selector when evaluating a new policy:

```console
octoform plan --config octoform.yml --repo sample-repository
```

If you use repository types, you can instead select one type:

```console
octoform plan --config octoform.yml --type library
```

## Apply only after review

```console
octoform apply --config octoform.yml --repo sample-repository
```

`apply` presents its plan and asks for confirmation. Answering anything other
than `y` declines the operation and exits `1` without mutation. The `--yes`
option is intended for an already protected automation path, not a first run.

## Verify and recover

Run the same plan again. An idempotent result reports no remaining changes.
If an operation failed, Octoform reports the affected change and GitHub error;
successful independent operations are not rolled back. Correct the cause and
plan again before retrying.

Next:

- understand [tri-state policy and precedence](../concepts/index.md);
- review the [complete configuration reference](../configuration/index.md);
- learn the [plan and apply operating procedure](../guides/plan-and-apply.md);
- choose a [validated example](../examples/index.md).
