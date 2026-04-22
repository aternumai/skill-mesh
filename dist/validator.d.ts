import type { CompatibilityResult, SkillMeshManifest } from "./types.js";
export interface ManifestValidationResult {
    issues: string[];
    compatibility: CompatibilityResult[];
}
export declare function validatePackage(packageDir: string, manifest: SkillMeshManifest): Promise<ManifestValidationResult>;
