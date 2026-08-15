---
title: Validated examples
description: Choose and download a complete Octoform 0.5 configuration for a focused governance workflow.
---

# Validated examples

Every root configuration in this catalogue is loaded with the exact Octoform
patch pinned by the documentation build before publication. Owners and
repositories are intentionally fictitious.

!!! tip "Start with a plan"

    Replace the placeholder owner, provide an appropriately scoped token, and
    run `octoform plan` before considering `apply`.

<div class="octoform-grid" markdown>

<div class="octoform-card octoform-card--linked" markdown>

## Organization

Govern the account itself — profile, member policies, custom properties and
organization rulesets — in the same reviewed plan as its repositories.

[Open the organization policy](organization.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Teams and access

Declare teams and their nesting, who is on each one, who holds an organization
role, and what each of them may reach.

[Open the teams and access policy](teams-and-access.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Multi-owner

Govern an organization and a personal account from one document, with the
shared policy written once.

[Open the multi-owner policy](multi-owner.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Reviewed plan

Separate approving a change from carrying it out, using a saved plan that
refuses to drift between the two.

[Open the reviewed-plan policy](reviewed-plan.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Minimal policy

Manage one merge setting across every selected repository. This is the
smallest configuration that produces a mutable plan.

[Open the minimal policy](minimal.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Audit only

Report missing public metadata without declaring desired repository settings
or making mutation possible.

[Open the audit-only policy](audit-only.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Personal account

Classify repositories from local evidence and use repository rulesets without
depending on organization custom properties.

[Open the personal-account policy](personal-account.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Branch patterns

Compare the default-branch token, exact branches, glob patterns, and a fixed
set of maintained branches.

[Open the branch-pattern examples](branch-patterns.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

## Scheduled audit

Use a policy that stays observational even if someone invokes `apply` against
the same file.

[Open the scheduled-audit policy](scheduled-audit.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

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

It proves less than usual for the two organization examples, and the difference
is worth knowing. Loading a file establishes that every key is spelled the way
the release accepts. It cannot establish what a `base_permission` or a `~ALL`
condition would reach in *your* organization — only a plan against that
organization can, which is why both examples say to run one first.
