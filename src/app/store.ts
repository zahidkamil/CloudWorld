import { create } from 'zustand';

export type Screen = 'landing' | 'world';
export type GameMode = 'explorer' | 'defender';
export type BuiltInThemeId = 'modern-city' | 'haunted-world';

export interface SessionState {
  screen: Screen;
  mode: GameMode;
  themeId: string;
  enterWorld: (themeId: string, mode?: GameMode) => void;
  setMode: (mode: GameMode) => void;
  setTheme: (themeId: string) => void;
  returnToMenu: () => void;
}

/**
 * Shared DOM/canvas session state. Infrastructure graph and selection state
 * are added in later tasks; theme and mode changes must never mutate them.
 */
export const useSession = create<SessionState>((set) => ({
  screen: 'landing',
  mode: 'explorer',
  themeId: 'modern-city',
  enterWorld: (themeId, mode) => set((s) => ({ screen: 'world', themeId, mode: mode ?? s.mode })),
  setMode: (mode) => set({ mode }),
  setTheme: (themeId) => set({ themeId }),
  returnToMenu: () => set({ screen: 'landing' }),
}));
