# SkillMesh

SkillMesh is a portable skill workspace and registry for agent-tooling builders who need one canonical skill source to validate, version, and ship across multiple runtimes and model families.

Core promise: author once, validate everywhere, ship verified variants.

## Why This Exists

Skill authors are currently forced to manage portability by hand:

- comparing runtime docs manually
- duplicating skills into per-runtime repos
- inventing ad hoc folder conventions
- guessing whether metadata or prompts will behave the same elsewhere

SkillMesh exists to replace that workflow with a structured workspace that makes compatibility, transformation, and release artifacts visible before anything gets installed or published.

## Product Shape

SkillMesh is a workspace layer, not a chat-first assistant.

The core workflow requires:

- explicit package structure
- compatibility analysis
- target previews and diffs
- approval before publish or install
- versioned artifacts and release history

Chat can explain warnings or propose overlays, but the product's center of gravity is structured review and release control.

## MVP

The initial wedge is intentionally narrow:

- canonical skill repo format
- compatibility validation for Codex, OpenClaw, and Cloud Code
- model-family overlays for `gpt`, `claude`, and `gemini`
- local export and install
- release preview with diff
- versioned local registry or git-backed catalog
- version-aware validation grounded in official docs and release tags
- paid private registry publishing as the simplest MVP monetization layer

## Repository Layout

```text
.
├── README.md
├── package.json
├── tsconfig.json
├── src
│   ├── cli.ts
│   ├── manifest.ts
│   ├── types.ts
│   └── validator.ts
├── examples
│   └── hello-skill
└── docs
    ├── package-format.md
    └── prd.md
```

## Documents

- [`docs/prd.md`](./docs/prd.md): one-page product brief for the MVP
- [`docs/package-format.md`](./docs/package-format.md): canonical package format, overlay model, resolver behavior, and release metadata

## First Executable Slice

The repo now includes a minimal TypeScript CLI that validates a canonical `skillmesh.yaml` package and prints runtime compatibility summaries.

Current scope:

- load a package manifest
- validate required package structure
- inspect runtime targets for `codex`, `openclaw`, and `cloud-code`
- surface validation sources, warnings, and blocking issues
- provide an example package under `examples/hello-skill`

Example usage after installing dependencies and building:

```bash
npm install
npm run build
node dist/cli.js validate examples/hello-skill
```

## Design Principles

- Canonical source over forked copies
- Visible compatibility over silent abstraction
- Base plus overlays over variant sprawl
- Generated adapters are labeled as generated
- Publishing and installation are previewed and reversible

## Near-Term Build Sequence

1. Expand manifest validation into a formal schema.
2. Implement version-aware compatibility rules from real runtime sources.
3. Add target rendering and release preview generation.
4. Add local export and install flows.
5. Add a versioned local catalog, resolver, and paid private publishing path.
