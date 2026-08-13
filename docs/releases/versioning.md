---
title: Versioning and URLs
description: Distinguish the Octoform version shown by the site from immutable documentation publication revisions.
---

# Versioning and URLs

Octoform product versions and documentation publication revisions answer two
different questions:

- **Product version:** which npm package behavior do these instructions
  describe?
- **Publication revision:** which approved source snapshot produced the current
  wording, navigation, examples, and diagrams?

Both use complete `MAJOR.MINOR.PATCH` versions without suffixes, but they are
not interchangeable.

## Product version controls the site

The exact dependency on `@hector21/octoform` determines the Mike version, the
version selector entry, and the canonical product documentation path.

For the current site:

```text
Octoform product:       0.3.1
Version selector:       0.3.1
Canonical path:         /octoform-docs/0.3.1/
Compatibility alias:   /octoform-docs/0.3/
```

A documentation-only correction republishes `0.3.1`; it does not invent a new
Octoform version.

## Publication tags audit editorial history

Every approved revision reaching `v0.x` receives an immutable annotated tag
and GitHub Release in the documentation repository. Its patch advances within
the product release line independently of npm.

```text
Documented Octoform:    0.3.1
Publication tags:       v0.3.0, v0.3.1, ... v0.3.25
Visible site version:   0.3.1
```

Consequently, documentation publication `v0.3.25` can still describe Octoform
`0.3.1`. Its Release title states both identities explicitly.

## URL contract

| URL form | Meaning | Mutability |
| --- | --- | --- |
| `/octoform-docs/0.3.1/` | Documentation for exact Octoform `0.3.1` | Updated by later approved editorial publications for that product version |
| `/octoform-docs/0.3/` | Current verified product documentation in the `0.3` line | Moving redirect |
| `/octoform-docs/latest/` | Newest verified supported product documentation | Moving redirect |
| `/octoform-docs/stable/` | Current stable product documentation | Moving redirect |
| Site root | Redirect to current product documentation | Moving redirect |

For an audit that must identify exact prose, record the documentation Git tag
or GitHub Release alongside the product URL. The tag preserves source identity;
the URL preserves the package version to which the instructions apply.

## Selector behavior

The selector displays Octoform versions, not editorial revisions. Choose the
entry that exactly matches the installed npm package before copying commands or
configuration. A later publication tag does not require an application update.
