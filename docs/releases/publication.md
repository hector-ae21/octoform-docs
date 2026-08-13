---
title: Publication guarantees
description: Understand how an approved documentation source revision updates the matching Octoform product documentation safely.
---

# Publication guarantees

Every approved revision reaching the default `v0.x` branch is verified and
published automatically. Publication does not require a separate `main` branch
or an npm release.

## Verification gate

The workflow rejects publication unless all required checks pass:

- Markdown and spelling validation.
- Publication-identity and deployment tests.
- Deterministic local PlantUML rendering.
- Exact example parsing with the documented Octoform package.
- Credential-pattern scanning.
- Strict MkDocs build and HTML validation.
- Internal, anchor, and external link validation.
- Runtime privacy checks for external resources.
- Navigation, direct-download, responsive, and WCAG 2.2 AA checks.

## Resolve two identities

The workflow reads the exact Octoform dependency from `package.json`. That
complete version becomes the Mike version and public product path.

Independently, the workflow finds documentation tags in the matching
`MAJOR.MINOR` line. It reuses a tag already assigned to the same commit or
increments the latest editorial patch for a new source revision. Prerelease,
build-metadata, and incomplete versions are rejected.

An older tagged commit can be verified again, but it cannot replace the current
product site or move aliases backwards.

## Publication sequence

1. Verify source, examples, diagrams, generated site, links, privacy,
   interaction, and accessibility.
2. Create an annotated publication tag naming both the editorial revision and
   documented Octoform version.
3. Replace the Mike directory named after the exact Octoform version.
4. Update the release-line, `latest`, and `stable` redirects after validating
   the pushed Pages tree.
5. Deploy GitHub Pages and verify the product version and aliases over HTTPS.
6. Create a GitHub Release for the immutable documentation publication tag.

The source tag remains immutable. The product path can receive later editorial
corrections only while the pinned Octoform dependency remains exactly the same.
Changing the dependency creates or updates the corresponding product-version
path instead.

The [release pipeline architecture](../architecture/delivery/release-pipelines.md)
shows the relationship between package and documentation publication.
