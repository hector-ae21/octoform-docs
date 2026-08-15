---
title: Govern GitHub organizations and repositories as declared state
description: Review and apply consistent GitHub governance, from one organization's member policies down to one repository's labels, from a single explicit policy.
hide:
  - toc
---

<div class="octoform-hero" markdown>

<div class="octoform-hero-copy" markdown>

<p class="octoform-eyebrow">Declarative GitHub governance · Octoform 0.5</p>

# Make GitHub policy visible before it becomes real

<p class="octoform-lead">Octoform compares an explicit YAML policy with the
current state of your GitHub organization and its repositories, builds a
deterministic plan, and applies only the changes you approve.</p>

<div class="octoform-actions" markdown>

[Build your first plan](getting-started/index.md){ .md-button .md-button--primary }
[Explore the architecture](architecture/index.md){ .md-button }

</div>

<div class="octoform-pill-row">
  <span class="octoform-pill">Read-only audit</span>
  <span class="octoform-pill">Deterministic plan</span>
  <span class="octoform-pill">Explicit apply</span>
</div>

</div>

<div class="octoform-hero-visual" markdown>

![Octoform octopus coordinating GitHub repositories as declared policy](assets/brand/octoform-logo.png){ .octoform-hero-logo loading=eager }

</div>

</div>

## Governance is a reviewable workflow

<p class="octoform-section-intro">Every run separates what you intend, what
GitHub currently exposes, and what Octoform is actually allowed to change.</p>

<div class="octoform-grid" markdown>

<div class="octoform-card octoform-step" markdown>

<span class="octoform-step-number">01 · Declare</span>

### Describe only what you manage

Omitted settings remain untouched, and nothing is removed because a line was
left out. Defaults, repository types, and repository overrides resolve field by
field into one effective policy.

</div>

<div class="octoform-card octoform-step" markdown>

<span class="octoform-step-number">02 · Review</span>

### See drift and blocked work

The plan identifies current and desired values, warnings, unsupported
capabilities, and operations the supplied token cannot prove safe.

</div>

<div class="octoform-card octoform-step" markdown>

<span class="octoform-step-number">03 · Apply</span>

### Confirm deliberate changes

Octoform presents the planned operations before mutation and reports each
outcome without treating unreadable state as permission to overwrite it.

</div>

</div>

## Start with the smallest useful policy

<div class="octoform-split" markdown>

<div markdown>

```yaml title="octoform.yml"
owner: your-account

defaults:
  features:
    wiki: false
  security:
    vulnerability_alerts: true
```

</div>

<div markdown>

The example manages two explicit settings and makes no claim about anything
else. Produce a read-only plan before considering an apply:

```console
octoform plan --config octoform.yml
```

[Follow the complete quick start →](getting-started/index.md)

</div>

</div>

## Safety is part of the model

<div class="octoform-grid" markdown>

<div class="octoform-card" markdown>

### Omission means unmanaged

A short configuration cannot silently become an instruction to disable or
delete settings you never declared.

</div>

<div class="octoform-card" markdown>

### Capability comes from evidence

Owner kind, repository visibility, token permissions, and GitHub responses
decide whether an operation is available—not a hard-coded commercial plan name.

</div>

<div class="octoform-card" markdown>

### Uncertainty blocks mutation

If Octoform cannot read enough state to produce a trustworthy diff, the plan
surfaces the block instead of inventing a safe-looking answer.

</div>

</div>

## The account, not only its repositories

<p class="octoform-section-intro">Octoform 0.5 governs the organization above
the repositories: its profile, what members may do, its custom properties, the
rulesets it aims at repositories it selects, its teams and its roles. All of it
appears in the same plan, and all of it is confirmed the same way.</p>

<div class="octoform-grid" markdown>

<div class="octoform-card octoform-card--linked" markdown>

### Reach is stated, not discovered

A base permission, an organization ruleset and an organization role each reach
every repository the account owns — including ones no policy names. Each is
reported as `sensitive` before it is applied.

[Read the organization block](configuration/organization.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

### Membership asks first

Inviting, removing or converting one person is a command that names them, says
what will happen, and waits. An invitation is addressed to a person, not
reconciled by a schedule.

[Read the members commands](commands/members.md)

</div>

<div class="octoform-card octoform-card--linked" markdown>

### Nothing is removed by omission

Every removable resource has a word that has to be written: `none` for a grant,
`mode: absent` for a team, a label or a property definition. Deleting a line
stops managing something; it never destroys it.

[Follow the organization guide](guides/organization-governance.md)

</div>

</div>

<div class="octoform-callout" markdown>

**Current documentation:** this site describes Octoform `0.5`. Use the version
selector when operating another release line so commands, configuration, and
permissions remain aligned with the package you installed.

</div>
