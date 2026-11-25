import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, type ReactNode, type RefObject } from 'react';
import { MathUtils } from 'three';

interface WorldCanvasProps {
  themeId: string;
  background: string;
  /** Furthest the camera may zoom out. */
  maxDistance: number;
  /** Extra data-* attributes on the wrapper, for tests and styling (for example data-selected). */
  dataAttrs?: Record<string, string>;
  /** A click on empty space. */
  onMissed?: () => void;
  children?: ReactNode;
}

/**
 * Publishes render statistics on the wrapper element so automated tests can confirm
 * that Three.js initialized WebGL and actually drew frames in every browser engine.
 */
function RenderProbe({ target }: { target: RefObject<HTMLDivElement | null> }) {
  const gl = useThree((s) => s.gl);
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    const el = target.current;
    if (!el || (frames.current > 3 && frames.current % 30 !== 0)) return;
    el.dataset.frames = String(frames.current);
    el.dataset.drawCalls = String(gl.info.render.calls);
    el.dataset.triangles = String(gl.info.render.triangles);
    el.dataset.webgl = gl.capabilities.isWebGL2 ? '2' : '1';
    el.dataset.ready = 'true';
  });
  return null;
}

export function WorldCanvas({
  themeId,
  background,
  maxDistance,
  dataAttrs,
  onMissed,
  children,
}: WorldCanvasProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  // Automated browsers render in software, so start at 1x there. Real players start at 1.5x and adapt.
  const [dpr, setDpr] = useState(() => (typeof navigator !== 'undefined' && navigator.webdriver ? 1 : 1.5));
  return (
    <div
      ref={wrapper}
      className="world-canvas"
      data-testid="world-canvas"
      data-theme={themeId}
      data-ready="false"
      {...dataAttrs}
    >
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: [30, 24, 30], fov: 35, near: 0.1, far: 800 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={onMissed}
      >
        <PerformanceMonitor
          onDecline={() => setDpr((d) => MathUtils.clamp(d - 0.25, 1, 2))}
          onIncline={() => setDpr((d) => MathUtils.clamp(d + 0.25, 1, 2))}
          flipflops={3}
          onFallback={() => setDpr(1)}
        />
        <color attach="background" args={[background]} />
        <RenderProbe target={wrapper} />
        {children}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.12}
          minPolarAngle={MathUtils.degToRad(12)}
          maxPolarAngle={MathUtils.degToRad(80)}
          minDistance={7}
          maxDistance={maxDistance}
          screenSpacePanning={false}
        />
      </Canvas>
    </div>
  );
}
