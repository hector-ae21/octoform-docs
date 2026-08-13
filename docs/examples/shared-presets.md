---
title: Shared-presets example
description: Reuse owner-neutral Octoform policies from organization and personal-account roots.
---

# Shared presets

These four files separate account identity from reusable policy. Both root
configurations import the same project-type and security presets.

## Organization root

<div class="octoform-example" markdown>

```yaml title="org.octoform.yml"
--8<-- "docs/examples/files/shared-presets/org.octoform.yml"
```

[:material-download:](files/shared-presets/org.octoform.yml){ .octoform-example-download download="org.octoform.yml" aria-label="Download the organization root YAML" title="Download YAML" }

</div>

## Personal-account root

<div class="octoform-example" markdown>

```yaml title="personal.octoform.yml"
--8<-- "docs/examples/files/shared-presets/personal.octoform.yml"
```

[:material-download:](files/shared-presets/personal.octoform.yml){ .octoform-example-download download="personal.octoform.yml" aria-label="Download the personal-account root YAML" title="Download YAML" }

</div>

## Project-type preset

<div class="octoform-example" markdown>

```yaml title="presets/npm-library.yml"
--8<-- "docs/examples/files/shared-presets/presets/npm-library.yml"
```

[:material-download:](files/shared-presets/presets/npm-library.yml){ .octoform-example-download download="npm-library.yml" aria-label="Download the npm-library preset YAML" title="Download YAML" }

</div>

## Security preset

<div class="octoform-example" markdown>

```yaml title="presets/security-baseline.yml"
--8<-- "docs/examples/files/shared-presets/presets/security-baseline.yml"
```

[:material-download:](files/shared-presets/presets/security-baseline.yml){ .octoform-example-download download="security-baseline.yml" aria-label="Download the security baseline preset YAML" title="Download YAML" }

</div>

## Composition rules

Imports resolve relative to the file that declares them. A reusable preset can
omit `owner`, while the resolved root configuration must supply one. Policies
merge by documented precedence; omission remains unmanaged and does not erase
an unrelated value contributed by another preset.

Keep imported files in the same reviewed change as their roots. A plan should
be regenerated whenever a preset changes because every importing owner can
receive a different effective policy.
