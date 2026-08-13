---
title: Govern GitHub repositories as declared state
description: Plan and apply consistent repository governance across personal accounts and organizations.
hide:
  - toc
---

<div class="octoform-hero" markdown>

# Repository governance you can review before it changes anything

Octoform compares a YAML policy with the current state of your GitHub
repositories, reports the exact drift, and applies only the changes you approve.

<div class="octoform-actions" markdown>

[Get started](getting-started/index.md){ .md-button .md-button--primary }
[View the source](https://github.com/hector-ae21/octoform){ .md-button }

</div>
</div>

<div class="octoform-grid" markdown>

<div class="octoform-card" markdown>

## Declarative by default

Omitted settings stay unmanaged. Explicit values participate in a deterministic
plan, so a small configuration does not acquire accidental side effects.

</div>

<div class="octoform-card" markdown>

## Capability-driven

GitHub's response, the owner, repository visibility, and current token determine
whether a change is available. Product-plan names are diagnostic context, not
authorization logic.

</div>

<div class="octoform-card" markdown>

## Safe automation

`audit` and `plan` are read-only. `apply` presents the same planned changes and
requires confirmation unless an operator deliberately enables non-interactive
execution.

</div>

</div>

## A minimal policy

```yaml title="octoform.yml"
owner: your-account

defaults:
  features:
    wiki: false
  security:
    vulnerability_alerts: true
```

```console
octoform plan
```

The current documentation describes Octoform `0.3.1`. Use the version selector
after publication to keep procedures aligned with the release you operate.
