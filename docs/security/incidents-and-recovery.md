---
title: Incidents and recovery
description: Contain credential exposure, assess partial Octoform execution, and restore declared state safely.
---

# Incidents and recovery

Contain credential exposure before investigating logs or reproducing the
failure. A revoked credential limits the time available for further misuse.

## Exposed credential

1. Revoke the token or suspend the GitHub App installation credential.
2. Stop active jobs that could still hold the value.
3. Restrict access to affected logs, artifacts, issues, and shell history.
4. Identify the owners and repositories visible to the credential.
5. Review GitHub audit evidence for unexpected access or mutation.
6. Issue a replacement only after the exposure path is closed.

## Partial apply

`apply` does not provide a transaction spanning GitHub endpoints. Independent
groups may succeed even when another group fails.

A change whose prerequisite failed is **blocked rather than attempted**, so a
partial apply does not cascade: a child team is not sent to sit under a parent
that was never created, and a member is not added to a team that does not
exist. Blocked work says what it was waiting for.

## There is no rollback command

Adding one would be a lie. GitHub does not keep the previous value of most of
these settings, so Octoform could only restore what it happened to read a
moment earlier — and only for the run that read it.

The way back is the way forward: correct the file and run again. That works
because omission means unmanaged and a plan is deterministic, so a second run
converges on what the corrected file says rather than on what the first run
did.

### What a second run cannot recover

Some changes destroy something rather than changing it. Every one of these is
reported as `destructive` in the plan, and none of them happens because a line
was left out of a file — each has to be written:

| Destroyed | What a second run restores |
| --- | --- |
| A [deleted team](../configuration/teams.md#deleting-a-team) and its child teams | An empty team with the same slug. Not its members, and not the repository grants it carried. |
| A [deleted custom property definition](../configuration/custom-properties.md#removing-a-definition) | The definition. Not the value any repository held for it. |
| A [removed organization member](../commands/members.md#members-remove)'s team memberships | Nothing automatically. They have to be re-invited, accept, and be re-added. |
| A [deleted label](../configuration/collections.md#removing-an-entry) | The label. Not its place on every issue it marked. |
| A deleted milestone | The milestone. Not the issues' membership of it. |

Two more are recoverable in form but not in effect:

- **A repository made public.** Making it private again does not un-read what
  was readable while it was public.
- **A repository or default branch renamed.** Renaming back restores the name,
  not anything that was rebuilt against the new one.

## Recovery procedure

1. Preserve the failed run's sanitized output as private operational evidence.
2. Stop overlapping apply jobs for the same owner and repositories.
3. Run a fresh read-only plan against current GitHub state.
4. Separate completed, still-required, and newly blocked operations.
5. Express any deliberate reversal as explicit desired state — including the
   words that mean removal, since deleting a line reverses nothing.
6. Review and apply the new plan through the normal protected path.
7. Verify with another read-only plan.

## Recovering from an owner-level change

An organization change reaches every repository the account owns, so the blast
radius is larger and the evidence is elsewhere.

1. **`base_permission` lowered too far.** Declare the previous level and run
   again. Repository-level grants were never touched; what changed is the floor
   under them.
2. **An organization ruleset reaching more than intended.** Set
   `enforcement: evaluate` and run again. It stops blocking immediately and
   reports what it would have blocked, which is also how to find out what a
   `~ALL` condition actually covers before setting it back to `active`.
3. **A role granted too widely.** Declare the intended holders with
   `authoritative: true` and run again. Read the plan before confirming: the
   guard that refuses removing the account you are authenticated as is the only
   thing standing between an over-corrected list and a lockout.
4. **Somebody removed from the organization.** Re-invite them with
   [`members invite`](../commands/members.md#members-invite). Their team
   memberships do not come back with them.

GitHub's own audit log is the record of what happened, and it is the recovery
source Octoform is not: Octoform reports what it did in that run, and keeps
nothing between runs except a plan file you asked for.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability, privilege escalation,
token exposure, or private repository disclosure. Use the project's
[private vulnerability reporting](https://github.com/hector-ae21/octoform/security/advisories/new)
channel. Revoke an exposed credential before preparing the report.
