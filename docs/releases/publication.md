---
title: Publication guarantees
description: Understand how each approved Octoform documentation revision becomes a verified immutable release.
---

# Publication guarantees

Every approved revision reaching the default `v0.x` branch is verified and
published automatically. Publication does not require a separate `main` branch.

## Verification gate

The release workflow rejects publication unless all required checks pass:

- Markdown and spelling validation.
- Release-version and deployment tests.
- Deterministic local PlantUML rendering.
- Exact example parsing with the documented Octoform package.
- Credential-pattern scanning.
- Strict MkDocs build and HTML validation.
- Internal, anchor, and external link validation.
- Runtime privacy checks for external resources.
- Navigation, direct-download, responsive, and WCAG 2.2 AA checks.

## Release resolution

The workflow reads the documented application version and confirms that the
documentation release shares its `MAJOR.MINOR`. It reuses a documentation tag
already assigned to the same source commit or increments only the documentation
patch for a new revision.

Prerelease, build-metadata, or incomplete versions are rejected. Publication
uses complete `MAJOR.MINOR.PATCH` versions only.

## Published artefacts

1. An annotated documentation tag identifies the source revision.
2. A GitHub Release records the published documentation patch.
3. `mike` writes an immutable patch directory to the Pages branch.
4. Release-line, `latest`, and `stable` aliases are updated when appropriate.
5. GitHub Pages deploys the verified tree.
6. HTTPS checks confirm the immutable version and aliases serve the expected
   source revision.

Older immutable paths remain untouched. Recovery of an older tagged source can
rebuild its immutable path without moving aliases backward.

The [release pipeline architecture](../architecture/delivery/release-pipelines.md)
shows the relationship between package and documentation publication.
