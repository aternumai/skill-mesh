# SkillMesh PRD

## Problem and User

The user is an advanced agent-tooling builder who authors reusable skills and needs them to work across runtimes like Codex, OpenClaw, and Cloud Code without maintaining separate repos, hand-written adapters, or undocumented compatibility rules.

The trigger is straightforward: they create or update a skill, then need to know:

- whether it is portable
- how it installs into each target runtime
- how to keep optimized runtime or model variants without losing one canonical source

The current workaround is manual doc comparison, custom folder conventions, and ad hoc duplication. That process is slow, brittle, and hard to trust.

Success means a builder can author once, validate once, publish once, and let each target resolve the correct runtime-specific or model-specific variant automatically.

## Product Thesis

For AI-agent builders and teams maintaining reusable skills, SkillMesh helps them author, validate, version, and distribute portable skills with runtime-specific and model-specific variants by providing a canonical skill workspace plus compatibility adapters and registry publishing, unlike today’s manual copy-paste repos and one-off install scripts.

## Product Shape

SkillMesh is a workspace layer.

This is not primarily a chat product because the work is repeatable, stateful, and risky enough that users need visible metadata, diffs, compatibility status, and explicit release controls. Conversational help is useful as a support surface, but the primary experience should be structured.

## Primary Workflow

1. The user creates or imports a skill into a SkillMesh workspace.
2. The system parses the canonical package:
   - `SKILL.md`
   - shared resources
   - optional overlays
   - metadata
   - examples or tests
3. The user selects targets such as Codex, OpenClaw, Cloud Code, local folders, private registry, or public registry.
4. The system runs compatibility analysis for each target:
   - target runtime version and release channel
   - required fields
   - unsupported metadata
   - path layout differences
   - adapter requirements
   - packaging warnings
   - checks grounded in the target's official documentation and the relevant skill authoring standards
5. The system resolves applicable variants:
   - base skill
   - runtime overlays
   - model-family overlays such as `gpt`, `claude`, and `gemini`
   - explicit model targets when declared
6. The product shows a release preview for each target:
   - rendered instructions
   - final file tree
   - ignored files
   - effective prompts
   - compatibility score or status
   - known caveats
7. The user approves install or publish actions.
8. The system exports or publishes target-specific artifacts and records version history.
9. Downstream clients install by skill ID and let the resolver choose the best compatible variant.

## Key Surfaces or Screens

### Skill Workspace

A repo-like editor for the canonical skill package. Users edit one source of truth and inspect generated target outputs side by side.

### Compatibility Matrix

A table with rows for runtimes and models, and columns for:

- validation status
- validated runtime version
- warnings
- unsupported fields
- adapter behavior
- install destination
- source of truth for validation, such as official docs version, referenced standards, or tagged runtime release

This should answer the core question quickly: is this skill compatible with target X right now?

### Variant Resolver

A structured panel where users define:

- base instructions
- runtime overlays
- model-family overlays
- hard constraints such as required tools, max context assumptions, or disallowed environments

### Release Preview

A diffable preview of the artifact that will be published or installed for each target.

### Registry or Catalog

A searchable list of skills with version history, provenance, compatibility metadata, install targets, and the runtime versions each release was validated against. Public and private scopes should both be supported eventually, but the MVP only needs a local or git-backed catalog backed by immutable artifacts and git tags.

### Install Flow

One-click install or copy/export commands for Codex, OpenClaw, local folders, CI pipelines, or git repos.

## Trust and Safety Model

The primary trust risk is silent incompatibility.

SkillMesh should never imply a skill works everywhere unless it has explicitly passed target validation. Every rendered target should show:

- what was preserved
- what was dropped
- what was transformed
- what may behave differently
- which runtime version and release source the validation was based on

The resolver must expose its decision path plainly:

- selected variant
- fallback path
- missing target metadata
- unsupported features
- assumed runtime capabilities
- target version match or downgrade path when an exact version match is unavailable

Publishing should be reversible. Each release should preserve immutable artifacts, the effective instructions per target, and the exact runtime versions and standards used for validation. Any auto-generated overlay or adapter must be labeled as generated rather than authored truth.

## Human Handoff or Approval Points

Human approval is required before:

- publishing a new public version
- overwriting an installed skill
- promoting a generated overlay to canonical source
- marking a target as officially supported

Optional human review should trigger when:

- a target drops metadata or files
- a model-specific variant diverges substantially from base
- compatibility depends on heuristics instead of declared metadata
- the skill requests tools or behaviors unavailable in a target runtime

## MVP Scope

The MVP includes:

- canonical skill repo format
- compatibility validation for Codex, OpenClaw, and Cloud Code
- model-family overlays for `gpt`, `claude`, and `gemini`
- local export and install
- release preview and diff
- versioned local registry or git-backed catalog
- version-aware target validation using official runtime documentation and skill authoring standards
- the simplest viable monetization path: paid private registry publishing for teams

The MVP explicitly excludes:

- a broad public marketplace
- multi-tenant enterprise governance
- generalized support for every possible runtime

## Success Metrics

- time from authored skill to working install in a second runtime
- percentage of skills that validate cleanly across at least two runtimes and specific runtime versions
- number of manual per-runtime forks replaced by overlays
- publish-to-install success rate
- rate of fallback variant usage versus exact-match variant usage
- user-reported confidence that they understand what changed per target
- conversion from free local usage to paid private-registry publishing

## Open Risks

The main product risk is false abstraction. If runtimes diverge too much, a universal package could look elegant while hiding real incompatibilities. The system must surface divergence instead of masking it.

Variant sprawl is the second major risk. If users accumulate too many per-model forks, portability erodes. The product should bias toward base-plus-overlays instead of many disconnected skill copies.

There is also a governance risk. A registry can create the impression that listed skills are high quality or safe. Compatibility, quality, and trustworthiness need separate signals.

There is a version-drift risk as well. Fast-moving runtimes can invalidate compatibility assumptions quickly, especially if they change undocumented behavior. SkillMesh needs to tie validations to specific documented releases and expose when a target status has gone stale.

## Why This Gets Adopted

This product replaces repeated, high-friction portability work with a workflow that is easier to trust:

- one canonical source instead of many forks
- explicit compatibility status instead of guesswork
- preview before publish instead of silent transformation
- versioned artifacts instead of undocumented install scripts

If the product does not make those differences concrete in the first session, it will be treated as another wrapper layer and ignored after the demo.
