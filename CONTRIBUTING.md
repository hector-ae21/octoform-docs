# Contributing

Thank you for improving Octoform's documentation. Contributions should make a
reader more successful at evaluating, configuring, operating, automating,
securing, troubleshooting, or contributing to the product.

## Content contract

- Describe released, version-specific behavior unless a page is explicitly a roadmap.
- Lead with the reader's goal and use product language.
- State prerequisites, permissions, scope, expected plan, result, and recovery for procedures.
- Never include real tokens, private repository data, or identifiable production examples.
- Do not expose private planning or development context in public content.
- Keep architectural rationale in public architecture or decision records when it benefits users and contributors.

## Development setup

Use Python 3.13 and Node.js 24. Dependencies are exact and lock files are
required for reproducible CI builds.

=== "macOS and Linux"

    ```bash
    python3.13 -m venv .venv
    .venv/bin/python -m pip install --require-hashes -r requirements.lock
    npm ci
    .venv/bin/mkdocs serve
    ```

=== "PowerShell"

    ```powershell
    py -3.13 -m venv .venv
    .venv\Scripts\python -m pip install --require-hashes -r requirements.lock
    npm ci
    .venv\Scripts\mkdocs serve
    ```

## Verification

```console
npm run verify
```

The command checks Markdown, spelling, Mermaid syntax, a strict MkDocs build,
generated HTML, internal links, external runtime resources, representative
WCAG 2.2 AA accessibility, and
common secret patterns. It must finish without rewriting tracked sources.

## Versioning

Published documentation is immutable by `MAJOR.MINOR`. The version selector is
provided by Mike. Older versions display a warning and remain available for
operators who have not upgraded Octoform.

## Pull requests

Use a focused branch from `v0.x`. The pull-request workflow builds and uploads
an isolated preview artifact; it cannot deploy the public site. Include the
application issue or release that establishes any behavior you document.
