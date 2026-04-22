# SkillMesh Package Format v0

This document defines the initial canonical package format for SkillMesh. The goal is not to erase runtime differences. The goal is to represent a skill once, declare overlays explicitly, and generate target-specific artifacts with transparent transformations.

## Goals

- keep one canonical source of truth
- support runtime-specific and model-specific overlays without forked repos
- make resolver behavior deterministic and inspectable
- preserve enough metadata to validate and preview target exports

## Non-Goals

- pretending all runtimes support the same features
- auto-merging incompatible behaviors without warnings
- replacing native runtime packaging forever

## Package Layout

```text
skill/
├── skillmesh.yaml
├── SKILL.md
├── resources/
├── examples/
├── tests/
├── overlays/
│   ├── runtime/
│   │   ├── codex/
│   │   │   ├── SKILL.md
│   │   │   └── skillmesh.overlay.yaml
│   │   └── openclaw/
│   │       ├── SKILL.md
│   │       └── skillmesh.overlay.yaml
│   ├── model-family/
│   │   ├── gpt/
│   │   │   ├── SKILL.md
│   │   │   └── skillmesh.overlay.yaml
│   │   ├── claude/
│   │   └── gemini/
│   └── model/
│       └── gpt-5/
│           ├── SKILL.md
│           └── skillmesh.overlay.yaml
└── releases/
    └── .gitkeep
```

## Canonical Files

### `SKILL.md`

The canonical human-authored instruction file. This remains the primary source for shared skill behavior.

### `skillmesh.yaml`

The canonical manifest for metadata, compatibility declarations, overlays, packaging, and release behavior.

Suggested shape:

```yaml
schema_version: 0
id: com.example.skill.audit-pr
name: Audit PR
version: 0.1.0
summary: Review pull requests for behavioral regressions and missing tests.
author:
  name: Example Org
license: MIT
source:
  canonical_files:
    - SKILL.md
    - resources/**
targets:
  runtimes:
    - codex
    - openclaw
  model_families:
    - gpt
    - claude
    - gemini
constraints:
  requires_tools:
    - github
  disallowed_environments: []
  max_context_tokens: null
overlays:
  runtime:
    codex: overlays/runtime/codex
    openclaw: overlays/runtime/openclaw
  model_family:
    gpt: overlays/model-family/gpt
    claude: overlays/model-family/claude
    gemini: overlays/model-family/gemini
  model: {}
exports:
  local:
    enabled: true
  registry:
    enabled: false
```

## Overlay Rules

Overlays exist to express intentional divergence, not silent mutation.

Each overlay may contribute:

- replacement or appended instruction content
- runtime-specific metadata
- file include or exclude directives
- compatibility annotations

Each overlay should be minimal. If behavior is shared by most targets, it belongs in the base package.

### Overlay Precedence

Resolver precedence should be deterministic:

1. base package
2. runtime overlay
3. model-family overlay
4. explicit model overlay

If two overlays modify the same field incompatibly, the resolver must stop and emit a conflict instead of choosing arbitrarily.

### Overlay Metadata

`skillmesh.overlay.yaml` can describe how the overlay applies:

```yaml
applies_to:
  runtime: codex
merge:
  instruction_mode: append
  metadata_mode: merge
compatibility:
  notes:
    - Uses Codex-specific install path metadata.
```

## Compatibility Model

Compatibility should be validated, not inferred by vibe.

Each target result should produce:

- status: `compatible`, `compatible_with_warnings`, `requires_adapter`, or `incompatible`
- preserved fields
- dropped fields
- transformed fields
- warnings
- blocking issues

### Initial Runtime Checks

#### Codex

Validate:

- required instruction file presence
- expected install layout
- supported metadata fields
- tool or capability assumptions declared by the skill

#### OpenClaw

Validate:

- required instruction file presence
- expected install layout
- unsupported metadata or path conventions
- capability mismatches against declared constraints

## Resolver Behavior

Downstream clients install by skill ID plus local environment context.

Resolver input should include:

- skill ID
- requested version or range
- runtime
- model family
- explicit model, if known
- available tools or capabilities

Resolver output should include:

- selected artifact
- overlays applied in order
- exact-match or fallback reason
- compatibility warnings

### Resolution Strategy

1. Find package by ID and version constraint.
2. Confirm runtime compatibility.
3. Prefer explicit model overlay if compatible.
4. Otherwise prefer model-family overlay if compatible.
5. Otherwise use runtime overlay plus base.
6. Otherwise use base if explicitly marked compatible.
7. If no compatible path exists, fail with reasons.

## Release Metadata

Every publishable build should create immutable metadata describing what was actually shipped.

Suggested release record:

```yaml
release_version: 0.1.0
package_id: com.example.skill.audit-pr
created_at: 2026-04-22T00:00:00Z
targets:
  - target_id: codex-gpt
    runtime: codex
    model_family: gpt
    overlays_applied:
      - overlays/runtime/codex
      - overlays/model-family/gpt
    compatibility_status: compatible_with_warnings
    preserved:
      - SKILL.md
    transformed:
      - install.metadata
    dropped: []
    warnings:
      - Runtime-specific metadata normalized during export.
artifacts:
  - path: dist/codex-gpt/
    digest: sha256:example
```

## Preview Requirements

Before install or publish, the product should render:

- effective instruction text
- final file tree
- added, changed, and removed files
- compatibility summary per target
- generated adapters or transformations

This preview is a product requirement, not a debugging tool. It is how users decide whether the generated artifact is trustworthy.

## Local Registry Direction

The MVP should support a local or git-backed catalog before any public registry.

Minimum registry responsibilities:

- index package metadata
- store immutable release artifacts
- store compatibility summaries
- resolve latest compatible version for a target

## Guardrails

- Never mark a target as supported without explicit validation.
- Never hide dropped or transformed fields.
- Never auto-promote generated overlays to authored truth.
- Prefer base plus overlays over new independent variants.
