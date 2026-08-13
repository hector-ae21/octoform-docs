---
title: Versioning and URLs
description: Relate Octoform application versions, documentation patches, aliases, and immutable URLs.
---

# Versioning and URLs

Octoform and its documentation both use complete `MAJOR.MINOR.PATCH` versions.
They share `MAJOR.MINOR` when the documentation describes that application
release line; their patch numbers do not need to match.

## Why patches differ

An application patch represents a published package change. A documentation
patch represents an approved documentation revision for the same application
release line. Documentation can correct wording, add examples, or improve
navigation without publishing another npm package.

For example:

```text
Application:   0.3.1
Documentation: 0.3.0, 0.3.1, 0.3.2, ...
Shared line:   0.3
```

## URL contract

| URL form | Meaning | Mutability |
| --- | --- | --- |
| `/octoform-docs/0.3.0/` | One exact documentation patch | Immutable |
| `/octoform-docs/0.3/` | Newest verified patch in the `0.3` line | Moving alias |
| `/octoform-docs/latest/` | Newest verified supported documentation | Moving alias |
| `/octoform-docs/stable/` | Current stable documentation | Moving alias |
| Site root | Redirect to the current documentation | Moving alias |

Use an immutable patch URL in incident records, audit evidence, and long-lived
references that must preserve the exact instructions reviewed at that time.
Use a moving alias for normal discovery and bookmarks that should follow
approved corrections.

## Tags and releases

Every documentation patch has an annotated `vMAJOR.MINOR.PATCH` Git tag and a
GitHub Release. The tag identifies the source revision; the immutable versioned
site path identifies the generated documentation. Aliases move only after the
new patch passes verification and deployment checks.

The selector displays documentation versions, not npm package versions. Confirm
the application version stated on the selected documentation release before
running commands.
