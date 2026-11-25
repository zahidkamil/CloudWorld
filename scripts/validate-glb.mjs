// Validates exported world models (GLB) without Blender.
// Usage: node scripts/validate-glb.mjs [file.glb ...]   (no args = every GLB under public/worlds)
// Checks: valid GLB header, size budgets, triangle budget, material count, no cameras/lights,
// and that each GLB is listed in worlds/<id>/resources.md. Exit code 1 on any failure.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';

export const LIMITS = {
  maxModelBytes: 150 * 1024,
  maxWorldBytes: 3 * 1024 * 1024,
  maxMaterials: 3,
  /** Triangle budgets from worlds/<id>/world.md: landmarks 1,500 to 2,000, key services up to 4,000. */
  maxTriangles: 4000,
};

/** Reads the JSON chunk of a GLB. Throws a readable error for malformed files. */
export function readGlbJson(buffer) {
  if (buffer.length < 20) throw new Error('file is too small to be a GLB');
  if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error('missing glTF magic header');
  if (buffer.readUInt32LE(4) !== 2) throw new Error('only glTF version 2 is supported');
  const jsonLength = buffer.readUInt32LE(12);
  if (buffer.readUInt32LE(16) !== 0x4e4f534a) throw new Error('first chunk is not JSON');
  return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString('utf8'));
}

export function triangleCount(json) {
  let total = 0;
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const mode = prim.mode ?? 4;
      if (mode !== 4) continue;
      const accessor =
        prim.indices !== undefined
          ? json.accessors?.[prim.indices]
          : json.accessors?.[prim.attributes?.POSITION];
      if (accessor) total += Math.floor(accessor.count / 3);
    }
  }
  return total;
}

export function checkModel(file, buffer, listedModels) {
  const errors = [];
  const name = basename(file);
  if (buffer.length > LIMITS.maxModelBytes) {
    errors.push(
      `${name}: ${(buffer.length / 1024).toFixed(0)} KB is over the ${LIMITS.maxModelBytes / 1024} KB limit`,
    );
  }
  let json;
  try {
    json = readGlbJson(buffer);
  } catch (e) {
    return [`${name}: ${e.message}`];
  }
  const tris = triangleCount(json);
  if (tris > LIMITS.maxTriangles)
    errors.push(`${name}: ${tris} triangles is over the ${LIMITS.maxTriangles} limit`);
  if (tris === 0) errors.push(`${name}: no triangles found`);
  const materials = (json.materials ?? []).length;
  if (materials > LIMITS.maxMaterials)
    errors.push(`${name}: ${materials} materials, the limit is ${LIMITS.maxMaterials}`);
  if ((json.cameras ?? []).length > 0) errors.push(`${name}: contains a camera, remove it before export`);
  if (json.extensions?.KHR_lights_punctual?.lights?.length)
    errors.push(`${name}: contains lights, remove them before export`);
  if ((json.images ?? []).some((i) => i.uri && !i.uri.startsWith('data:'))) {
    errors.push(`${name}: references an external image, embed textures in the GLB`);
  }
  if (listedModels && !listedModels.has(name)) {
    errors.push(`${name}: not listed in resources.md. Add an entry or rename the file to match`);
  }
  return errors;
}

function modelsListedIn(resourcesFile) {
  const listed = new Set();
  if (!existsSync(resourcesFile)) return undefined;
  for (const line of readFileSync(resourcesFile, 'utf8').split(/\r?\n/)) {
    const m = /\| model: `([^`]+\.glb)` \|/.exec(line);
    if (m) listed.add(m[1]);
  }
  return listed;
}

function allGlbs(root) {
  const out = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.glb')) out.push(full);
    }
  };
  walk(root);
  return out;
}

function main() {
  const root = process.cwd();
  const args = process.argv.slice(2);
  const files = (args.length ? args : allGlbs(join(root, 'public', 'worlds'))).map((f) => resolve(f));
  if (files.length === 0) {
    console.warn('No GLB models found yet. Nothing to validate.');
    return;
  }
  let failed = false;
  const worldBytes = new Map();
  for (const file of files) {
    const rel = relative(root, file).split(sep);
    // public/worlds/<id>/models/<file>.glb
    const worldId = rel[0] === 'public' && rel[1] === 'worlds' ? rel[2] : undefined;
    const listed = worldId ? modelsListedIn(join(root, 'worlds', worldId, 'resources.md')) : undefined;
    const buffer = readFileSync(file);
    const errors = checkModel(file, buffer, listed);
    if (worldId) worldBytes.set(worldId, (worldBytes.get(worldId) ?? 0) + buffer.length);
    if (errors.length) {
      failed = true;
      for (const e of errors) console.error(`FAIL ${e}`);
    } else {
      console.warn(`ok   ${relative(root, file)} (${(buffer.length / 1024).toFixed(0)} KB)`);
    }
  }
  if (args.length === 0) {
    for (const [id, bytes] of worldBytes) {
      if (bytes > LIMITS.maxWorldBytes) {
        failed = true;
        console.error(
          `FAIL ${id}: models total ${(bytes / 1024 / 1024).toFixed(1)} MB, over the ${LIMITS.maxWorldBytes / 1024 / 1024} MB limit`,
        );
      }
    }
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}` && dirname(process.argv[1])) main();
