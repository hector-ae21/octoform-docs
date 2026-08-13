---
title: Automation patterns
description: Separate read-only pull-request and scheduled workflows from protected Octoform mutation.
---

# Automation patterns

Automation intent determines the credential, command, approval boundary, and
meaning of success.

<div class="octoform-diagram" role="region" aria-label="Scrollable UML automation activity diagram" tabindex="0" markdown>

![UML activity diagram comparing pull-request planning, scheduled auditing, and protected application workflows](../../assets/diagrams/automation-pipelines.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/automation-pipelines.puml)

## Pattern comparison

| Pattern | Command | Credential | Mutation control |
| --- | --- | --- | --- |
| Pull-request validation | `plan` | Read-only for required repositories and settings | No apply step exists |
| Scheduled observation | `audit` | Read-only inventory access | Findings are reported; `0.3.1` still exits `0` |
| Protected application | `apply --yes` | Minimum write permissions loaded only after approval | Trusted ref, reviewed policy, protected environment, controlled logs |

Because the released package has no immutable plan artifact, a separate plan
job cannot hand a cryptographically bound plan to a later apply job. Protected
apply plans again in its own invocation and displays that plan before the
external workflow approval or `--yes` execution boundary is considered.

Copy the supported workflows from the [CI/CD automation guide](../../automation/index.md).
