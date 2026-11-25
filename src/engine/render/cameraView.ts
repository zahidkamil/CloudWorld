import { MathUtils } from 'three';

/** Whole-world view: three-quarter angle like the reference dioramas. */
export const FIT_ELEVATION = MathUtils.degToRad(36);
export const FIT_YAW = MathUtils.degToRad(45);
/** How far the camera sits from a focused resource. */
export const FOCUS_DISTANCE = 15;

const FOV = MathUtils.degToRad(35);

/**
 * Distance that frames a world of the given radius for a viewport with the given width / height.
 * Wide viewports are limited by height, tall or narrow ones by width.
 */
export function fitDistance(radius: number, aspect = 1.6): number {
  const limiting = Math.min(Math.max(aspect, 0.5), 1.35);
  return Math.max(22, (radius * 1.02) / (Math.tan(FOV / 2) * limiting));
}
