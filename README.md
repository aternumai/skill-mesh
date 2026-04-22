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
- compatibility validation for Codex and OpenClaw
- model-family overlays for `gpt`, `claude`, and `gemini`
- local export and install
- release preview with diff
- versioned local registry or git-backed catalog

## Repository Layout

```text
.
├── README.md
└── docs
    ├── package-format.md
    └── prd.md
```

## Documents

- [`docs/prd.md`](./docs/prd.md): one-page product brief for the MVP
- [`docs/package-format.md`](./docs/package-format.md): canonical package format, overlay model, resolver behavior, and release metadata

## Design Principles

- Canonical source over forked copies
- Visible compatibility over silent abstraction
- Base plus overlays over variant sprawl
- Generated adapters are labeled as generated
- Publishing and installation are previewed and reversible

## Near-Term Build Sequence

1. Define the canonical package format and manifest.
2. Implement compatibility rules for Codex and OpenClaw.
3. Build target rendering and release preview.
4. Add local export/install flows.
5. Add a versioned local catalog and resolver.

