---
title: Trust and data flow
description: Identify Octoform credential, configuration, process, network, GitHub, and logging trust boundaries.
---

# Trust and data flow

The data-flow view focuses on information crossing operator-controlled,
network, and GitHub-controlled boundaries.

<div class="octoform-diagram" role="region" aria-label="Scrollable UML trust and data-flow diagram" tabindex="0" markdown>

![UML data-flow diagram showing reviewed configuration, seed files, environment secrets, the Octoform process, logs, HTTPS transport, GitHub API, and repository state](../../assets/diagrams/trust-and-data-flow.svg)

</div>

[Open the PlantUML source](../../assets/diagrams/sources/trust-and-data-flow.puml)

## Sensitive inputs and outputs

| Flow | Control |
| --- | --- |
| Token → process | Use environment injection, minimum permissions, protected secret storage, and rotation. |
| Configuration → process | Require repository review because it selects owners, repositories, desired values, and local content. |
| Seed files → process | Review content and relative path provenance before permitting creation. |
| Process ↔ GitHub | Use authenticated HTTPS; treat response fields and status codes as state and capability evidence. |
| Process → logs | Restrict retention and audience because names, private topology, current settings, and API errors can be sensitive. |

Octoform `0.5` has no token configuration field, and rejects a
credential-shaped value written into one. It does persist a plan when asked:
`plan --out` writes a saved plan, with owner-only permissions where the
platform supports them. That file carries no credential, but it does name
private repositories and their settings, so it belongs to the same
confidentiality boundary as the configuration and the console output — none of
which is public-safe.

Use [Security and trust](../../security/index.md) for credential selection,
rotation, incident response, and automation controls.
