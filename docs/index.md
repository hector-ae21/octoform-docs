---
title: Govern GitHub repositories as declared state
description: Review and apply consistent GitHub repository governance from one explicit policy.
hide:
  - navigation
  - toc
---

<div class="octoform-hero" markdown>

<div class="octoform-hero-copy" markdown>

<p class="octoform-eyebrow">Declarative GitHub governance · Octoform 0.3.1</p>

# Make repository policy visible before it becomes real

<p class="octoform-lead">Octoform compares an explicit YAML policy with the
current state of your GitHub repositories, builds a deterministic plan, and
applies only the changes you approve.</p>

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

Omitted settings remain untouched. Defaults, repository types, and repository
overrides resolve field by field into one effective policy.

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

<div class="octoform-callout" markdown>

**Current documentation:** this site describes Octoform `0.3.1`. Use the version
selector when operating another release line so commands, configuration, and
permissions remain aligned with the package you installed.

</div>
