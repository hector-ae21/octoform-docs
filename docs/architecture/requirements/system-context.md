---
title: System context
description: Understand how people, automation, applications, Octoform interfaces, and GitHub interact.
---

# System context

The context view treats Octoform as one software system while exposing its two
supported entry interfaces. It distinguishes caller intent from the governance
engine and GitHub's external authority.

<div class="octoform-diagram" role="region" aria-label="Scrollable UML system context diagram" tabindex="0" markdown>

![UML system context showing operators and workflows entering through the CLI, applications entering through the ESM API, the governance engine, and the GitHub REST API](../../assets/diagrams/system-context.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/system-context.puml)

## Interaction paths

| Path | Request | Response |
| --- | --- | --- |
| Operator → CLI | Command, configuration path, filters, and optional confirmation | Human-readable findings, plan, outcomes, and process exit code |
| Workflow → CLI | Reviewed checkout, command options, environment token, and external approval | Job log and exit code |
| Application → ESM API | Typed configuration, services, or domain inputs | Typed results, changes, and errors |
| Governance engine → GitHub REST API | Authenticated state reads and permitted mutations | State, response headers, status codes, and errors used as evidence |

## System boundary

Octoform owns configuration composition, repository selection, policy
resolution, observation orchestration, deterministic comparison, confirmation,
grouped mutation, and reporting. It does not own GitHub authorization, plan
entitlements, repository history, CI approval policy, or rollback transactions.

The released system resolves one owner per root configuration and uses REST
only. These are current boundaries, not assumptions about future versions.
