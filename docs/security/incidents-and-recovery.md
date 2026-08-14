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
groups may succeed even when another group fails. There is no generic rollback
command, and omission only stops management; it does not restore an earlier
value.

## Recovery procedure

1. Preserve the failed run's sanitized output as private operational evidence.
2. Stop overlapping apply jobs for the same owner and repositories.
3. Run a fresh read-only plan against current GitHub state.
4. Separate completed, still-required, and newly blocked operations.
5. Express any deliberate reversal as explicit desired state.
6. Review and apply the new plan through the normal protected path.
7. Verify with another read-only plan.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability, privilege escalation,
token exposure, or private repository disclosure. Use the project's
[private vulnerability reporting](https://github.com/hector-ae21/octoform/security/advisories/new)
channel. Revoke an exposed credential before preparing the report.
