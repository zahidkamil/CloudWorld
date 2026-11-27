import { describe, expect, it } from 'vitest';
import { shouldShowResourceLabel } from './resourceLabelVisibility';

describe('shouldShowResourceLabel', () => {
  it('shows all labels when the player enables the label layer', () => {
    expect(shouldShowResourceLabel('dim', 'a', null, true)).toBe(true);
  });

  it('always shows a selected resource and a type-level highlight', () => {
    expect(shouldShowResourceLabel('primary', 'a', null, false)).toBe(true);
    expect(shouldShowResourceLabel('type', 'a', null, false)).toBe(true);
  });

  it('shows a hovered dependency or peer even while another resource remains selected', () => {
    expect(shouldShowResourceLabel('dependency', 'dependency', 'dependency', false)).toBe(true);
    expect(shouldShowResourceLabel('peer', 'peer', 'peer', false)).toBe(true);
    expect(shouldShowResourceLabel('dim', 'other', 'peer', false)).toBe(false);
  });
});
