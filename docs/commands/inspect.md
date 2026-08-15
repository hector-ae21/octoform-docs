---
title: octoform inspect
description: See the configuration Octoform resolved, and what it believes each account supports.
---

# `octoform inspect`

Two read-only commands for answering "why did it decide that?" without
inferring the answer from a plan. Neither mutates anything.

```console
octoform inspect config       --config octoform.yml
octoform inspect config       --config octoform.yml --owner example-org --format json
octoform inspect capabilities --config octoform.yml
octoform inspect capabilities --config octoform.yml --format json
```

## `inspect config`

Prints the fully resolved configuration for the selected accounts: imports
followed, named policies folded in, precedence applied. Offline, the same
guarantee [`config validate`](config.md) makes — it needs no token.

Use it when a repository is getting a setting you did not expect, or is not
getting one you did. The resolved shape shows which values survived
precedence, without having to trace the layers by hand.

It shows the final resolved shape only. Which layer each value came from —
root defaults, an account's own defaults, a type, a repository entry — is not
reported in this release: the resolver does not track that per field.

## `inspect capabilities`

Prints, for each selected account, what Octoform resolved about it and what it
can therefore do. This one does contact GitHub, because that is where the
evidence is.

```text
Organisation: example-org (id 12345678) — team plan
  organisation-wide rulesets: available
  no declarations that do not apply to this owner

Personal account: example-personal (id 87654321)
  organisation-wide rulesets: not available
  declarations that do not apply to this owner:
    classify.property: custom properties are an organisation feature
```

Each line is evidence, not a guess:

- the account kind — organisation or personal — resolved from the API rather
  than assumed from the configuration;
- GitHub's numeric identity for the account, which is stable across renames
  and is what a [saved plan](plan.md#saving-a-plan) verifies against;
- whether organisation-wide rulesets are available;
- every declaration in the configuration that does not apply to this kind of
  account, with the reason it does not.

A declaration that does not apply is reported, never silently ignored. Pass
`--strict` to any GitHub-facing command to turn those reports into a failed
run instead.

## Output

Both support `--format json`, wrapping their result in the versioned envelope
described in the
[execution contract](execution-contract.md#json-output). Both exit `0` on
success, `2` on a configuration or selector error, and `inspect capabilities`
exits `3` when the token cannot authenticate.
