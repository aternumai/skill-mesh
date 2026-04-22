import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
export async function loadManifest(packageDir) {
    const manifestPath = path.join(packageDir, "skillmesh.yaml");
    const raw = await readFile(manifestPath, "utf8");
    const parsed = parse(raw);
    return parsed;
}
