import { create } from 'zustand';

/** What the player is looking at. The 3D scene, the inspector, and the legend all read this one store. */
interface SelectionState {
  selectedId: string | null;
  /** A resource type selected from the legend. It highlights every matching resource. */
  selectedType: string | null;
  hoveredId: string | null;
  /** Bumps when the camera should fly to `focusId`. */
  focus: { id: string; nonce: number } | null;
  /** Bumps when the camera should return to the whole-world view. */
  fitNonce: number;
  select: (id: string | null) => void;
  selectType: (type: string | null) => void;
  showLabels: boolean;
  toggleLabels: () => void;
  hover: (id: string | null) => void;
  /** Select a resource and fly the camera to it. */
  focusOn: (id: string) => void;
  fit: () => void;
  clear: () => void;
}

export const useSelection = create<SelectionState>((set) => ({
  selectedId: null,
  selectedType: null,
  showLabels: false,
  hoveredId: null,
  focus: null,
  fitNonce: 0,
  select: (selectedId) => set({ selectedId, selectedType: null }),
  selectType: (selectedType) => set({ selectedType, selectedId: null }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  hover: (hoveredId) => set((s) => (s.hoveredId === hoveredId ? s : { hoveredId })),
  focusOn: (id) =>
    set((s) => ({ selectedId: id, selectedType: null, focus: { id, nonce: (s.focus?.nonce ?? 0) + 1 } })),
  fit: () => set((s) => ({ selectedId: null, selectedType: null, fitNonce: s.fitNonce + 1 })),
  clear: () => set({ selectedId: null, selectedType: null, hoveredId: null, focus: null }),
}));
