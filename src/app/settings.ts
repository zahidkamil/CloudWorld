import { z } from 'zod';
import { isPlayableWorld } from '@/themes/worlds';

export const SETTINGS_KEY = 'cloudworld.settings.v1';

export const settingsSchema = z.object({
  version: z.literal(1),
  /** Must be a world that can be played today. Locked or removed worlds fall back to the default. */
  defaultWorld: z.string().refine(isPlayableWorld),
  defaultMission: z.enum(['explorer', 'defender']),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  defaultWorld: 'modern-city',
  defaultMission: 'explorer',
};

/** Reads saved settings. Anything missing, corrupted, or from another version falls back to the defaults. */
export function loadSettings(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): Settings {
  try {
    const raw = storage?.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = settingsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(
  settings: Settings,
  storage: Pick<Storage, 'setItem'> | undefined = safeStorage(),
) {
  try {
    storage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be full or blocked (private mode). Settings still apply for this visit.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
