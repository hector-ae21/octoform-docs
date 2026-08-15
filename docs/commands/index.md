---
title: Command-line reference
description: Choose and operate every command exposed by Octoform 0.5.
---

# Command-line reference

Octoform separates observation, planning, confirmation, and mutation into
explicit commands. Start with a read-only command and narrow the account and
repository set before introducing writes.

```text
octoform audit      [--config <path>] [--owner <login>]
octoform plan       [--config <path>] [--owner <login>] [--repo <name>] [--type <type>]
                    [--concurrency <n>] [--fail-fast] [--format <text|json>]
                    [--out <path>] [--expires-in <minutes>]
octoform apply      [--config <path>] [--owner <login>] [--repo <name>] [--type <type>]
                    [--concurrency <n>] [--fail-fast] [--yes]
octoform apply      --plan <path> [--yes]
octoform classify   [--config <path>] [--owner <login>] [--apply]
octoform properties sync [--config <path>] [--owner <login>]
octoform config validate [--config <path>]
octoform config migrate  [--config <path>] [--write]
octoform inspect config       [--config <path>] [--owner <login>] [--format <text|json>]
octoform inspect capabilities [--config <path>] [--owner <login>] [--repo <name>] [--format <text|json>]
octoform inspect members      [--config <path>] [--owner <login>] [--format <text|json>]
octoform members invite  --user <login> [--role <role>] [--owner <login>] [--yes]
octoform members remove  --user <login> [--owner <login>] [--yes]
octoform members convert --user <login> [--owner <login>] [--yes]
```

## Choose a command

| Command | Primary purpose | Writes to GitHub |
| --- | --- | --- |
| [`audit`](audit.md) | Inventory repositories and report compliance findings | Never |
| [`plan`](plan.md) | Compare resolved policy with observed state, and optionally save the result | Never |
| [`apply`](apply.md) | Show, confirm, and execute a plan | Yes |
| [`classify`](classify.md) | Propose missing repository types | Only with `--apply` |
| [`properties sync`](properties-sync.md) | Synchronize the organization type property and declared values | Yes |
| [`config validate`](config.md) | Load and report a configuration offline | Never |
| [`config migrate`](config.md) | Convert a single-owner file to the multi-owner shape | Never |
| [`inspect config`](inspect.md) | Print the fully resolved configuration for the selection | Never |
| [`inspect capabilities`](inspect.md) | Print what each selected account supports, and why | Never |
| [`inspect members`](members.md) | Print who is in the organization, and which named people are not | Never |
| [`members invite`](members.md) | Invite one person, who is emailed about it | Yes, after asking |
| [`members remove`](members.md) | Remove one person, or withdraw their unanswered invitation | Yes, after asking |
| [`members convert`](members.md) | Turn one member into an outside collaborator | Yes, after asking |

`config validate`, `config migrate`, and `inspect config` never contact GitHub
at all. They need no token.

The three `members` commands are the only writes that are not part of a plan.
Organization membership is deliberately not declarative; see
[why these are commands and not policy](members.md#why-these-are-commands-and-not-policy).

## Common options

| Option | Commands | Meaning |
| --- | --- | --- |
| `--config <path>` | All | Root configuration; defaults to `octoform.yml` in the working directory. |
| `--owner <login>` | All GitHub-facing commands, `inspect config` | Limit the run to the named account. Repeatable. A login the configuration does not declare is an error, never a silent no-op. |
| `--repo <name>` | `plan`, `apply`, `inspect capabilities` | Limit to one exact repository. Accepts a qualified `owner/name`. |
| `--type <type>` | `plan`, `apply` | Limit policy evaluation to repositories with one resolved type. |
| `--user <login>` | `members invite`, `remove`, `convert` | The one person the command is about. Required. |
| `--role <role>` | `members invite` | `admin`, `direct_member` or `billing_manager`. Defaults to `direct_member`. |
| `--concurrency <n>` | `plan`, `apply` | Repositories worked on at once within an account. Defaults to `4`. |
| `--fail-fast` | `plan`, `apply`, `classify`, `properties sync` | Stop at the first account that fails, instead of continuing through the rest. |
| `--format <text\|json>` | `plan`, `inspect config`, `inspect capabilities`, `inspect members` | Output shape. Defaults to `text`. |
| `--out <path>` | `plan` | Save the reviewed plan for a later `apply --plan`. |
| `--expires-in <minutes>` | `plan --out` | How long the saved plan stays valid. Defaults to `60`. |
| `--plan <path>` | `apply` | Apply exactly a previously saved plan instead of planning again. |
| `--strict` | All GitHub-facing commands | Fail the run when a declaration does not apply to the account that declared it. |
| `--write` | `config migrate` | Update the file in place instead of previewing. |
| `--yes`, `-y` | `apply`, `members invite`, `members remove`, `members convert` | Skip interactive confirmation. |
| `--apply` | `classify` | Persist proposals instead of printing them only. |
| `--help`, `-h` | All | Print usage and exit successfully. |

## Selecting accounts

A configuration can describe several accounts. Without `--owner`, every
declared account is included, in declaration order. With it, only the named
ones are, and a run that touches more than one account — or that was narrowed
by a selector — prints a scope summary of which accounts are selected and
which were excluded before it does anything else.

`--repo` accepts a bare name or a qualified `owner/name`. A bare name that
matches repositories under more than one selected account is rejected, and the
error lists the qualified forms that would resolve it. A qualified selector
that contradicts an explicit `--owner` is rejected rather than silently
preferring one of the two.

Options unknown to the released CLI, missing option values, and invalid
command or subcommand forms are usage errors. See the
[execution contract](execution-contract.md) for authentication, exit codes,
failure categories, JSON output, and programmatic alternatives.
