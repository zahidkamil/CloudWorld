import { describe, expect, it } from 'vitest';
import { landmarkKindOf, LANDMARK_HEIGHT } from './landmarkKind';

describe('landmarkKindOf', () => {
  it('gives well-known services their own silhouette', () => {
    expect(landmarkKindOf('aws_instance', 'compute')).toBe('tower');
    expect(landmarkKindOf('aws_db_instance', 'database')).toBe('drum');
    expect(landmarkKindOf('aws_s3_bucket', 'storage')).toBe('silos');
    expect(landmarkKindOf('aws_lb', 'network')).toBe('roundabout');
    expect(landmarkKindOf('aws_nat_gateway', 'network')).toBe('gate');
    expect(landmarkKindOf('aws_lambda_function', 'compute')).toBe('pavilion');
    expect(landmarkKindOf('aws_security_group', 'security')).toBe('fence');
  });
  it('falls back to the category, then to a generic block', () => {
    expect(landmarkKindOf('aws_something_new', 'database')).toBe('drum');
    expect(landmarkKindOf('aws_something_new', 'other')).toBe('block');
  });
  it('has a height for every kind', () => {
    for (const kind of new Set([
      'tower',
      'drum',
      'silos',
      'gate',
      'roundabout',
      'vault',
      'pavilion',
      'mailbox',
      'mast',
      'fence',
      'pad',
      'block',
    ] as const)) {
      expect(LANDMARK_HEIGHT[kind]).toBeGreaterThan(0);
    }
  });
});
