import { create } from 'zustand';

/** Space taken by the side panels, so the 3D scene can be centred in the free area instead of behind them. */
interface PanelLayout {
  inspectorWidth: number;
  missionPanelOpen: boolean;
  setInspectorWidth: (w: number) => void;
  setMissionPanelOpen: (open: boolean) => void;
}

export const usePanelLayout = create<PanelLayout>((set) => ({
  inspectorWidth: 340,
  missionPanelOpen: false,
  setInspectorWidth: (inspectorWidth) => set({ inspectorWidth }),
  setMissionPanelOpen: (missionPanelOpen) => set({ missionPanelOpen }),
}));

const GUTTER = 28;
export const MISSION_PANEL_INSET = 388;
/** Below this width the panels stack over the scene instead of beside it. */
export const SIDE_BY_SIDE_MIN_WIDTH = 901;

export function insetsFor(
  layout: Pick<PanelLayout, 'inspectorWidth' | 'missionPanelOpen'>,
  viewportWidth: number,
) {
  if (viewportWidth < SIDE_BY_SIDE_MIN_WIDTH) return { left: 0, right: 0 };
  return { left: layout.missionPanelOpen ? MISSION_PANEL_INSET : 0, right: layout.inspectorWidth + GUTTER };
}
