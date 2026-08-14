---
title: Get started
description: Move from a clean environment to a reviewed Octoform plan and a deliberately approved first change.
---

# Get started

Build confidence before granting write access. This journey begins with an
exact package version and a narrow read-only plan, then introduces `apply` only
after the desired and observed states are clear.

<div class="octoform-callout" markdown>

**Safe starting point:** the first four stages do not change GitHub. The final
stage mutates only the repository and setting you explicitly review.

</div>

## Journey

<div class="octoform-grid octoform-grid--journey" markdown>

<div class="octoform-card octoform-card--linked octoform-step" markdown>

<span class="octoform-step-number">01 · Runtime</span>

### Install Octoform

Pin the documented package, choose how to invoke it, and verify the executable.

[Prepare the CLI](installation.md)

</div>

<div class="octoform-card octoform-card--linked octoform-step" markdown>

<span class="octoform-step-number">02 · Identity</span>

### Authenticate safely

Select a credential for interactive or automated use and expose it only to the
current process.

[Choose authentication](authentication.md)

</div>

<div class="octoform-card octoform-card--linked octoform-step" markdown>

<span class="octoform-step-number">03 · Intent</span>

### Write one policy

Declare a single managed value and leave every omitted repository setting
untouched.

[Create the first policy](first-policy.md)

</div>

<div class="octoform-card octoform-card--linked octoform-step" markdown>

<span class="octoform-step-number">04 · Evidence</span>

### Produce a plan

Read GitHub state, narrow the repository selection, and interpret changes,
warnings, and capability blocks.

[Review the first plan](first-plan.md)

</div>

<div class="octoform-card octoform-card--linked octoform-step" markdown>

<span class="octoform-step-number">05 · Change</span>

### Apply and verify

Approve the exact plan, confirm the result, and plan again to prove the desired
state is converged.

[Apply deliberately](safe-apply.md)

</div>

<div class="octoform-card octoform-card--linked octoform-step" markdown>

<span class="octoform-step-number">06 · Model</span>

### Understand the model

Learn why omitted values are unmanaged, how precedence is resolved, and why an
uncertain operation is blocked instead of guessed.

[Read core concepts](../concepts/index.md)

</div>

</div>

## What you need

| Requirement | Minimum | Purpose |
| --- | --- | --- |
| Node.js | `20` | Run the ESM command-line package |
| GitHub owner | Personal account or organization | Identify the repository owner to inspect |
| GitHub credential | Read access to the selected repositories | Obtain observed state and capability evidence |
| Local YAML file | One explicit policy | Declare only the state Octoform may manage |

Use a disposable or low-risk repository for the first apply. A representative
repository is useful; a production-critical repository is not required to
learn the workflow.

## Where to go afterwards

- Use [validated examples](../examples/index.md) as starting points for broader
  policies.
- Follow the full [plan and apply operating procedure](../guides/plan-and-apply.md)
  before routine use.
- Move recurring checks into [CI/CD automation](../automation/index.md).
- Consult the [configuration reference](../configuration/index.md) for exact
  fields, precedence, and applicability.
