import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import type { SkillMeshManifest } from "./types.js";

export async function loadManifest(packageDir: string): Promise<SkillMeshManifest> {
  const manifestPath = path.join(packageDir, "skillmesh.yaml");
  const raw = await readFile(manifestPath, "utf8");
  const parsed = parse(raw) as SkillMeshManifest;
  return parsed;
}
