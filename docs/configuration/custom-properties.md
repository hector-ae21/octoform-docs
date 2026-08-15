---
title: Custom properties
description: Define an organization's custom properties and give repositories values for them, without a write silently resetting the fields the file never mentioned.
---

# Custom properties

Custom properties are one GitHub feature with two halves that behave nothing
alike. The organization **defines** a property; a repository **answers** it.
The configuration keeps them apart, because the API does.

| Half | Where it is declared | What it is |
| --- | --- | --- |
| Definition | `organization.properties.<name>` | The property exists, what kind of value it holds, and who may set it |
| Value | `properties.<name>` in any policy layer | What one repository answers |

Nothing can be declared on the organization side that a repository could
answer, and no repository can answer a property nobody defined.

## `organization.properties`

```yaml title="octoform.yml"
owner: example-org

organization:
  properties:
    tier:
      value_type: single_select
      description: How closely this repository is watched
      allowed_values: [bronze, silver, gold]
      default_value: bronze
      values_editable_by: org_actors
    public-api:
      value_type: true_false
      description: Whether this repository publishes a supported interface
```

**Shape:** a map keyed by property name. Each value is a definition object, or
`null` to stop managing that property.

| Field | Required | Meaning |
| --- | --- | --- |
| `value_type` | Yes | `string`, `url`, `true_false`, `single_select`, or `multi_select`. |
| `description` | No | Shown wherever the property is offered. |
| `required` | No | Whether every repository must carry a value for it. |
| `default_value` | No | The value a repository gets when it states none. |
| `allowed_values` | No | What a select may offer, up to the 200 GitHub stores. |
| `values_editable_by` | No | `org_actors` or `org_and_repo_actors`. |
| `require_explicit_values` | No | Whether a repository must answer rather than inherit the default. |
| `mode` | No | `present` (the default) or `absent`. |

### The write replaces, so the read comes first

GitHub's definition endpoint does not patch. Its own words are that missing
optional values "will fall back to default values, previous values will be
overwritten". Sending only the field a policy mentions is therefore how
correcting a description silently resets who may edit the values.

Octoform reads the current definition, lays the declared fields over it, and
sends the union. Two consequences follow, and both are visible in a plan:

- A definition that could **not** be read is a definition that cannot be
  written. There would be nothing to carry forward, so every declared property
  blocks rather than only the ones that look different.
- A property the enterprise defined is visible to the organization and refuses
  to be changed by it. That is reported as a block, not attempted.

```text
1 not applied:

  (example-org: the organisation itself)
    organization.properties.tier: (unreadable) -> tier: single_select  [skipped: could not read the current custom property definitions, and writing one replaces every field of it]
```

!!! warning "Fixed in 0.5.0"

    Earlier releases sent the allowed values alone. On a property that already
    existed, that reset its description, its default value and who may edit it
    — every run, silently. If you ran `properties sync` against a `0.4` or
    earlier release, check those three fields before assuming the definitions
    are as you left them.

### Risk

A definition change is `sensitive` when it demands something of every
repository the organization owns, and `normal` otherwise:

| Change | Risk |
| --- | --- |
| `required: true` | `sensitive` |
| `require_explicit_values: true` | `sensitive` |
| Dropping a value from `allowed_values` | `sensitive` — repositories that hold it now hold a value the definition no longer offers |
| A description, a new optional property, a new allowed value | `normal` |
| `mode: absent` | `destructive` |

### Removing a definition

```yaml
organization:
  properties:
    legacy-tier:
      value_type: string
      mode: absent
```

Deleting a definition deletes every value every repository held for it. There
is no way back: the values are not kept anywhere octoform can read them
afterwards. It is reported as `destructive`, and it never happens because a
line was removed from the file — `mode: absent` has to be written.

## Repository values

```yaml
defaults:
  properties:
    tier: bronze

types:
  service:
    properties:
      tier: gold
      public-api: 'true'

repos:
  example-tool:
    properties:
      tier: silver
```

**Shape:** a map of property name to value, in any policy layer. Values are
strings, or lists of strings for a `multi_select`.

| Declared | Meaning |
| --- | --- |
| A string or list | Set the property to that value |
| `''` or `[]` | Unset the property on this repository |
| `null` | Stop managing this property at this layer |
| Omitted | Do not introduce a value at this layer |

`''` and `null` are deliberately different. `null` already means "stop
managing" everywhere in the configuration, so clearing a value needs its own
word.

Property values are reported as `sensitive`, because a property value can
decide which [organization rulesets](organization-rulesets.md) govern a
repository. Changing `tier` from `bronze` to `gold` can be a change to what is
enforced on the default branch.

### One write for many repositories

Repositories that ask for exactly the same values travel together: the
organization-wide value endpoint takes one list of properties for a group of
repositories, so a run over a hundred repositories of the same type costs one
request rather than a hundred.

The endpoint takes **thirty repositories per request**, and octoform splits
larger groups into batches of thirty. A repository whose values depend on
something else in the same run — a definition being created, for instance — is
written on its own instead, because a shared write shares its outcome.

## `properties sync`

[`octoform properties sync`](../commands/properties-sync.md) converges the
definitions and the declared values without running the rest of a plan. It is
the same model and the same guarantees; it is narrower in what it looks at.

## Recovery

- A definition: declare the fields you want and run again. Every field the
  configuration is silent about keeps whatever the organization currently has.
- A value: declare the previous value, or `''` to clear it.
- A deleted definition: not recoverable. Redefining the property brings the
  definition back empty of values, and every repository has to answer again.
