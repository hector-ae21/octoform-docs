---
title: octoform config
description: Validate a configuration offline, and convert a single-owner file to the multi-owner shape.
---

# `octoform config`

Both subcommands are offline. They read files, resolve them, and print what
they found. Neither contacts GitHub, and neither needs a token.

```console
octoform config validate --config octoform.yml
octoform config migrate  --config octoform.yml
octoform config migrate  --config octoform.yml --write
```

## `config validate`

Loads the configuration exactly as a GitHub-facing command would — following
imports, folding in named policies, applying precedence — and reports what
resolved, or the first error and where it is.

```text
octoform.yml is valid (configuration contract version 1).

2 owner(s):
  example-org       (3 type(s), 4 repo entry/entries declared)
  example-personal  (0 type(s), 1 repo entry/entries declared)
```

It is the fastest check in a pull request, because it needs no credentials and
no network. Every error it reports names the file and the YAML path: an
unknown key with the closest declared one, a value of the wrong kind, an
import or policy cycle with the chain that produced it, a policy reference
that was never declared, a value shaped like a credential, and a declared
owner that is not a GitHub account login.

That last check matters more than it looks. Every declared owner is asked of
the API by login, so one carrying a path separator, a control character, a
leading or trailing hyphen, or a homoglyph that merely looks like the account
you meant is caught here, with the reason, instead of returning an opaque
`404` several requests into a run.

Exit `0` when the configuration is valid, `2` when it is not.

## `config migrate`

Converts a single-owner file, where the account is named in a root `owner`
field, into the multi-owner shape, where accounts are keyed under `owners`.
The result is equivalent: the same repositories resolve to the same policy.

By default it previews, printing the converted document without touching
anything:

```console
octoform config migrate --config octoform.yml
```

`--write` updates the file in place. Comments, ordering, and formatting are
preserved — the conversion moves blocks, it does not re-serialize the
document. Because it rewrites a file you are expected to keep under version
control, it refuses to run when that file has uncommitted changes in a git
working tree, so the conversion is always reviewable as a diff.

A file that already declares `owners` needs no migration and is reported as
such.

Migration is optional. A single-owner file keeps its exact meaning in this
release and produces the same plans; see
[document composition](../configuration/document-composition.md).
