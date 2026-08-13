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

Use Python 3.13, Node.js 24, and Docker. Dependencies and the PlantUML container
digest are exact so local and CI builds render the same content.

=== "macOS and Linux"

    ```bash
    python3.13 -m venv .venv
    .venv/bin/python -m pip install --require-hashes -r requirements.lock
    npm ci
    npm run render:diagrams
    .venv/bin/mkdocs serve
    ```

=== "PowerShell"

    ```powershell
    py -3.13 -m venv .venv
    .venv\Scripts\python -m pip install --require-hashes -r requirements.lock
    npm ci
    npm run render:diagrams
    .venv\Scripts\mkdocs serve
    ```

## Verification

```console
npm run verify
```

The command checks Markdown, spelling, every example against the exact published
Octoform package, PlantUML sources and generated SVG, a strict MkDocs build,
generated HTML, internal and external links, external runtime resources,
representative WCAG 2.2 AA accessibility, and common secret patterns. It must
finish without rewriting tracked sources.

## Versioning

Published documentation uses complete `MAJOR.MINOR.PATCH` versions. Its
`MAJOR.MINOR` must match the documented Octoform release line; documentation
patches advance independently. Every merge to `main` creates an immutable tag,
GitHub Release, and Pages version automatically. The line, `latest`, and
`stable` aliases move to that verified version. Older patches remain available
for operators who need an earlier documentation snapshot.

## Pull requests

Use a focused branch from `main`. The pull-request workflow builds and uploads
an isolated preview artifact; it cannot deploy the public site. Include the
application issue or release that establishes any behavior you document.
