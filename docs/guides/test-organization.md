---
title: Verify against a test organization
description: Prove Octoform's organization governance converges, stays converged, and refuses what it says it refuses, on an organization you can afford to throw away.
---

# Verify against a test organization

Everything on the [organization guide](organization-governance.md) is written
for an organization that already has people and repositories in it. This page
is for the run before that one: a disposable organization, where the answer to
"what does `base_permission: none` actually do here" costs nothing to find out.

It is also the procedure Octoform's own release verification follows, which is
why it is written as a runbook rather than as advice.

## What it proves

Three things, in order of how easy they are to get wrong:

1. **Convergence.** Applying the policy produces the state the policy
   describes.
2. **Idempotence.** Applying it again does nothing. A second run that still
   reports changes means a value Octoform writes is not the value it reads
   back, and that is the defect this exercise exists to find.
3. **Refusal.** The things Octoform says it will not do, it does not do — even
   though GitHub would perform every one of them.

## 1. Create the organization

There is no command for this step, and there is no way to add one: GitHub's
REST API has no endpoint that creates an organization. `/organizations` is a
listing, and the administrative endpoint that can create one exists only on
GitHub Enterprise Server.

Create it at [github.com/organizations/plan](https://github.com/organizations/plan)
on the Free plan, under a name you will not mind deleting. Deleting it later is
also web-only, for the same reason.

!!! warning "Use a name nobody will mistake for a real one"

    Every command below takes `--config`, and a configuration names its
    account. A runbook that says `--owner` on every line is one paste away from
    running against the wrong organization. Name the sandbox so that a mistake
    is visible in the plan's first line.

## 2. Seed two repositories

Two, not one: a repository the property-targeted ruleset reaches and a
repository it does not.

```console
gh repo create example-sandbox/example-sandbox-service --public --add-readme
gh repo create example-sandbox/example-sandbox-tool    --public --add-readme
```

Public repositories on purpose. Organization rulesets and some security
settings are unavailable to a Free organization's private repositories, and a
verification run should be measuring Octoform rather than a plan tier.

## 3. Find out what this organization supports

```console
octoform inspect capabilities --config octoform.yml
octoform inspect members      --config octoform.yml
```

Record both. They are the baseline the rest of the run is read against, and the
first one decides how much of the policy can converge at all:

- **Organization rulesets unavailable.** Expected on some plans. That part of
  the policy will report as blocked with the reason, which is a correct
  observation rather than a failure. Note it and continue.
- **Organization roles unavailable.** The same. Roles are probed in step 6
  rather than converged, for exactly this reason.

`inspect members` on a fresh organization should list you as the only owner,
nobody else, and no invitations. It should also report that the configuration
names `example-operator`, who is in no part of the organization — which is the
finding working correctly, and the login to replace with your own before
applying.

## 4. The policy

```yaml title="octoform.yml"
--8<-- "docs/examples/files/test-organization/octoform.yml"
```

[:material-download: Download YAML](../examples/files/test-organization/octoform.yml){ .octoform-example-download download="octoform.yml" aria-label="Download the test-organization YAML" }

Nothing in it removes anything. The refusals get their own step, so that a
mistake in the file cannot delete something on a real organization somebody
pointed it at by accident.

## 5. Converge, then converge again

```console
octoform plan  --config octoform.yml
octoform apply --config octoform.yml
octoform plan  --config octoform.yml
```

Read the first plan before confirming. It should group the owner-level work
under a heading naming the organization, and the repository work under each
repository.

**The third command is the test.** It must report that there is nothing to do:

```text
2 repositories match the configuration. Nothing to do.
```

Anything still listed is drift that a run just created, and each family has a
different cause worth naming separately:

| Still reported on the second run | What it means |
| --- | --- |
| A property definition | A field is written under one name and read under another, or the carry-forward dropped something |
| A team | The slug the file declares is not the slug GitHub assigned from the display name |
| A membership | A pending invitation is not being counted as somebody already asked |
| An access grant | The permission level is being compared in one of GitHub's other spellings |
| A ruleset | A rule is being read back in a different shape from the one that was sent |
| A label | The colour comparison is not normalizing the leading `#` or the case |

## 6. Probe the refusals

Each of these should be **refused**, and the reason should say why. None of
them is an API error: GitHub performs every one of them happily.

Add one at a time to the policy, run `plan`, read the reason, and take it out
again. `plan` is read-only, so none of them needs an apply to prove.

### The last owner, and yourself

```console
octoform members remove --user <your-own-login>
```

Refused twice over on a fresh organization, since you are both the only owner
and the account the run is authenticated as:

```text
Refused: "<login>" is the only owner of this organisation, and an organisation with no owners cannot be administered by anybody; "<login>" is the account this run is authenticated as, and it could not put itself back.
```

### An authoritative membership that names nobody

```yaml
sandbox-oncall:
  membership:
    authoritative: true
```

> an authoritative membership that names nobody would empty the team, which is
> not something a blank section should say

### An authoritative membership that would remove you

```yaml
sandbox-oncall:
  membership:
    authoritative: true
    members: [example-someone-else]
```

> it would remove "&lt;login&gt;", the account this run is authenticated as,
> which could be the last change that account can make to this team

### Deleting a parent whose children are declared

```yaml
sandbox-platform:
  mode: absent
```

> deleting it would delete sandbox-oncall with it, which the configuration
> declares should exist

### A secret team with a parent

```yaml
sandbox-oncall:
  parent: sandbox-platform
  privacy: secret
```

> a team with a parent cannot be secret, so declare privacy closed or leave it
> out

### Teams whose parents lead back round

```yaml
sandbox-platform:
  parent: sandbox-oncall
sandbox-oncall:
  parent: sandbox-platform
```

> its parents lead back to itself: sandbox-platform under sandbox-oncall under
> sandbox-platform

### A role that does not exist

```yaml
organization:
  roles:
    Sandbox release manager:
      users: [example-operator]
```

> no organisation role called "Sandbox release manager", and there is no
> endpoint that creates one, so this is a name rather than a definition

### An organization ruleset selected two ways at once

```yaml
repositories:
  include: [example-sandbox-service]
  properties:
    - name: tier
      values: [gold]
```

> declare repositories by name or by property, not both: GitHub takes one
> repository condition beside the refs

### A merge queue on an organization ruleset

```yaml
organization:
  rulesets:
    - name: sandbox-default-branches
      target_branches: ['~DEFAULT_BRANCH']
      merge_queue:
        merge_method: SQUASH
      repositories:
        include: ['~ALL']
```

> a merge queue rule is not among the rules an organisation ruleset can carry

## 7. Probe the personal-account boundary

The same policy, pointed at a personal account, must classify every
organization-only declaration as not applicable **before** any mutating call:

```console
octoform plan --config personal.octoform.yml
octoform plan --config personal.octoform.yml --strict
```

Without `--strict`, each one is reported and the run continues. With it, the
run fails. Neither should reach an endpoint.

## 8. Record what the plan tier decided

Anything the run reported as blocked because this organization does not support
it is worth writing down alongside the plan tier, because it is the difference
between "Octoform cannot do this" and "this organization cannot". The two look
identical in a plan without that note, and only one of them is a defect.

## 9. Throw it away

Delete the organization in its settings. Web-only, like creating it.

Deleting the organization is the only cleanup needed, and it is the reason this
runbook uses a disposable one rather than a spare team in a real organization:
a deleted team, a deleted property definition and a removed member's team
memberships are [not recoverable](../security/incidents-and-recovery.md#what-a-second-run-cannot-recover),
and a verification run is exactly where you want to be able to stop caring.
