import { describe, expect, it } from 'vitest';
import { checkModel, LIMITS, readGlbJson, triangleCount } from './validate-glb.mjs';

function glb(json: object, extraBytes = 0): Buffer {
  const text = JSON.stringify(json);
  const padded = text + ' '.repeat((4 - (text.length % 4)) % 4);
  const jsonChunk = Buffer.from(padded);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  const chunkHeader = Buffer.alloc(8);
  chunkHeader.writeUInt32LE(jsonChunk.length, 0);
  chunkHeader.writeUInt32LE(0x4e4f534a, 4);
  const body = Buffer.concat([chunkHeader, jsonChunk, Buffer.alloc(extraBytes)]);
  header.writeUInt32LE(12 + body.length, 8);
  return Buffer.concat([header, body]);
}

const model = (triangles: number, materials = 1) => ({
  asset: { version: '2.0' },
  accessors: [{ count: triangles * 3 }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 0 }] }],
  materials: Array.from({ length: materials }, () => ({})),
});

describe('validate-glb', () => {
  it('reads the JSON chunk and counts triangles', () => {
    const buf = glb(model(1200));
    expect(readGlbJson(buf).asset.version).toBe('2.0');
    expect(triangleCount(readGlbJson(buf))).toBe(1200);
  });

  it('accepts a model inside every budget that is listed in resources.md', () => {
    expect(checkModel('x/ec2-instance.glb', glb(model(1500, 2)), new Set(['ec2-instance.glb']))).toEqual([]);
  });

  it('rejects too many triangles, materials, cameras, lights, and external images', () => {
    const bad = {
      ...model(LIMITS.maxTriangles + 1, LIMITS.maxMaterials + 1),
      cameras: [{}],
      extensions: { KHR_lights_punctual: { lights: [{}] } },
      images: [{ uri: 'tex.png' }],
    };
    const errors = checkModel('a.glb', glb(bad), undefined).join('\n');
    expect(errors).toMatch(/triangles/);
    expect(errors).toMatch(/materials/);
    expect(errors).toMatch(/camera/);
    expect(errors).toMatch(/lights/);
    expect(errors).toMatch(/external image/);
  });

  it('rejects oversize files, unlisted names, and non-GLB files', () => {
    expect(checkModel('big.glb', glb(model(100), LIMITS.maxModelBytes), undefined).join()).toMatch(
      /KB is over/,
    );
    expect(checkModel('x.glb', glb(model(100)), new Set(['y.glb'])).join()).toMatch(/not listed/);
    expect(checkModel('x.glb', Buffer.from('not a glb at all, just text here'), undefined).join()).toMatch(
      /magic/,
    );
  });
});
