---
title: Classification and audit
description: Infer repository types and declare read-only compliance expectations in Octoform 0.4.
---

# Classification and audit

Classification assigns an operator-defined project type. Audit evaluates
inventory expectations. Neither feature silently becomes desired-state policy.

## `classify.property`

**Shape:** optional string naming an organization custom property.

```yaml
classify:
  property: project-type
```

For organizations, this property can supply repository types and receive
proposals from `classify --apply`. Personal accounts have no organization
custom-properties API, so they use `repos.<name>.type` or read-only rule
proposals instead.

## `classify.rules`

**Shape:** ordered list of `{ when, type }` entries.

```yaml
classify:
  rules:
    - when: { file_exists: package.json, json: { private: true } }
      type: application
    - when: { file_exists: package.json }
      type: library
    - when: { visibility: private }
      type: internal
```

| Condition | Accepted value | Evidence |
| --- | --- | --- |
| `file_exists` | Repository-relative path | GitHub file lookup |
| `json` | Shallow key/value object | Parsed file named by `file_exists` |
| `visibility` | `public` or `private` | Repository metadata |

Every condition in `when` must match. The first matching rule wins, so place
narrow conditions before broad conditions. An empty `when: {}` is a valid
catch-all. Missing JSON or JSON that does not match simply skips the rule; it is not a configuration
failure.

Rules are consumed by [`octoform classify`](../commands/classify.md). `plan`
and `apply` do not infer and persist a missing type as a side effect.

## `audit`

**Shape:** optional object at the document root.

```yaml
audit:
  require_type: true
  require_description: { visibility: public }
  require_topics: { visibility: public }
  max_topics: 8
```

| Field | Omission and behavior |
| --- | --- |
| `require_type` | Defaults to `true`; `false` disables missing-type findings. |
| `require_description.visibility` | When declared as `public` or `private`, reports matching repositories with no description. An empty object matches nothing. |
| `require_topics.visibility` | When declared as `public` or `private`, reports matching repositories with no topics. An empty object matches nothing. |
| `max_topics` | Reports repositories whose topic count exceeds the number. |

Archived repositories produce no audit findings. Findings are informational;
the [`audit` command](../commands/audit.md) exits successfully even when it
reports them.

## Mutation boundary

Audit rules never generate apply changes. Classification writes only when the
operator explicitly uses `classify --apply`, and that operation is available
only for an organization custom property. To enforce repository settings by
type, declare the type under `types` and record it separately.
