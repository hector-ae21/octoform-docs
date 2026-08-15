---
title: Repository files
description: Seed missing repository files without overwriting existing content in Octoform 0.4.
---

# Repository files

File policy copies a reviewed local source only when the target path does not
exist. Octoform `0.4` intentionally has no overwrite or deletion mode.

## `files`

**Shape:** optional list inside any policy layer.

```yaml
files:
  - path: .github/dependabot.yml
    from: files/dependabot/npm.yml
    mode: create-if-missing
```

| Field | Required | Meaning |
| --- | --- | --- |
| `path` | Yes | Repository-relative destination path. |
| `from` | Yes | Local source path, relative to the configuration file declaring this entry. |
| `mode` | Yes | Must be `create-if-missing`. |

Resolving `from` against the declaring file keeps imported presets portable.
The source is read locally; the destination is checked through GitHub only for
repositories whose effective policy includes the entry.

## Plan behavior

- An existing destination produces no change, regardless of its contents.
- A missing destination produces a creation change.
- Unreadable destination state blocks creation rather than assuming absence.
- Octoform does not compare or display a replacement diff because replacement
  is not supported.

## Apply safety

The create request omits a blob `sha`. GitHub therefore rejects the request if
the file appears between observation and mutation. That race becomes a failed
change instead of an overwrite.

## Appropriate files

Use this policy for repository-local files GitHub does not inherit from a
special `.github` repository, such as workflows, `CODEOWNERS`, or
`dependabot.yml`.

`SECURITY.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md` can inherit from a
`.github` repository. Seeding a local copy stops inheritance, so do so only
when the repository deliberately needs its own version.

## Recovery

Removing the entry stops future creation checks but does not delete a file
already created. Revert or delete unwanted content through a reviewed
repository change. Octoform has no stored copy of previous file state and no
file-deletion operation.
