---
title: Security settings
description: Configure repository security features while respecting GitHub capability evidence in Octoform 0.4.
---

# Security settings

Security features span several GitHub endpoints and availability tiers.
Octoform reads each requested setting before planning and blocks mutation when
GitHub does not expose trustworthy current state.

## `security`

**Shape:** optional toggle object inside any policy layer.

```yaml
defaults:
  security:
    vulnerability_alerts: true
    automated_security_fixes: true
    private_vulnerability_reporting: true
```

| Field | Apply operation |
| --- | --- |
| `vulnerability_alerts` | Enable or disable Dependabot alerts |
| `automated_security_fixes` | Enable or disable Dependabot security updates |
| `private_vulnerability_reporting` | Enable or disable private vulnerability reporting |
| `secret_scanning` | Repository update under `security_and_analysis` |
| `secret_scanning_push_protection` | Repository update under `security_and_analysis` |
| `code_scanning_default_setup` | Update CodeQL default setup |

Each field is tri-state. A concrete boolean manages it; `null` cancels an
inherited value; omission contributes no policy at that layer.

## Capability evidence

Private repository access to secret scanning and CodeQL default setup depends
on GitHub availability and permissions. GitHub may omit unavailable fields
instead of returning `false`. Octoform treats omission as unreadable and
reports a blocked change.

The configuration never names a GitHub commercial plan. Owner kind,
repository visibility, token permissions, returned fields, and endpoint
responses provide the evidence used for each plan.

## CodeQL setup boundary

CodeQL default setup is incompatible with a repository-managed advanced setup
workflow. Enabling default setup can disable the advanced configuration. Leave
`code_scanning_default_setup` unmanaged for repositories that own a
`codeql.yml` workflow unless the migration is deliberate and separately
reviewed.

## Plan and apply behavior

- Readable drift becomes an executable change.
- Unavailable or unreadable state becomes a blocked change with its reason.
- Repository-update security fields can be grouped with feature, merge, and
  repository settings.
- Dedicated security endpoints are attempted independently, so one failure
  does not suppress unrelated endpoint groups.

## Recovery

Declare and apply the previous boolean value. If a GitHub plan or permission
change makes the current state unreadable, Octoform cannot safely perform the
reversal; restore access or change the setting directly in GitHub, then run a
new plan. Removing the field only stops future management.

See [Security and trust](../security/index.md) for credential selection, token
lifecycle, output exposure, and incident response.
