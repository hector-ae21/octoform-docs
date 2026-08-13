# Octoform documentation

[![Documentation CI](https://img.shields.io/github/actions/workflow/status/hector-ae21/octoform-docs/pull-request.yml?branch=v0.x&logo=github&label=docs)](https://github.com/hector-ae21/octoform-docs/actions/workflows/pull-request.yml)
[![Material for MkDocs](https://img.shields.io/badge/Material_for_MkDocs-9.7.7-526cfe?logo=materialformkdocs)](https://squidfunk.github.io/mkdocs-material/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Source for the professional, versioned documentation of
[Octoform](https://github.com/hector-ae21/octoform), a declarative plan/apply
governance tool for GitHub repositories.

The published site is available at
<https://hector-ae21.github.io/octoform-docs/>. Documentation is versioned by
Octoform `MAJOR.MINOR`; every version identifies the exact application patch it
describes.

## Local development

Prerequisites:

- Python 3.13
- Node.js 24
- Docker, for the digest-pinned PlantUML renderer

```console
python -m venv .venv
.venv/bin/python -m pip install --require-hashes -r requirements.lock
npm ci
npm run render:diagrams
.venv/bin/mkdocs serve
```

On Windows PowerShell, replace `.venv/bin/` with `.venv/Scripts/`.

The Node toolchain installs the exact documented Octoform release and validates
every published configuration example against its real parser. Run every
deterministic check with:

```console
npm run verify
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for content requirements, versioning,
security boundaries, and the pull-request workflow.

## Privacy

The site has no analytics, advertising, cookie banner, remote font request, or
third-party diagram renderer. Fonts use the reader's system stack and PlantUML
diagrams are rendered locally to static SVG during verification.

## Licence

Documentation source and supporting code are available under the
[MIT License](LICENSE).
