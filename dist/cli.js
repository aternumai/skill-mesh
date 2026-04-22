#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { loadManifest } from "./manifest.js";
import { validatePackage } from "./validator.js";
async function main() {
    const [, , command = "validate", targetArg = "."] = process.argv;
    const packageDir = path.resolve(process.cwd(), targetArg);
    if (command !== "validate") {
        fail(`Unknown command '${command}'. Supported commands: validate`);
    }
    try {
        const manifest = await loadManifest(packageDir);
        const result = await validatePackage(packageDir, manifest);
        console.log(`SkillMesh validate: ${manifest.name} (${manifest.id})`);
        console.log(`Version: ${manifest.version}`);
        console.log(`Package: ${packageDir}`);
        console.log("");
        if (result.issues.length > 0) {
            console.log("Manifest issues:");
            for (const issue of result.issues) {
                console.log(`- ${issue}`);
            }
            console.log("");
        }
        console.log("Compatibility:");
        for (const entry of result.compatibility) {
            console.log(`- ${entry.runtime}: ${entry.status} [validated=${entry.validatedVersion}]`);
            if (entry.validationSources.length > 0) {
                console.log(`  sources: ${entry.validationSources.join(", ")}`);
            }
            for (const warning of entry.warnings) {
                console.log(`  warning: ${warning}`);
            }
            for (const issue of entry.blockingIssues) {
                console.log(`  blocking: ${issue}`);
            }
        }
        if (result.issues.length > 0 || result.compatibility.some((entry) => entry.status === "incompatible")) {
            process.exitCode = 1;
        }
    }
    catch (error) {
        fail(error instanceof Error ? error.message : String(error));
    }
}
function fail(message) {
    console.error(`Error: ${message}`);
    process.exit(1);
}
void main();
