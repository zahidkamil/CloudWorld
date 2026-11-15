// Validates world instruction-set libraries under worlds/<id>/.
// Usage: node scripts/validate-worlds.mjs [worldsDir] [publicWorldsDir]
// Exit code 1 when any world is invalid. Used by `npm run validate:worlds` and the Kiro hook.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const REQUIRED_STRUCTURE = ['structure:region', 'structure:az', 'structure:vpc', 'structure:subnet'];
export const REQUIRED_FAMILIES = [
  'compute',
  'containers',
  'serverless',
  'database',
  'storage',
  'gateway',
  'loadbalancer',
  'edge',
  'messaging',
  'security',
  'monitoring',
  'generic',
].map((f) => `family:${f}`);

const ENTRY = /^- `([^`]+)` \| model: `([^`]+)` \| (planned|built) \| (.+)$/;
const KEBAB_GLB = /^[a-z0-9]+(?:-[a-z0-9]+)*\.glb$/;
const KEY = /^(structure:(region|az|vpc|subnet)|family:[a-z]+|aws_[a-z0-9_]+)$/;

/** Parses the small front-matter subset we use: `key: value` lines and `- item` lists. */
export function parseFrontMatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return undefined;
  const data = {};
  let listKey;
  for (const line of match[1].split(/\r?\n/)) {
    const item = /^\s+-\s+(.+)$/.exec(line);
    if (item && listKey) {
      data[listKey].push(item[1].trim());
      continue;
    }
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    if (kv[2] === '') {
      listKey = kv[1];
      data[listKey] = [];
    } else {
      listKey = undefined;
      data[kv[1]] = kv[2].trim();
    }
  }
  return data;
}

export function parseResources(text) {
  const entries = [];
  const bad = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.startsWith('- `')) return;
    const m = ENTRY.exec(line);
    if (m) entries.push({ key: m[1], model: m[2], status: m[3], look: m[4], line: i + 1 });
    else bad.push({ line: i + 1, text: line.slice(0, 80) });
  });
  return { entries, bad };
}

export function validateWorld(id, dir, root, publicDir) {
  const errors = [];
  const worldFile = join(dir, 'world.md');
  const resFile = join(dir, 'resources.md');
  if (!existsSync(worldFile)) return [`${id}: missing world.md`];
  if (!existsSync(resFile)) return [`${id}: missing resources.md`];

  const fm = parseFrontMatter(readFileSync(worldFile, 'utf8'));
  if (!fm) return [`${id}: world.md needs front matter`];
  if (fm.id !== id) errors.push(`${id}: front matter id "${fm.id}" must equal the folder name`);
  if (!fm.name) errors.push(`${id}: front matter name is required`);
  if (!['planned', 'in-progress', 'built'].includes(fm.status)) {
    errors.push(`${id}: status must be planned, in-progress, or built`);
  }
  const images = fm.reference_images ?? [];
  // A reference image is optional. Without one, a written style brief is required instead.
  if (images.length === 0 && (fm.brief ?? '').trim().length < 40) {
    errors.push(
      `${id}: add reference_images (files under docs/images/) or a brief: line of 40+ characters describing the look`,
    );
  }
  for (const image of images) {
    if (!image.startsWith('docs/images/'))
      errors.push(`${id}: reference image "${image}" must be under docs/images/`);
    else if (!existsSync(resolve(root, image)))
      errors.push(`${id}: reference image "${image}" does not exist`);
  }
  if (fm.ui_reference && !existsSync(resolve(root, fm.ui_reference))) {
    errors.push(`${id}: ui_reference "${fm.ui_reference}" does not exist`);
  }

  const { entries, bad } = parseResources(readFileSync(resFile, 'utf8'));
  for (const b of bad)
    errors.push(`${id}: resources.md line ${b.line} does not match the entry format: ${b.text}`);

  const keys = new Set();
  for (const e of entries) {
    if (!KEY.test(e.key)) errors.push(`${id}: line ${e.line} unknown key "${e.key}"`);
    if (keys.has(e.key)) errors.push(`${id}: duplicate key "${e.key}"`);
    keys.add(e.key);
    if (!KEBAB_GLB.test(e.model))
      errors.push(`${id}: line ${e.line} model "${e.model}" must be kebab-case .glb`);
    if (e.look.trim().length < 25 || /^\.\.\.$/.test(e.look.trim())) {
      errors.push(`${id}: line ${e.line} "${e.key}" needs a real look description (25+ characters)`);
    }
    if (e.status === 'built' && !existsSync(join(publicDir, id, 'models', e.model))) {
      errors.push(`${id}: "${e.key}" is built but public/worlds/${id}/models/${e.model} is missing`);
    }
  }
  for (const required of [...REQUIRED_STRUCTURE, ...REQUIRED_FAMILIES]) {
    if (!keys.has(required)) errors.push(`${id}: missing required entry "${required}"`);
  }
  if (fm.status === 'built') {
    if (entries.some((e) => e.status !== 'built'))
      errors.push(`${id}: world is "built" but entries are still planned`);
    if (!existsSync(join(publicDir, id, 'library.json')))
      errors.push(`${id}: built world needs public/worlds/${id}/library.json`);
  }
  return errors;
}

function main() {
  const root = process.cwd();
  const worldsDir = resolve(root, process.argv[2] ?? 'worlds');
  const publicDir = resolve(root, process.argv[3] ?? 'public/worlds');
  if (!existsSync(worldsDir)) {
    console.error('No worlds directory found.');
    process.exit(1);
  }
  const ids = readdirSync(worldsDir).filter(
    (n) => !n.startsWith('_') && statSync(join(worldsDir, n)).isDirectory(),
  );
  let failed = false;
  for (const id of ids) {
    const errors = validateWorld(id, join(worldsDir, id), root, publicDir);
    if (errors.length) {
      failed = true;
      console.error(`FAIL ${id}`);
      for (const e of errors) console.error(`  - ${e}`);
    } else {
      console.warn(`ok   ${id}`);
    }
  }
  if (ids.length === 0) {
    console.error('No worlds found.');
    failed = true;
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
