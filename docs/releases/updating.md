---
title: Update Octoform
description: Update Octoform with matched documentation, configuration validation, narrow planning, and recovery evidence.
---

# Update Octoform

Treat an Octoform update as a governance-tool change: review behavior first,
validate configuration against the exact package, and observe a narrow scope
before permitting mutation.

## Before updating

1. Record the installed version with your package manager.
2. Read the [documentation changelog](changelog.md) and application Release
   notes between the installed and target patches.
3. Open documentation whose `MAJOR.MINOR` matches the target package.
4. Review configuration, CLI, permissions, limitations, and automation changes.
5. Preserve the current lockfile and configuration revision as the recovery
   point.

## Validate the target

Install an exact version in a reviewed branch or isolated workspace:

```console
npm install --save-exact @hector21/octoform@0.3.2
```

This command shows the latest patch verified by the current `0.3`
documentation publication. Replace it only with another `0.3.x` patch after
reviewing its changelog entry.

Run project tests and load every root configuration used in production. If a
shared preset serves several owners, validate every consuming root rather than
only the preset file.

## Observe before mutation

1. Run `audit` to confirm owner and repository discovery.
2. Run `plan --repo <name>` for a representative repository.
3. Inspect executable, warning, and blocked entries.
4. Expand to `--type <type>` before reviewing the complete owner.
5. Update protected automation only after interactive or isolated validation.

Do not compare only console formatting. Confirm selected repositories, resolved
policy, capability decisions, endpoint effects, and recovery behavior.

## Apply and recover

Use normal confirmation for the first apply. After partial failure, run a fresh
plan because successful endpoint groups are not automatically rolled back.

If the target version is unsuitable, restore the previous package and lockfile,
then plan again. Downgrading the executable does not revert GitHub values already
applied; restore those by declaring their previous values and reviewing another
plan.
