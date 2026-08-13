---
title: Validated examples
description: Download and adapt complete Octoform 0.3.1 configurations for common governance workflows.
---

# Validated examples

Every example uses fictitious owners and repositories. The documentation build
loads each root configuration with the exact published `0.3.1` package,
including imported presets, before this site can be published.

## Minimal policy

One managed value for every repository. Use this shape for a first plan.

```yaml
--8<-- "docs/examples/files/minimal/octoform.yml"
```

[Download minimal policy](files/minimal/octoform.yml){ .md-button }

## Audit only

Inventory public metadata without declaring any mutable policy.

```yaml
--8<-- "docs/examples/files/audit-only/octoform.yml"
```

[Download audit-only policy](files/audit-only/octoform.yml){ .md-button }

## Personal account

Use local repository types and repository-level rulesets without assuming
organization custom properties.

```yaml
--8<-- "docs/examples/files/personal-account/octoform.yml"
```

[Download personal-account policy](files/personal-account/octoform.yml){ .md-button }

## Branch targeting patterns

Compare the default-branch token, an exact branch, a glob, and a fixed set.

```yaml
--8<-- "docs/examples/files/branch-patterns/octoform.yml"
```

[Download branch-pattern policy](files/branch-patterns/octoform.yml){ .md-button }

## Scheduled compliance report

A policy that remains read-only even if someone invokes `apply` against it.

```yaml
--8<-- "docs/examples/files/self-audit/octoform.yml"
```

[Download scheduled-audit policy](files/self-audit/octoform.yml){ .md-button }

## Shared presets

The same owner-neutral policy fragments can be imported by an organization or
personal-account root configuration.

=== "Organization root"

    ```yaml
    --8<-- "docs/examples/files/shared-presets/org.octoform.yml"
    ```

=== "Personal root"

    ```yaml
    --8<-- "docs/examples/files/shared-presets/personal.octoform.yml"
    ```

=== "Project-type preset"

    ```yaml
    --8<-- "docs/examples/files/shared-presets/presets/npm-library.yml"
    ```

=== "Security preset"

    ```yaml
    --8<-- "docs/examples/files/shared-presets/presets/security-baseline.yml"
    ```

[Download organization root](files/shared-presets/org.octoform.yml){ .md-button }
[Download personal root](files/shared-presets/personal.octoform.yml){ .md-button }
