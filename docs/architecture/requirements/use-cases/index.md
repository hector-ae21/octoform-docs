---
title: Use-case specifications
description: The eleven Octoform 0.4 use cases, each specified as a conversation with a primary actor, preconditions, and the states it can end on.
---

# Use-case specifications

Each page below specifies one use case as a conversation: the actor asks,
Octoform answers, and the exchange ends on a state that appears in the
[operator context](../operator-context.md).

The specifications deliberately avoid implementation. They do not name modules,
HTTP endpoints, or output formatting. What they fix is the exchange itself:
what the actor must supply, what Octoform must say back, what it must not do,
and where the conversation can end.

## Catalogue

| Use case | Primary actor | Contacts GitHub | Can write |
| --- | --- | --- | --- |
| [`validateConfiguration()`](validate-configuration.md) | Policy author | No | No |
| [`migrateConfiguration()`](migrate-configuration.md) | Policy author | No | The configuration file, with `--write` |
| [`inspectConfiguration()`](inspect-configuration.md) | Repository operator | No | No |
| [`inspectCapabilities()`](inspect-capabilities.md) | Repository operator | Yes | No |
| [`auditRepositories()`](audit-repositories.md) | Repository operator | Yes | No |
| [`planChanges()`](plan-changes.md) | Repository operator | Yes | No |
| [`savePlan()`](save-plan.md) | Change reviewer | Yes | A plan file |
| [`applyPlan()`](apply-plan.md) | Repository operator | Yes | Yes |
| [`applySavedPlan()`](apply-saved-plan.md) | Change reviewer | Yes | Yes |
| [`classifyRepositories()`](classify-repositories.md) | Repository operator | Yes | Only with `--apply` |
| [`syncProperties()`](sync-properties.md) | Repository operator | Yes | Yes |

## How to read a specification

Every page carries the same sections, so they can be compared:

- **Use-case information** fixes the actor, the goal, the level, and the pre-
  and postconditions.
- **Specification diagram** shows the conversation as a state machine. The
  interior states are deliberately unnamed: the notes on the transitions carry
  the exchange, and the state names live in the table below the diagram.
- **Detailed conversation** repeats the exchange as a table, so it can be read
  without the drawing.
- **Connection with the context** names the transition the use case implements.
- **Vocabulary** lists the verbs used for the actor and for the system, because
  a specification that mixes vocabulary hides who is responsible for what.

## The one rule that governs all of them

In every conversation, the actor requests and decides; Octoform observes,
reports, and asks. Octoform never decides on the operator's behalf, and never
converts an omission into an instruction. That constraint is why the
specifications are worth having: the moment a conversation shows Octoform
choosing something the actor did not ask for, the requirement is wrong.
