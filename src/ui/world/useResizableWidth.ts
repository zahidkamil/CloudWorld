import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

export const PANEL_MIN_WIDTH = 300;
export const PANEL_DEFAULT_WIDTH = 340;
const MAX_VIEWPORT_RATIO = 0.8;
const KEY_STEP = 24;

export function clampPanelWidth(width: number, viewport: number): number {
  const max = Math.max(PANEL_MIN_WIDTH, Math.floor(viewport * MAX_VIEWPORT_RATIO));
  return Math.round(Math.min(Math.max(width, PANEL_MIN_WIDTH), max));
}

function readStored(key: string, viewport: number): number {
  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) && value > 0
      ? clampPanelWidth(value, viewport)
      : clampPanelWidth(PANEL_DEFAULT_WIDTH, viewport);
  } catch {
    return clampPanelWidth(PANEL_DEFAULT_WIDTH, viewport);
  }
}

/**
 * Width state for a panel docked on the right edge. Dragging the handle left widens it.
 * Keyboard: Left widens, Right narrows (Shift for bigger steps), Home resets. The width is remembered per browser.
 */
export function useResizableWidth(storageKey: string) {
  const [width, setWidth] = useState(() => readStored(storageKey, window.innerWidth));
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);
  const latest = useRef(width);
  useEffect(() => {
    latest.current = width;
  }, [width]);

  const persist = useCallback(
    (value: number) => {
      try {
        window.localStorage.setItem(storageKey, String(value));
      } catch {
        // Storage can be unavailable (private mode). The width still works for this session.
      }
    },
    [storageKey],
  );

  useEffect(() => {
    const onResize = () => setWidth((w) => clampPanelWidth(w, window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startWidth: latest.current };
    e.preventDefault();
  };
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    setWidth(clampPanelWidth(d.startWidth + (d.startX - e.clientX), window.innerWidth));
  };
  const endDrag = (e: PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    persist(latest.current);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    let next: number | undefined;
    if (e.key === 'ArrowLeft') next = latest.current + step;
    else if (e.key === 'ArrowRight') next = latest.current - step;
    else if (e.key === 'Home') next = PANEL_DEFAULT_WIDTH;
    if (next === undefined) return;
    e.preventDefault();
    const clamped = clampPanelWidth(next, window.innerWidth);
    setWidth(clamped);
    persist(clamped);
  };
  const reset = () => {
    const value = clampPanelWidth(PANEL_DEFAULT_WIDTH, window.innerWidth);
    setWidth(value);
    persist(value);
  };

  return {
    width,
    max: clampPanelWidth(Number.MAX_SAFE_INTEGER, window.innerWidth),
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown,
      onDoubleClick: reset,
    },
  };
}
