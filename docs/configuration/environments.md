---
title: Environments
description: Create GitHub environments and manage required user reviewers with Octoform 0.5.
---

# Environments

Environment policy creates named deployment environments and can converge the
set of required user reviewers.

## `environments`

**Shape:** optional list inside any policy layer.

```yaml
environments:
  - name: npm
    reviewers:
      - release-maintainer
```

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | Yes | Exact GitHub environment name. |
| `reviewers` | No | GitHub user logins required to approve deployment. |

## Observation and comparison

Octoform reads existing environments and their required-reviewer rules only
when policy declares environments. Reviewers are compared as a set, so order
does not create drift.

A missing environment produces a creation change. An existing environment
with different user reviewers produces a correction change. Each declared
login is resolved to a GitHub user ID before mutation; an unresolved login
fails the complete environment change instead of applying fewer reviewers.

## Team-reviewer boundary

Octoform `0.5` models declared reviewers as users only. If an existing
required reviewer is a team, the current reviewer state is marked unreadable
and the change is blocked. Treating a team as an empty user list could silently
replace stronger protection, so Octoform refuses that interpretation.

## Apply and recovery

Executable changes use GitHub's create-or-update environment operation. To
restore user reviewers, declare their previous logins and apply a new plan.
Removing the environment from configuration stops managing it but does not
delete it. Environment deletion and team-reviewer management are outside the
released contract.
