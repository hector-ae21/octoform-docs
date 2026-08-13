---
title: Scheduled-audit example
description: Run a recurring compliance report with a configuration that declares no mutable policy.
---

# Scheduled compliance audit

This root configuration is designed for a recurring observational workflow. It
checks public metadata while leaving all repository settings unmanaged.

## Configuration

<div class="octoform-example" markdown>

```yaml title="octoform.yml"
--8<-- "docs/examples/files/self-audit/octoform.yml"
```

[:material-download: Download YAML](files/self-audit/octoform.yml){ .octoform-example-download download="octoform.yml" aria-label="Download the scheduled-audit policy YAML" }

</div>

## Automation boundary

Use the `audit` command with a credential that can read only the repositories
and metadata required by the report. Store the token in the automation
platform's secret store and avoid printing environment variables or raw API
responses.

The [CI/CD automation guide](../automation/index.md) provides a complete
scheduled workflow and explains failure handling, credential selection, and
protected apply as a separate trust boundary.

## Expected result

The command reports repositories missing public descriptions or topics and
repositories exceeding the topic limit. It does not propose changes to repair
those findings.
