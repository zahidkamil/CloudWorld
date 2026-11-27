import { describe, expect, it } from 'vitest';
import { loadWorldLibrary, resolveLibraryModel, sizeTierOf, worldLibrarySchema } from './library';

const library = worldLibrarySchema.parse({
  version: 1,
  id: 'test-world',
  name: 'Test World',
  palette: {
    sky: '#112233',
    ground: '#223344',
    earth: '#334455',
    base: '#445566',
    roof: '#556677',
    accent: '#667788',
    glow: '#778899',
  },
  lighting: { preset: 'day' },
  camera: { elevation: 36, yaw: 45, minDistance: 7, maxDistance: 100 },
  models: {
    aws_instance: { file: 'models/ec2.glb', scale: 1, yOffset: 0 },
    'family:storage': { file: 'models/storage.glb', scale: 0.8, yOffset: 0 },
    'family:generic': { file: 'models/generic.glb', scale: 0.7, yOffset: 0 },
  },
});

describe('world library', () => {
  it('resolves exact type before family and generic fallbacks', () => {
    expect(resolveLibraryModel(library, 'aws_instance', 'compute')).toMatchObject({ file: 'models/ec2.glb' });
    expect(resolveLibraryModel(library, 'aws_s3_bucket', 'storage')).toMatchObject({
      file: 'models/storage.glb',
    });
    expect(resolveLibraryModel(library, 'aws_new_service', 'edge')).toMatchObject({
      file: 'models/generic.glb',
    });
  });

  it('maps instance sizes to building tiers', () => {
    expect(sizeTierOf('t3.nano')).toBe('tiny');
    expect(sizeTierOf('t2.micro')).toBe('tiny');
    expect(sizeTierOf('t3.small')).toBe('small');
    expect(sizeTierOf('t4g.medium')).toBe('small');
    expect(sizeTierOf('m5.large')).toBe('large');
    expect(sizeTierOf('c6i.xlarge')).toBe('large');
    expect(sizeTierOf('r6g.2xlarge')).toBe('huge');
    expect(sizeTierOf('m5.24xlarge')).toBe('huge');
    expect(sizeTierOf('c5.metal')).toBe('huge');
    expect(sizeTierOf('db.t3.micro')).toBe('tiny');
    expect(sizeTierOf('weird')).toBeUndefined();
    expect(sizeTierOf(undefined)).toBeUndefined();
  });

  it('picks a sized model from instance_type, falling back to the plain type', () => {
    const sized = worldLibrarySchema.parse({
      ...library,
      models: {
        ...library.models,
        'aws_instance.tiny': { file: 'models/walkup.glb', scale: 1, yOffset: 0, height: 2.8 },
        'aws_instance.huge': { file: 'models/supertall.glb', scale: 1, yOffset: 0, height: 11.7 },
      },
    });
    expect(
      resolveLibraryModel(sized, 'aws_instance', 'compute', { instance_type: 't3.micro' }),
    ).toMatchObject({
      file: 'models/walkup.glb',
      height: 2.8,
    });
    expect(
      resolveLibraryModel(sized, 'aws_instance', 'compute', { instance_type: 'm5.4xlarge' }),
    ).toMatchObject({
      file: 'models/supertall.glb',
    });
    // No model for the "large" tier: the plain type wins.
    expect(
      resolveLibraryModel(sized, 'aws_instance', 'compute', { instance_type: 'm5.large' }),
    ).toMatchObject({
      file: 'models/ec2.glb',
    });
  });

  it('accepts scene palettes, streets and an array of props', () => {
    const scene = {
      background: '#000000',
      ground: '#111111',
      earth: '#222222',
      base: '#333333',
      roof: '#444444',
      accent: '#555555',
      glow: '#666666',
      skyLight: '#777777',
      groundLight: '#888888',
      keyLight: '#999999',
      keyIntensity: 2,
      fillIntensity: 1,
      decor: 'pine',
    };
    const parsed = worldLibrarySchema.parse({
      ...library,
      scene,
      nightScene: { ...scene, fog: 1.6 },
      streets: { road: '#3a3d4a', sidewalk: '#dcd5c6', lampPost: '#4a5563', lampGlow: '#ffd479' },
      props: [{ file: 'models/prop-cab.glb', placement: 'road', perDistrict: 2, scale: 0.3 }],
    });
    expect(parsed.props).toHaveLength(1);
    expect(() =>
      worldLibrarySchema.parse({
        ...library,
        props: [{ file: 'models/prop-cab.glb', placement: 'roof', perDistrict: 2, scale: 0.3 }],
      }),
    ).toThrow();
  });

  it('uses the configured base path for asset URLs', () => {
    expect(resolveLibraryModel(library, 'aws_instance', 'compute')?.url).toBe(
      `${import.meta.env.BASE_URL}worlds/test-world/models/ec2.glb`,
    );
  });

  it('returns null without a library', () => {
    expect(resolveLibraryModel(null, 'aws_instance', 'compute')).toBeNull();
  });

  it('rejects unsafe paths and malformed schema', () => {
    expect(() =>
      worldLibrarySchema.parse({
        ...library,
        models: { 'family:generic': { file: '../x.glb', scale: 1, yOffset: 0 } },
      }),
    ).toThrow();
  });

  it('loads and validates a manifest, and returns null for a bad response or wrong id', async () => {
    const good = async () => new Response(JSON.stringify(library), { status: 200 });
    expect(await loadWorldLibrary('test-world', good)).toEqual(library);
    expect(await loadWorldLibrary('test-world', async () => new Response('', { status: 404 }))).toBeNull();
    expect(await loadWorldLibrary('other-world', good)).toBeNull();
    expect(
      await loadWorldLibrary('test-world', async () => {
        throw new Error('offline');
      }),
    ).toBeNull();
  });
});
