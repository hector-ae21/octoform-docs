---
title: Versioning and URLs
description: Match an Octoform package to its MAJOR.MINOR documentation line and audit immutable publication revisions.
---

# Versioning and URLs

Octoform package patches, documentation lines, and documentation publication
revisions answer different questions:

- **Package patch:** which exact immutable npm artifact is installed?
- **Documentation line:** which compatible `MAJOR.MINOR` contract describes
  that package?
- **Publication revision:** which approved documentation source snapshot
  produced the current wording, examples, and diagrams?

## MAJOR.MINOR controls the site

The documentation selector and canonical URL use the package's
`MAJOR.MINOR`. Compatible patches update the same line instead of creating a
new copy of the entire site.

For the current site:

```text
Octoform package line:  0.4.x
Validated package:      0.4.0
Version selector:       0.4
Canonical path:         /octoform-docs/0.4/
```

A patch-only release can update the changelog, exact installation commands,
evidence, and availability notices while the selector remains `0.4`. A change
that is incompatible with the existing line requires a new minor version and a
new documentation path.

## Patch applicability is explicit

General pages describe the line-wide `0.4` contract. When behavior was added
or corrected after `0.4.0`, the relevant page states **Available since
X.Y.Z**. That notice applies to the named patch and every later compatible
patch in the same line.

The [changelog](changelog.md) is the canonical patch index. Record the exact
installed package in operational evidence even though the documentation URL
uses only `MAJOR.MINOR`.

## Publication tags audit editorial history

Every approved revision reaching `v0.x` receives an immutable annotated tag
and GitHub Release in the documentation repository. Its patch advances within
the product release line independently of npm.

```text
Documented line:        0.4
Validated package:      0.4.0
Publication tags:       v0.4.0, v0.4.1, ... v0.4.25
Visible site version:   0.4
```

Consequently, documentation publication `v0.4.25` can update the `0.4` site
while its build remains validated with Octoform `0.4.0`. The GitHub Release
title states the line, validation patch, and editorial revision.

## URL contract

| URL form | Meaning | Mutability |
| --- | --- | --- |
| `/octoform-docs/0.4/` | Current verified documentation for compatible Octoform `0.4.x` packages | Updated by approved publications in the line |
| `/octoform-docs/0.4.x/` | Backward-compatible redirect from an exact patch URL to `/0.4/`; not shown in the selector | Moving redirect |
| `/octoform-docs/0.3/` | The previous line, still published and still reachable | Frozen once its line stops receiving updates |
| `/octoform-docs/latest/` | Newest verified supported documentation line | Moving redirect |
| `/octoform-docs/stable/` | Current stable documentation line | Moving redirect |
| Site root | Redirect to the current documentation line | Moving redirect |

For an audit that must identify exact prose, record the documentation Git tag
or GitHub Release alongside the exact npm package patch. The tag preserves
source identity; the package version preserves executable identity; the URL
preserves the compatibility line.

## Selector behavior

Choose the selector entry whose `MAJOR.MINOR` matches the installed npm
package. Then consult the changelog for patch-specific availability. A later
editorial publication does not require an application update.
