---
title: Release pipelines
description: Understand immutable Octoform package releases and independently patched versioned documentation.
---

# Release pipelines

Application and documentation publication are automated but remain distinct.
They share a release line while preserving independent patch histories.

<div class="octoform-diagram" role="region" aria-label="Scrollable UML release pipeline sequence diagram" tabindex="0" markdown>

![UML sequence diagram showing version-branch merges, npm trusted publishing, GitHub Releases, documentation verification, versioned mike deployment, and GitHub Pages](../../assets/diagrams/release-pipelines.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/release-pipelines.puml)

## Application release

A reviewed merge to the version branch triggers version and tag checks, full
package verification, an annotated tag, npm trusted publishing through OIDC
with provenance, and a GitHub Release.

## Documentation release

Every reviewed revision reaching the default `v0.x` branch is verified and
published as a complete documentation patch. The documentation `MAJOR.MINOR`
matches the exact Octoform release line it describes, while `PATCH` advances
independently. Immutable patch paths remain available; `0.3`, `latest`, and
`stable` aliases move only after successful verification and deployment.

See [Releases](../../releases/index.md) for the reader-facing version contract.
