---
title: Command-line reference
description: Choose and operate every command exposed by Octoform 0.3.
---

# Command-line reference

Octoform separates observation, planning, confirmation, and mutation into
explicit commands. Start with a read-only command and narrow the repository set
before introducing writes.

```text
octoform audit      [--config <path>]
octoform plan       [--config <path>] [--repo <name>] [--type <type>]
octoform apply      [--config <path>] [--repo <name>] [--type <type>] [--yes]
octoform classify   [--config <path>] [--apply]
octoform properties sync [--config <path>]
```

## Choose a command

| Command | Primary purpose | Writes to GitHub |
| --- | --- | --- |
| [`audit`](audit.md) | Inventory repositories and report compliance findings | Never |
| [`plan`](plan.md) | Compare resolved policy with observed state | Never |
| [`apply`](apply.md) | Show, confirm, and execute an in-memory plan | Yes |
| [`classify`](classify.md) | Propose missing repository types | Only with `--apply` |
| [`properties sync`](properties-sync.md) | Synchronize the organization type property and declared values | Yes |

## Common options

| Option | Commands | Meaning |
| --- | --- | --- |
| `--config <path>` | All | Root configuration; defaults to `octoform.yml` in the working directory. |
| `--repo <name>` | `plan`, `apply` | Limit policy evaluation to one exact repository. |
| `--type <type>` | `plan`, `apply` | Limit policy evaluation to repositories with one resolved type. |
| `--yes`, `-y` | `apply` | Skip interactive confirmation. |
| `--apply` | `classify` | Persist proposals instead of printing them only. |
| `--help`, `-h` | All | Print usage and exit successfully. |

Options unknown to the released CLI, missing option values, and invalid
command or subcommand forms are usage errors. See the
[execution contract](execution-contract.md) for authentication, exit codes,
failure categories, and programmatic alternatives.
