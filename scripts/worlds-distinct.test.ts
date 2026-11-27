import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface WorldLibrary {
  id: string;
  models: Record<string, { file: string }>;
  props?: { file: string }[];
  scene?: { background: string; ground: string };
  streets?: { road: string };
}

const ROOT = join(process.cwd(), 'public', 'worlds');
const BUILT = ['modern-city', 'haunted-world'] as const;

function load(id: string): WorldLibrary {
  return JSON.parse(readFileSync(join(ROOT, id, 'library.json'), 'utf8')) as WorldLibrary;
}

function files(library: WorldLibrary): string[] {
  return [
    ...new Set([
      ...Object.values(library.models).map((m) => m.file),
      ...(library.props ?? []).map((p) => p.file),
    ]),
  ];
}

const hash = (id: string, file: string) =>
  createHash('sha256')
    .update(readFileSync(join(ROOT, id, file)))
    .digest('hex');

describe('built worlds are distinct', () => {
  const libraries = BUILT.map(load);

  it('each library maps EC2 size tiers and brings its own scene, streets and props', () => {
    for (const library of libraries) {
      for (const tier of ['tiny', 'small', 'large', 'huge']) {
        expect(library.models[`aws_instance.${tier}`], `${library.id} aws_instance.${tier}`).toBeDefined();
      }
      expect(library.scene).toBeDefined();
      expect(library.streets).toBeDefined();
      expect(library.props?.length ?? 0).toBeGreaterThanOrEqual(3);
    }
  });

  it('shares no model file names or model bytes between worlds', () => {
    const [a, b] = libraries as [WorldLibrary, WorldLibrary];
    const aFiles = files(a);
    const bFiles = files(b);
    expect(aFiles.filter((f) => bFiles.includes(f))).toEqual([]);
    const aHashes = new Set(aFiles.map((f) => hash(a.id, f)));
    expect(bFiles.filter((f) => aHashes.has(hash(b.id, f)))).toEqual([]);
  });

  it('uses different scene palettes and street dressing', () => {
    const [a, b] = libraries as [WorldLibrary, WorldLibrary];
    expect(a.scene?.background).not.toBe(b.scene?.background);
    expect(a.scene?.ground).not.toBe(b.scene?.ground);
    expect(a.streets?.road).not.toBe(b.streets?.road);
  });
});
