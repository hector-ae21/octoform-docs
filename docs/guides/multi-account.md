---
title: Operate across several accounts
description: Introduce a second account to an Octoform document, narrow a run, and read a report that spans more than one owner.
---

# Operate across several accounts

A document that governs two accounts is not twice the risk of one, but it is
twice the blast radius of a mistake in a shared layer. This guide is about
keeping that shared layer honest.

## Add the second account

A single-owner file keeps its exact meaning in this release, so there is no
migration deadline. When you want the multi-account shape, move both accounts
under `owners` and leave what they share at the root:

```yaml title="octoform.yml"
version: 1

defaults:
  merge:
    delete_branch_on_merge: true

owners:
  example-org: {}
  example-personal: {}
```

[`octoform config migrate`](../commands/config.md) performs the conversion,
previewing by default and preserving your comments. See the
[multi-owner example](../examples/multi-owner.md) for a document that actually
uses the shape.

## Prove the accounts before you plan against them

```console
octoform config validate    --config octoform.yml
octoform inspect capabilities --config octoform.yml
```

The first is offline and needs no token: it catches an owner login that is not
a valid GitHub account before a run spends several requests discovering that
as a `404`. The second reports each account's kind, numeric identity, ruleset
availability, and any declaration that does not apply to it.

A declaration that does not apply is reported, never silently ignored. Pass
`--strict` to turn those reports into a failed run.

## Narrow before you widen

Introduce a new shared layer against one account and one repository first:

```console
octoform plan --config octoform.yml --owner example-org --repo example-service
```

Then remove `--repo`, then remove `--owner`. The order matters because a
change to a root `defaults` or a root named policy reaches every account at
once, and the account you were not thinking about is the one that will
surprise you.

## Read a report that spans accounts

Accounts run one at a time, in declaration order, so their reports never
interleave. Two behaviours follow from that:

- By default a failure in one account does not stop the others. The run
  continues and reports every account's outcome. `--fail-fast` stops at the
  first failure instead.
- The run's exit class is the most severe class any account produced. A `4`
  does not tell you which account was blocked; the report does.

Bound the work inside an account with `--concurrency <n>`.

## Disambiguate a repository name

A bare `--repo` name that matches repositories under more than one selected
account is rejected rather than guessed at, and the error lists the qualified
forms:

```console
octoform plan --config octoform.yml --repo example-org/example-service
```

An `--owner` the configuration does not declare is rejected too, rather than
quietly resolving to every account except the one you meant.

## Where the shared layer bites

The failure mode worth rehearsing: a preset or a root policy changes, and
every importing account receives a different effective policy in the same
commit. Keep imported files in the same reviewed change as their roots, and
regenerate a plan for **each** account after a shared edit — not only for the
account that motivated it.

When the applier is not the reviewer, hand over a
[saved plan](../examples/reviewed-plan.md) instead of a command. Its
configuration digests are what catch a shared layer that moved between the
review and the run.
