import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, type ReactNode, type RefObject } from 'react';

interface WorldCanvasProps {
  themeId: string;
  background: string;
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

export function WorldCanvas({ themeId, background, children }: WorldCanvasProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={wrapper}
      className="world-canvas"
      data-testid="world-canvas"
      data-theme={themeId}
      data-ready="false"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [18, 16, 18], fov: 35, near: 0.1, far: 500 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[background]} />
        <RenderProbe target={wrapper} />
        {children}
        <OrbitControls
          makeDefault
          enableDamping
          maxPolarAngle={Math.PI / 2.4}
          minDistance={8}
          maxDistance={80}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
