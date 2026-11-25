import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  clampPanelWidth,
  PANEL_DEFAULT_WIDTH,
  PANEL_MIN_WIDTH,
  useResizableWidth,
} from './useResizableWidth';

describe('clampPanelWidth', () => {
  it('keeps the width between the minimum and 80% of the viewport', () => {
    expect(clampPanelWidth(10, 1440)).toBe(PANEL_MIN_WIDTH);
    expect(clampPanelWidth(5000, 1000)).toBe(800);
    expect(clampPanelWidth(500, 1440)).toBe(500);
  });
  it('never goes below the minimum on tiny viewports', () => {
    expect(clampPanelWidth(500, 200)).toBe(PANEL_MIN_WIDTH);
  });
});

describe('useResizableWidth', () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true });
  });

  const key = (k: string) => ({ key: k, shiftKey: false, preventDefault() {} }) as never;

  it('starts at the default width', () => {
    const { result } = renderHook(() => useResizableWidth('t.width'));
    expect(result.current.width).toBe(PANEL_DEFAULT_WIDTH);
  });

  it('widens with ArrowLeft, narrows with ArrowRight, resets with Home, and remembers it', () => {
    const { result } = renderHook(() => useResizableWidth('t.width'));
    act(() => result.current.handleProps.onKeyDown(key('ArrowLeft')));
    expect(result.current.width).toBe(PANEL_DEFAULT_WIDTH + 24);
    expect(window.localStorage.getItem('t.width')).toBe(String(PANEL_DEFAULT_WIDTH + 24));
    act(() => result.current.handleProps.onKeyDown(key('ArrowRight')));
    act(() => result.current.handleProps.onKeyDown(key('ArrowRight')));
    expect(result.current.width).toBe(PANEL_DEFAULT_WIDTH - 24);
    act(() => result.current.handleProps.onKeyDown(key('ArrowRight')));
    act(() => result.current.handleProps.onKeyDown(key('ArrowRight')));
    expect(result.current.width).toBe(PANEL_MIN_WIDTH);
    act(() => result.current.handleProps.onKeyDown(key('Home')));
    expect(result.current.width).toBe(PANEL_DEFAULT_WIDTH);
  });

  it('restores a stored width and ignores bad stored values', () => {
    window.localStorage.setItem('t.width', '520');
    expect(renderHook(() => useResizableWidth('t.width')).result.current.width).toBe(520);
    window.localStorage.setItem('t.width', 'abc');
    expect(renderHook(() => useResizableWidth('t.width')).result.current.width).toBe(PANEL_DEFAULT_WIDTH);
  });
});
