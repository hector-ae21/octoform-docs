---
title: Multi-owner example
description: Govern an organization and a personal account from one reviewed Octoform document without repeating the shared policy.
---

# Multi-owner

One document, two accounts, and the shared policy written once. This is the
shape the 0.4 line introduced, and the reason the rest of the release exists.

<div class="octoform-example" markdown>

```yaml title="octoform.yml"
--8<-- "docs/examples/files/multi-owner/octoform.yml"
```

[:material-download: Download YAML](files/multi-owner/octoform.yml){ .octoform-example-download download="octoform.yml" aria-label="Download the multi-owner YAML" }

</div>

## What is shared and what is not

`defaults` and `policies` sit at the root, so both accounts see them. Each
account's own block states only what is true of that account: the organization
classifies repositories and applies the named policy to a type, the personal
account applies the same named policy to one repository by name.

An account block is not a copy of the document. It is a selection within it,
and reading one top to bottom still tells the whole story for that account —
a referenced policy never overrides a key the referencing layer states itself.

## Running it

```console
octoform plan --config octoform.yml --owner example-org
octoform plan --config octoform.yml
```

Without `--owner`, both accounts run, one at a time, in declaration order.
Their reports never interleave. A failure in one does not stop the other
unless you pass `--fail-fast`, and the run's exit class is the most severe any
account produced.

A `--repo` name that exists under both accounts is rejected rather than
guessed at, and the error lists the qualified forms that would resolve it:

```console
octoform plan --config octoform.yml --repo example-org/example-service
```

## Before the first run against a new account

```console
octoform inspect capabilities --config octoform.yml
```

This reports each account's kind, its numeric identity, whether
organization-wide rulesets are available, and any declaration that does not
apply to that kind of account. The personal account here declares nothing
organization-only, but the check is what proves it rather than assumes it.

## Migrating an existing single-owner file

A file that names its account in a root `owner` field keeps its exact meaning
and produces the same plans. Nothing has to change. When you want this shape:

```console
octoform config migrate --config octoform.yml
octoform config migrate --config octoform.yml --write
```

It previews by default, preserves comments and ordering, and refuses `--write`
when the file has uncommitted changes, so the conversion is always reviewable
as a diff. See [`octoform config`](../commands/config.md).
