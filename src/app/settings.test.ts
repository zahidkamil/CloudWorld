import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, SETTINGS_KEY } from './settings';

const memory = (initial?: string) => {
  let value = initial;
  return {
    getItem: () => value ?? null,
    setItem: (_k: string, v: string) => {
      value = v;
    },
    read: () => value,
  };
};

describe('settings', () => {
  it('returns defaults when nothing is saved', () => {
    expect(loadSettings(memory())).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips saved settings', () => {
    const store = memory();
    saveSettings({ version: 1, defaultWorld: 'haunted-world', defaultMission: 'defender' }, store);
    expect(loadSettings(store)).toEqual({
      version: 1,
      defaultWorld: 'haunted-world',
      defaultMission: 'defender',
    });
  });

  it.each([
    ['not json', '{oops'],
    [
      'wrong version',
      JSON.stringify({ version: 2, defaultWorld: 'modern-city', defaultMission: 'explorer' }),
    ],
    ['locked world', JSON.stringify({ version: 1, defaultWorld: 'aqua-world', defaultMission: 'explorer' })],
    ['bad mission', JSON.stringify({ version: 1, defaultWorld: 'modern-city', defaultMission: 'nope' })],
  ])('ignores corrupted data (%s)', (_name, raw) => {
    expect(loadSettings(memory(raw))).toEqual(DEFAULT_SETTINGS);
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    };
    expect(loadSettings(broken)).toEqual(DEFAULT_SETTINGS);
    expect(() => saveSettings(DEFAULT_SETTINGS, broken)).not.toThrow();
  });

  it('uses a versioned key', () => {
    expect(SETTINGS_KEY).toContain('v1');
  });
});
