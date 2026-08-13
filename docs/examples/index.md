---
title: Validated examples
description: Choose and download a complete Octoform 0.3.1 configuration for a focused governance workflow.
---

# Validated examples

Every root configuration in this catalogue is loaded with the exact published
`@hector21/octoform@0.3.1` package before the documentation can be released.
Owners and repositories are intentionally fictitious.

!!! tip "Start with a plan"

    Replace the placeholder owner, provide an appropriately scoped token, and
    run `octoform plan` before considering `apply`.

<div class="octoform-grid" markdown>

<div class="octoform-card" markdown>

## Minimal policy

Manage one merge setting across every selected repository. This is the
smallest configuration that produces a mutable plan.

[Open the minimal policy](minimal.md)

</div>

<div class="octoform-card" markdown>

## Audit only

Report missing public metadata without declaring desired repository settings
or making mutation possible.

[Open the audit-only policy](audit-only.md)

</div>

<div class="octoform-card" markdown>

## Personal account

Classify repositories from local evidence and use repository rulesets without
depending on organization custom properties.

[Open the personal-account policy](personal-account.md)

</div>

<div class="octoform-card" markdown>

## Branch patterns

Compare the default-branch token, exact branches, glob patterns, and a fixed
set of maintained branches.

[Open the branch-pattern examples](branch-patterns.md)

</div>

<div class="octoform-card" markdown>

## Scheduled audit

Use a policy that stays observational even if someone invokes `apply` against
the same file.

[Open the scheduled-audit policy](scheduled-audit.md)

</div>

<div class="octoform-card" markdown>

## Shared presets

Compose owner-neutral project and security policies from organization or
personal-account root configurations.

[Open the shared-presets example](shared-presets.md)

</div>

</div>

## What validation proves

The documentation build parses every root file, resolves its imports, and
rejects invalid configuration. Validation proves compatibility with the
documented Octoform release; it does not prove that the placeholder policy is
appropriate for a particular repository, token, or GitHub plan.
