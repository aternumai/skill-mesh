export type RuntimeId = "codex" | "openclaw" | "cloud-code";
export type ModelFamily = "gpt" | "claude" | "gemini";
export type CompatibilityStatus = "compatible" | "compatible_with_warnings" | "requires_adapter" | "incompatible";
export interface ValidationSource {
    kind: string;
    ref: string;
    versionSource?: string;
}
export interface AuthoringStandard {
    kind: string;
    ref: string;
}
export interface SkillMeshManifest {
    schema_version: number;
    id: string;
    name: string;
    version: string;
    summary?: string;
    source?: {
        canonical_files?: string[];
    };
    targets: {
        runtimes: RuntimeId[];
        model_families: ModelFamily[];
    };
    constraints?: {
        requires_tools?: string[];
        disallowed_environments?: string[];
        max_context_tokens?: number | null;
    };
    overlays?: {
        runtime?: Partial<Record<RuntimeId, string>>;
        model_family?: Partial<Record<ModelFamily, string>>;
        model?: Record<string, string>;
    };
    exports?: {
        local?: {
            enabled: boolean;
        };
        registry?: {
            enabled: boolean;
        };
    };
    validation?: {
        sources?: {
            runtime_docs?: Partial<Record<RuntimeId, ValidationSource>>;
            authoring_standards?: Record<string, AuthoringStandard>;
        };
    };
}
export interface CompatibilityResult {
    runtime: RuntimeId;
    status: CompatibilityStatus;
    validatedVersion: string;
    warnings: string[];
    blockingIssues: string[];
    validationSources: string[];
}
