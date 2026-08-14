---
title: Publication guarantees
description: Understand how an approved documentation revision safely updates one Octoform MAJOR.MINOR site.
---

# Publication guarantees

Every approved revision reaching the default `v0.x` branch is published
automatically after the pull-request verification gate has passed. Publication
does not require a separate `main` branch or an npm release.

## Verification gate

The workflow rejects publication unless all required checks pass:

- Markdown and spelling validation.
- Publication-identity and deployment tests.
- Deterministic local PlantUML rendering.
- Exact example parsing with the pinned Octoform patch.
- Credential-pattern scanning.
- Strict MkDocs build and HTML validation.
- Internal, anchor, and external link validation.
- Runtime privacy checks for external resources.
- Navigation, direct-download, responsive, and WCAG 2.2 AA checks.

## Resolve three identities

The workflow reads the exact Octoform dependency from `package.json`. That
complete patch is the reproducible validation target. Its `MAJOR.MINOR` line
becomes the Mike version, selector entry, and canonical public path.

Independently, the workflow finds documentation tags in the matching line. It
reuses a tag already assigned to the same commit or increments the latest
editorial patch for a new source revision. Prerelease, build-metadata, and
incomplete package or publication versions are rejected.

An older tagged commit can be verified again, but it cannot replace the
current line or move aliases backwards.

## Publication sequence

1. Read the exact package patch and derive its `MAJOR.MINOR` line.
2. Validate source identity, examples, diagrams, generated site, links,
   privacy, interaction, and accessibility.
3. Create an annotated publication tag naming the editorial revision,
   documentation line, and exact validation patch.
4. Convert legacy exact-patch Pages paths into redirects to the line so old
   links remain valid without appearing in the selector.
5. Deploy the canonical `MAJOR.MINOR` Mike directory and update exact-patch,
   `latest`, and `stable` redirects.
6. Validate the pushed Pages tree, deploy it, and verify the line and aliases
   over HTTPS.
7. Create a GitHub Release for the immutable documentation publication tag.

The source tag remains immutable. The line path can receive later editorial
corrections and guidance for newer compatible patches. Patch-level differences
must be recorded in the [changelog](changelog.md) and, where relevant, in an
availability notice on the affected page. An incompatible change creates a new
minor documentation line.

The [release pipeline architecture](../architecture/delivery/release-pipelines.md)
shows the relationship between package and documentation publication.
