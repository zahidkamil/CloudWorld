import { create } from 'zustand';
import { useDefender } from '@/apps/defender/defenderStore';
import { useSelection } from './selection';
import type { InfrastructureGraph } from '@/engine/graph/types';
import { loadSettings, saveSettings, type Settings } from './settings';

/** title = start menu, worlds = world select, settings = defaults, world = playing. */
export type Screen = 'title' | 'worlds' | 'settings' | 'world';
export type GameMode = 'explorer' | 'defender';

export interface SessionState {
  screen: Screen;
  mode: GameMode;
  themeId: string;
  /** Lighting preset for Modern City; worlds reuse their models when the light changes. */
  lightingPreset: 'day' | 'night';
  settings: Settings;
  /** Current infrastructure. Replaced only by a confirmed import (R1.5). */
  graph: InfrastructureGraph | null;
  importOpen: boolean;
  setGraph: (graph: InfrastructureGraph) => void;
  openImport: () => void;
  closeImport: () => void;
  goTo: (screen: Exclude<Screen, 'world'>) => void;
  enterWorld: (themeId: string, mode?: GameMode) => void;
  updateSettings: (patch: Partial<Omit<Settings, 'version'>>) => void;
  setMode: (mode: GameMode) => void;
  setTheme: (themeId: string) => void;
  toggleLighting: () => void;
  returnToMenu: () => void;
}

const initialSettings = loadSettings();

/**
 * Shared DOM/canvas session state. Theme and mode changes must never mutate the graph.
 */
export const useSession = create<SessionState>((set, get) => ({
  screen: 'title',
  mode: initialSettings.defaultMission,
  themeId: initialSettings.defaultWorld,
  lightingPreset: 'day',
  settings: initialSettings,
  graph: null,
  importOpen: false,
  setGraph: (graph) => {
    useDefender.getState().reset();
    useSelection.getState().clear();
    set({ graph, importOpen: false });
  },
  openImport: () => set({ importOpen: true }),
  closeImport: () => set({ importOpen: false }),
  goTo: (screen) => set({ screen }),
  enterWorld: (themeId, mode) => set((s) => ({ screen: 'world', themeId, mode: mode ?? s.mode })),
  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    saveSettings(settings);
    set({ settings });
  },
  setMode: (mode) => set({ mode }),
  setTheme: (themeId) => set({ themeId, lightingPreset: 'day' }),
  toggleLighting: () => set((s) => ({ lightingPreset: s.lightingPreset === 'day' ? 'night' : 'day' })),
  returnToMenu: () => set({ screen: 'title' }),
}));
