import { create } from 'zustand';
import type { InfrastructureGraph } from '@/engine/graph/types';

export type Screen = 'landing' | 'world';
export type GameMode = 'explorer' | 'defender';
export type BuiltInThemeId = 'modern-city' | 'haunted-world';

export interface SessionState {
  screen: Screen;
  mode: GameMode;
  themeId: string;
  /** Current infrastructure. Replaced only by a confirmed import (R1.5). */
  graph: InfrastructureGraph | null;
  importOpen: boolean;
  setGraph: (graph: InfrastructureGraph) => void;
  openImport: () => void;
  closeImport: () => void;
  enterWorld: (themeId: string, mode?: GameMode) => void;
  setMode: (mode: GameMode) => void;
  setTheme: (themeId: string) => void;
  returnToMenu: () => void;
}

/**
 * Shared DOM/canvas session state. Theme and mode changes must never mutate the graph.
 */
export const useSession = create<SessionState>((set) => ({
  screen: 'landing',
  mode: 'explorer',
  themeId: 'modern-city',
  graph: null,
  importOpen: false,
  setGraph: (graph) => set({ graph, importOpen: false }),
  openImport: () => set({ importOpen: true }),
  closeImport: () => set({ importOpen: false }),
  enterWorld: (themeId, mode) => set((s) => ({ screen: 'world', themeId, mode: mode ?? s.mode })),
  setMode: (mode) => set({ mode }),
  setTheme: (themeId) => set({ themeId }),
  returnToMenu: () => set({ screen: 'landing' }),
}));
