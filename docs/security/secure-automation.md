---
title: Secure automation
description: Separate untrusted planning from authorized Octoform mutation in CI/CD workflows.
---

# Secure automation

A secure workflow treats planning and mutation as separate authorization
boundaries. Pull requests can validate configuration and produce read-only
evidence; a protected job decides whether write credentials may be used.

## Required controls

An apply workflow should have:

- no pull-request access to write credentials;
- reviewed and pinned dependencies;
- manual dispatch or another explicit authorization event;
- a protected environment with required reviewers;
- exact repository and type selection;
- concurrency preventing overlapping apply jobs;
- minimal log and artifact retention;
- a new read-only plan after any failure.

See [CI/CD automation](../automation/index.md) for supported `0.3.1` examples
and its important immutable-plan limitation.

## Threats and mitigations

| Threat | Primary mitigation |
| --- | --- |
| Malicious policy change | Protected branch, CODEOWNERS, and reviewed diff |
| Pull request exfiltrates a token | No apply secrets or write permissions in pull-request workflows |
| Token can see too many repositories | Fine-grained selection or GitHub App installation scope |
| Unreadable state causes overwrite | Planning block; never infer an absent value |
| Concurrent applies race | Owner and repository concurrency group |
| Plan becomes stale | Apply immediately after review and re-plan after failure |
| Public logs reveal private inventory | Private workflows, private artifacts, and sanitized support reports |
| Dependency compromise | Exact Octoform patch, lockfiles, provenance, and dependency review |

## Plan freshness

Octoform `0.3.1` does not consume a separately approved immutable plan artifact.
The apply command plans again immediately before confirmation. Protect the
configuration revision and apply environment, and review the plan displayed by
that authorized run.

Use [Incidents and recovery](incidents-and-recovery.md) when a workflow fails
after one or more mutations have succeeded.
