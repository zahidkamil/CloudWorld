import { create } from 'zustand';

/** What the player is looking at. The 3D scene, the inspector, and the legend all read this one store. */
interface SelectionState {
  selectedId: string | null;
  hoveredId: string | null;
  /** Bumps when the camera should fly to `focusId`. */
  focus: { id: string; nonce: number } | null;
  /** Bumps when the camera should return to the whole-world view. */
  fitNonce: number;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  /** Select a resource and fly the camera to it. */
  focusOn: (id: string) => void;
  fit: () => void;
  clear: () => void;
}

export const useSelection = create<SelectionState>((set) => ({
  selectedId: null,
  hoveredId: null,
  focus: null,
  fitNonce: 0,
  select: (selectedId) => set({ selectedId }),
  hover: (hoveredId) => set((s) => (s.hoveredId === hoveredId ? s : { hoveredId })),
  focusOn: (id) => set((s) => ({ selectedId: id, focus: { id, nonce: (s.focus?.nonce ?? 0) + 1 } })),
  fit: () => set((s) => ({ selectedId: null, fitNonce: s.fitNonce + 1 })),
  clear: () => set({ selectedId: null, hoveredId: null, focus: null }),
}));
