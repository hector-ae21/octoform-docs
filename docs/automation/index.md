---
title: CI/CD automation
description: Run read-only Octoform audits and carefully protected apply operations in GitHub Actions.
---

# CI/CD automation

Automation should make drift visible more often than it changes state. Begin
with a scheduled read-only job and introduce apply only after the policy,
repository selection, credentials, and approval boundary are established.

## Scheduled read-only audit

```yaml title=".github/workflows/governance-audit.yml"
name: Repository governance audit

on:
  workflow_dispatch:
  schedule:
    - cron: '17 6 * * 1'

permissions:
  contents: read

jobs:
  audit:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npx --yes @hector21/octoform@0.3.1 audit --config octoform.yml
        env:
          GITHUB_TOKEN: ${{ secrets.OCTOFORM_AUDIT_TOKEN }}
```

`audit` exits `0` when it reports findings. Treat its output as a report; do
not assume that a successful job means no findings.

## Credential selection

| Credential | Appropriate use | Boundary |
| --- | --- | --- |
| Workflow `GITHUB_TOKEN` | Repositories visible to that workflow's repository token | Usually insufficient for an owner-wide inventory |
| Fine-grained PAT | Initial or narrowly scoped automation | Long-lived secret; restrict repositories and permissions |
| GitHub App installation token | Production owner-wide automation | Short-lived and installation-scoped; preferred |

Never print the token, enable shell tracing around it, or expose private
repository names through a public workflow log.

## Protected apply

Octoform `0.3.1` does not consume a separately signed immutable plan artifact.
Its apply command plans, displays, and then mutates in the same process. That
means a protected job must approve the workflow revision and exact policy, not
an earlier standalone plan file.

Use all of these controls:

- manual `workflow_dispatch`, never an unreviewed pull-request workflow;
- a protected environment with required reviewers;
- a GitHub App or narrowly scoped token stored only in that environment;
- a pinned Octoform patch;
- an explicit `--repo` or reviewed `--type` selector;
- concurrency that prevents simultaneous governance runs;
- retained logs with secret masking and restricted access.

```yaml title=".github/workflows/governance-apply.yml"
name: Apply repository governance

on:
  workflow_dispatch:
    inputs:
      repository:
        description: Exact repository name
        required: true
        type: string

permissions:
  contents: read

concurrency:
  group: octoform-apply
  cancel-in-progress: false

jobs:
  apply:
    environment: governance-apply
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npx --yes @hector21/octoform@0.3.1 apply --yes --config octoform.yml --repo "$TARGET_REPOSITORY"
        env:
          GITHUB_TOKEN: ${{ secrets.OCTOFORM_APPLY_TOKEN }}
          TARGET_REPOSITORY: ${{ inputs.repository }}
```

The example uses version tags for readability. A production supply-chain
policy may additionally pin Actions to reviewed commit SHAs.

## Failure and recovery

If apply exits non-zero, assume partial success is possible. Preserve the log,
run a fresh read-only plan, and reconcile the remaining state. Do not blindly
rerun a failed workflow before reviewing the new plan.
