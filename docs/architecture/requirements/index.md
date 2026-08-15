---
title: Requirements
description: How Octoform 0.5 requirements are recorded as actors, use cases, an operator context, and one specification per use case.
---

# Requirements

These pages record what Octoform is asked to do, separately from how it is
built. They follow the requirements discipline of the Rational Unified
Process: identify the actors, name one use case per goal, place those use
cases on a context model, and specify each one as a conversation.

The value of the method is not the drawings. It is that the artefacts are
required to agree with each other. Every transition on the
[operator context](operator-context.md) is a use case that has a
[specification](use-cases/index.md), and every specification ends on states
that appear in that context. A use case that cannot be placed on the context,
or a context state no use case reaches, is a defect in the requirements rather
than a stylistic choice.

## The artefact map

| Artefact | Question it answers | Where |
| --- | --- | --- |
| Actor catalogue | Who or what interacts with Octoform, and with what authority | [Actors and use cases](actors-and-use-cases.md) |
| Actor and use-case diagrams | Which goals each actor can reach, and how goals include or extend one another | [Actors and use cases](actors-and-use-cases.md) |
| Operator context | What the operator holds at each point, and which use case moves them | [Operator context](operator-context.md) |
| Use-case specifications | The conversation inside one use case, turn by turn | [Specification catalogue](use-cases/index.md) |
| System context | The structural boundary and the external systems around it | [System context](system-context.md) |
| Entity state models | The lifecycle of a change and of a configuration | [State models](../behavior/state-models.md) |

## How a use case is named

A use case is named as the operation the actor requests, with parentheses:
`planChanges()`, not "Preview desired-state changes". The naming is not
decoration. A goal that cannot be written as one operation is usually two use
cases, and a name that reads as a feature area rather than a request is
usually a package.

## What is deliberately not a use case

Two things that look like use cases here are not.

**Returning an exit class** is a postcondition every use case shares, not a
goal an actor pursues. It is specified once, in the
[execution contract](../../commands/execution-contract.md), and each
specification states which classes it can end on.

**Running in a pipeline** is a context of use, not a goal. A scheduled job
does not pursue a different goal from an operator; it pursues the same one
without the ability to answer a prompt. That difference belongs in the
alternate flow of the affected use case, which is why
[automation patterns](../delivery/automation-patterns.md) describe controls
rather than a separate set of cases.

## Reading order

1. [Actors and use cases](actors-and-use-cases.md) to see who wants what.
2. [Operator context](operator-context.md) to see how the goals connect.
3. A [specification](use-cases/index.md) for the conversation you care about.
