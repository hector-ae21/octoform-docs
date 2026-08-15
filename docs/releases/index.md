---
title: Releases
description: Choose the correct Octoform documentation, understand compatibility, and trace immutable releases.
application_line: "0.4"
validated_application_version: "0.4.0"
---

# Releases

This site documents the Octoform `0.4` release line. The version selector uses
`MAJOR.MINOR`; exact package patches appear in the changelog and in
availability notices where behavior begins after the first patch in a line.
Separate immutable tags and GitHub Releases identify each approved editorial
publication of these pages.

<div class="octoform-grid" markdown>

<div class="octoform-card octoform-card--linked" markdown>

## Match a version

Understand product versions, publication revisions, aliases, stable URLs, and
the version selector.

[Read versioning and URLs](versioning.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Review patch changes

Identify the exact patch that introduced a fix, compatibility boundary, or
documentation clarification.

[Read the changelog](changelog.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Update safely

Review the changelog, select matching documentation, validate configuration,
produce a narrow plan, and retain a recovery path.

[Follow the update procedure](updating.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Verify publication

See the checks, immutable artefacts, tags, releases, aliases, and GitHub Pages
deployment produced from the default branch.

[Review publication guarantees](publication.md)

</div>

</div>

## Current compatibility

| Documentation | Compatible packages | Latest verified patch | Runtime |
| --- | --- | --- | --- |
| [`0.4`](versioning.md) | `0.4.x` subject to availability notices | [`0.4.0`](https://github.com/hector-ae21/octoform/releases/tag/v0.4.0) | Node.js 20 or newer |
| `0.3` (version selector) | `0.3.x`, no longer receiving documentation updates | [`0.3.2`](https://github.com/hector-ae21/octoform/releases/tag/v0.3.2) | Node.js 20 or newer |

The `0.3` documentation stays published at its own path and in the version
selector; it is not removed when a newer line appears. Use the selector when
operating that line. Within a line, a notice such as **Available since 0.4.1**
means that the surrounding behavior does not apply to `0.4.0`. Changes that would make the line-wide instructions
incompatible require a new minor documentation version instead.

## Release records

- [Documentation publications](https://github.com/hector-ae21/octoform-docs/releases)
  record each approved source revision and the Octoform version it documents.
- [Application changelog](https://github.com/hector-ae21/octoform/blob/v0.x/CHANGELOG.md)
  records Octoform behavior changes and upgrade notes.
- [npm package versions](https://www.npmjs.com/package/@hector21/octoform?activeTab=versions)
  identify immutable published application artefacts.
- The [0.4.0 SHA-256 manifest][checksums] verifies the generated references
  attached to the latest application Release.

[checksums]: https://github.com/hector-ae21/octoform/releases/download/v0.4.0/SHA256SUMS
