import { access } from "node:fs/promises";
import path from "node:path";
import type {
  CompatibilityResult,
  RuntimeId,
  SkillMeshManifest,
  ValidationSource,
} from "./types.js";

const REQUIRED_RUNTIME_SOURCES: RuntimeId[] = ["codex", "openclaw", "cloud-code"];

export interface ManifestValidationResult {
  issues: string[];
  compatibility: CompatibilityResult[];
}

export async function validatePackage(
  packageDir: string,
  manifest: SkillMeshManifest,
): Promise<ManifestValidationResult> {
  const issues: string[] = [];

  if (manifest.schema_version !== 0) {
    issues.push(`Unsupported schema_version '${manifest.schema_version}'. Expected 0.`);
  }

  if (!manifest.id) {
    issues.push("Missing required field 'id'.");
  }

  if (!manifest.name) {
    issues.push("Missing required field 'name'.");
  }

  if (!manifest.version) {
    issues.push("Missing required field 'version'.");
  }

  if (!(await fileExists(path.join(packageDir, "SKILL.md")))) {
    issues.push("Missing required file 'SKILL.md'.");
  }

  if (!manifest.targets?.runtimes?.length) {
    issues.push("Manifest must declare at least one runtime target.");
  }

  if (!manifest.targets?.model_families?.length) {
    issues.push("Manifest must declare at least one model family target.");
  }

  const compatibility = await Promise.all(
    (manifest.targets?.runtimes ?? []).map(async (runtime) =>
      validateRuntime(packageDir, manifest, runtime),
    ),
  );

  return { issues, compatibility };
}

async function validateRuntime(
  packageDir: string,
  manifest: SkillMeshManifest,
  runtime: RuntimeId,
): Promise<CompatibilityResult> {
  const warnings: string[] = [];
  const blockingIssues: string[] = [];

  const validationSource = manifest.validation?.sources?.runtime_docs?.[runtime];
  const validatedVersion = validationSource?.versionSource ?? inferVersionLabel(validationSource);
  const validationSources = collectValidationSources(manifest, runtime);

  if (!validationSource) {
    blockingIssues.push(
      `Missing runtime validation source for '${runtime}'. Compatibility must be tied to docs or release tags.`,
    );
  }

  if (!REQUIRED_RUNTIME_SOURCES.includes(runtime)) {
    warnings.push(`Runtime '${runtime}' is not in the current built-in compatibility set.`);
  }

  const runtimeOverlay = manifest.overlays?.runtime?.[runtime];
  if (runtimeOverlay) {
    const overlaySkillPath = path.join(packageDir, runtimeOverlay, "SKILL.md");
    if (!(await fileExists(overlaySkillPath))) {
      warnings.push(`Runtime overlay '${runtimeOverlay}' is declared but missing SKILL.md.`);
    }
  } else {
    warnings.push(`No runtime overlay declared for '${runtime}'. Base skill will be used.`);
  }

  if (
    !manifest.validation?.sources?.authoring_standards ||
    objectSize(manifest.validation.sources.authoring_standards) === 0
  ) {
    warnings.push("No authoring standards declared. Validation confidence is reduced.");
  } else {
    for (const [standardName, source] of Object.entries(
      manifest.validation.sources.authoring_standards,
    )) {
      if (source.kind === "file") {
        const standardPath = path.join(packageDir, source.ref);
        if (!(await fileExists(standardPath))) {
          warnings.push(
            `Authoring standard '${standardName}' references missing file '${source.ref}'.`,
          );
        }
      }
    }
  }

  if ((manifest.constraints?.requires_tools?.length ?? 0) > 0 && runtime === "openclaw") {
    warnings.push("Tool requirements are declared; runtime-specific capability mapping is not implemented yet.");
  }

  return {
    runtime,
    status: deriveStatus(blockingIssues, warnings),
    validatedVersion,
    warnings,
    blockingIssues,
    validationSources,
  };
}

function collectValidationSources(manifest: SkillMeshManifest, runtime: RuntimeId): string[] {
  const entries: string[] = [];
  const runtimeSource = manifest.validation?.sources?.runtime_docs?.[runtime];
  if (runtimeSource) {
    entries.push(`${runtimeSource.kind}:${runtimeSource.ref}`);
  }

  const standards = manifest.validation?.sources?.authoring_standards ?? {};
  for (const [name, source] of Object.entries(standards)) {
    entries.push(`${name}:${source.kind}:${source.ref}`);
  }

  return entries;
}

function inferVersionLabel(source: ValidationSource | undefined): string {
  if (!source) {
    return "unknown";
  }

  if (source.kind === "git") {
    return source.versionSource ?? "tagged-release";
  }

  return "documented-release";
}

function deriveStatus(blockingIssues: string[], warnings: string[]) {
  if (blockingIssues.length > 0) {
    return "incompatible" as const;
  }

  if (warnings.length > 0) {
    return "compatible_with_warnings" as const;
  }

  return "compatible" as const;
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function objectSize(input: object): number {
  return Object.keys(input).length;
}
