import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import { fitDistance, FIT_ELEVATION, FIT_YAW, FOCUS_DISTANCE } from './cameraView';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';

export interface FocusTarget {
  nonce: number;
  x: number;
  y: number;
  z: number;
}

interface CameraRigProps {
  /** Changes whenever the layout changes, so the first view frames the whole world. */
  layoutKey: string;
  radius: number;
  focus: FocusTarget | null;
  fitNonce: number;
  reducedMotion: boolean;
  insets: { left: number; right: number };
}

interface Goal {
  target: Vector3;
  distance: number;
  snap: boolean;
}

/**
 * Moves the orbit camera: frames the whole world when a plan loads or "Fit view" is pressed, and glides to a resource
 * when it is focused. The player can orbit, pan and zoom freely in between.
 */
export function CameraRig({ layoutKey, radius, focus, fitNonce, reducedMotion, insets }: CameraRigProps) {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const camera = useThree((s) => s.camera);
  const dom = useThree((s) => s.gl.domElement);
  const size = useThree((s) => s.size);
  // Frame the world in the part of the screen the side panels leave free.
  const freeWidth = Math.max(size.width - insets.left - insets.right, 240);
  const aspect = freeWidth / Math.max(size.height, 1);
  const goal = useRef<Goal | null>(null);

  // Shift the picture so the world sits in the free area. Picking follows because the projection includes the shift.
  useEffect(() => {
    const perspective = camera as PerspectiveCamera;
    const shift = (insets.left - insets.right) / 2;
    if (shift === 0) perspective.clearViewOffset();
    else perspective.setViewOffset(size.width, size.height, -shift, 0, size.width, size.height);
    perspective.updateProjectionMatrix();
    return () => {
      perspective.clearViewOffset();
      perspective.updateProjectionMatrix();
    };
  }, [camera, size.width, size.height, insets.left, insets.right]);
  const firstFit = useRef(true);

  const setSettled = (value: boolean) => {
    const wrapper = dom.closest<HTMLElement>('[data-testid="world-canvas"]');
    if (wrapper) wrapper.dataset.cameraSettled = String(value);
  };

  useEffect(() => {
    const snap = firstFit.current || reducedMotion;
    firstFit.current = false;
    goal.current = { target: new Vector3(0, 0.5, 0), distance: fitDistance(radius, aspect), snap };
    setSettled(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey, fitNonce, radius, reducedMotion, aspect]);

  useEffect(() => {
    if (!focus) return;
    goal.current = {
      target: new Vector3(focus.x, focus.y, focus.z),
      distance: FOCUS_DISTANCE,
      snap: reducedMotion,
    };
    setSettled(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.nonce, reducedMotion]);

  useFrame((_, delta) => {
    const g = goal.current;
    if (!controls || !g) return;
    const offset = new Vector3().subVectors(camera.position, controls.target);
    if (g.snap) {
      offset.set(
        Math.sin(FIT_YAW) * Math.cos(FIT_ELEVATION),
        Math.sin(FIT_ELEVATION),
        Math.cos(FIT_YAW) * Math.cos(FIT_ELEVATION),
      );
      controls.target.copy(g.target);
      camera.position.copy(g.target).addScaledVector(offset, g.distance);
      controls.update();
      goal.current = null;
      setSettled(true);
      return;
    }
    const k = 1 - Math.exp(-delta * 5);
    controls.target.lerp(g.target, k);
    const length = MathUtils.lerp(offset.length(), g.distance, k);
    offset.setLength(length);
    camera.position.copy(controls.target).add(offset);
    controls.update();
    if (controls.target.distanceTo(g.target) < 0.03 && Math.abs(length - g.distance) < 0.08) {
      goal.current = null;
      setSettled(true);
    }
  });

  return null;
}
