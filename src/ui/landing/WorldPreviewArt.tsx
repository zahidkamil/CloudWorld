import type { WorldId } from '@/themes/worlds';

/**
 * Interim isometric SVG previews for the world cards.
 * Task 7 replaces these with screenshots captured from the real 3D scenes.
 */
const TILE = 22;

function iso(gx: number, gy: number, z = 0): [number, number] {
  return [160 + (gx - gy) * TILE, 70 + (gx + gy) * (TILE / 2) - z];
}

function pts(list: [number, number][]) {
  return list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

interface BoxProps {
  gx: number;
  gy: number;
  size?: number;
  h: number;
  top: string;
  left: string;
  right: string;
}

function IsoBox({ gx, gy, size = 1, h, top, left, right }: BoxProps) {
  const a = iso(gx, gy, h);
  const b = iso(gx + size, gy, h);
  const c = iso(gx + size, gy + size, h);
  const d = iso(gx, gy + size, h);
  const c0 = iso(gx + size, gy + size, 0);
  const b0 = iso(gx + size, gy, 0);
  const d0 = iso(gx, gy + size, 0);
  return (
    <g>
      <polygon points={pts([d, c, c0, d0])} fill={left} />
      <polygon points={pts([c, b, b0, c0])} fill={right} />
      <polygon points={pts([a, b, c, d])} fill={top} />
    </g>
  );
}

function Windows({
  gx,
  gy,
  size,
  h,
  color,
}: {
  gx: number;
  gy: number;
  size: number;
  h: number;
  color: string;
}) {
  const rows = Math.max(1, Math.floor(h / 9));
  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < 3; col++) {
      const t = (col + 0.5) / 3;
      const [x, y] = iso(gx + t * size, gy + size, 6 + r * 9);
      if ((r * 7 + col * 3 + gx) % 4 === 0) continue;
      items.push(<rect key={`${r}-${col}`} x={x - 2.2} y={y - 2.5} width={4} height={3} fill={color} />);
    }
  }
  return <g>{items}</g>;
}

function Slab({
  top,
  left,
  right,
  thickness = 12,
}: {
  top: string;
  left: string;
  right: string;
  thickness?: number;
}) {
  const size = 7.4;
  const a = iso(0, 0);
  const b = iso(size, 0);
  const c = iso(size, size);
  const d = iso(0, size);
  const down = (p: [number, number]): [number, number] => [p[0], p[1] + thickness];
  return (
    <g>
      <polygon points={pts([d, c, down(c), down(d)])} fill={left} />
      <polygon points={pts([c, b, down(b), down(c)])} fill={right} />
      <polygon points={pts([a, b, c, d])} fill={top} />
    </g>
  );
}

function CityArt() {
  const towers = [
    { gx: 1, gy: 1, h: 66, top: '#d8c3a5', left: '#c4ae90', right: '#ad9878' },
    { gx: 3, gy: 1, h: 44, top: '#e9e4da', left: '#d3cdc0', right: '#bbb5a8' },
    { gx: 1, gy: 3, h: 36, top: '#cfd3dc', left: '#b8bdc9', right: '#a0a6b4' },
    { gx: 3, gy: 3, h: 90, top: '#e2d2b8', left: '#cdbb9d', right: '#b5a384' },
    { gx: 5, gy: 2, h: 52, top: '#cfd3dc', left: '#b8bdc9', right: '#a0a6b4' },
    { gx: 2, gy: 5, h: 58, top: '#e9e4da', left: '#d3cdc0', right: '#bbb5a8' },
    { gx: 5, gy: 5, h: 28, top: '#d8c3a5', left: '#c4ae90', right: '#ad9878' },
  ];
  const trees = [
    [0.5, 4.6, '#7bc043'],
    [4.7, 0.4, '#f3a6c8'],
    [6.8, 4.0, '#7bc043'],
    [4.0, 6.8, '#f3a6c8'],
    [0.4, 0.5, '#f3a6c8'],
    [6.9, 6.7, '#7bc043'],
  ] as const;
  return (
    <svg
      viewBox="0 0 320 220"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Modern City preview"
    >
      <defs>
        <linearGradient id="city-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9dcf7" />
          <stop offset="1" stopColor="#e3f5ff" />
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#city-bg)" />
      <Slab top="#8ccf52" left="#c8794a" right="#a9623a" />
      <polygon points={pts([iso(0, 3.2), iso(7.4, 3.2), iso(7.4, 4.2), iso(0, 4.2)])} fill="#3d4150" />
      <polygon points={pts([iso(3.2, 0), iso(4.2, 0), iso(4.2, 7.4), iso(3.2, 7.4)])} fill="#3d4150" />
      <polygon points={pts([iso(0, 3.65), iso(7.4, 3.65), iso(7.4, 3.75), iso(0, 3.75)])} fill="#f2c94c" />
      {towers.map((t) => (
        <g key={`${t.gx}-${t.gy}`}>
          <IsoBox gx={t.gx} gy={t.gy} size={1.4} h={t.h} top={t.top} left={t.left} right={t.right} />
          <Windows gx={t.gx} gy={t.gy} size={1.4} h={t.h} color="#5f7fa8" />
        </g>
      ))}
      {trees.map(([gx, gy, c], i) => {
        const [x, y] = iso(gx, gy, 0);
        return (
          <g key={i}>
            <rect x={x - 0.8} y={y - 6} width={1.6} height={6} fill="#7a4b2a" />
            <circle cx={x} cy={y - 9} r={5.2} fill={c} />
          </g>
        );
      })}
    </svg>
  );
}

function HauntedArt() {
  const houses = [
    { gx: 1, gy: 1, h: 34 },
    { gx: 4, gy: 1, h: 26 },
    { gx: 1, gy: 4, h: 28 },
    { gx: 4.2, gy: 4, h: 48 },
  ];
  return (
    <svg
      viewBox="0 0 320 220"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Haunted World preview"
    >
      <defs>
        <linearGradient id="haunt-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141a33" />
          <stop offset="1" stopColor="#2a2550" />
        </linearGradient>
        <radialGradient id="haunt-glow" cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#ff9a3c" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="220" fill="url(#haunt-bg)" />
      <rect width="320" height="220" fill="url(#haunt-glow)" />
      <circle cx="262" cy="38" r="14" fill="#e8ecff" opacity={0.9} />
      <Slab top="#4a4553" left="#2f2b38" right="#25222d" />
      <polygon
        points={pts([iso(0.4, 5.4), iso(7, 5.4), iso(7, 6.2), iso(0.4, 6.2)])}
        fill="#8e8aa0"
        opacity={0.45}
      />
      {houses.map((house) => {
        const size = 2;
        const peak = iso(house.gx + size / 2, house.gy + size / 2, house.h + 22);
        const l = iso(house.gx, house.gy + size, house.h);
        const c = iso(house.gx + size, house.gy + size, house.h);
        const r = iso(house.gx + size, house.gy, house.h);
        return (
          <g key={`${house.gx}-${house.gy}`}>
            <IsoBox
              gx={house.gx}
              gy={house.gy}
              size={size}
              h={house.h}
              top="#5b5f78"
              left="#4b4e66"
              right="#3b3e54"
            />
            <polygon points={pts([l, c, peak])} fill="#3c4f9c" />
            <polygon points={pts([c, r, peak])} fill="#2f3d7d" />
            <Windows gx={house.gx} gy={house.gy} size={size} h={house.h} color="#ffb454" />
          </g>
        );
      })}
      {[
        [0.4, 6.6],
        [3.4, 6.8],
        [6.7, 2.6],
        [6.8, 6.8],
      ].map(([gx = 0, gy = 0], i) => {
        const [x, y] = iso(gx, gy, 0);
        return (
          <g key={i}>
            <ellipse cx={x} cy={y - 4} rx={6} ry={4.8} fill="#e8741c" />
            <rect x={x - 0.8} y={y - 10.5} width={1.6} height={2.5} fill="#365314" />
            <circle cx={x} cy={y - 4} r={1.6} fill="#fde047" />
          </g>
        );
      })}
      {[
        [2.9, 3.0],
        [5.9, 3.4],
      ].map(([gx = 0, gy = 0], i) => {
        const [x, y] = iso(gx, gy, 0);
        return <ellipse key={i} cx={x} cy={y - 12} rx={3.2} ry={9} fill="#52e0d0" opacity={0.45} />;
      })}
    </svg>
  );
}

function AquaArt() {
  const domes = [
    { x: 105, y: 128, r: 34, tint: '#8fe3ff' },
    { x: 205, y: 112, r: 44, tint: '#b79cff' },
    { x: 150, y: 150, r: 26, tint: '#7ff0e0' },
  ];
  const corals = [
    [24, 190, '#ff6fa8'],
    [60, 200, '#ff9a3c'],
    [262, 196, '#b377ff'],
    [296, 186, '#ff6fa8'],
    [180, 204, '#ffd479'],
  ] as const;
  return (
    <svg
      viewBox="0 0 320 220"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Aqua World preview"
    >
      <defs>
        <linearGradient id="aqua-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a5fb0" />
          <stop offset="0.55" stopColor="#1aa6e0" />
          <stop offset="1" stopColor="#35d6d0" />
        </linearGradient>
        <radialGradient id="aqua-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#bff6ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#bff6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="220" fill="url(#aqua-bg)" />
      <rect width="320" height="220" fill="url(#aqua-glow)" />
      <ellipse cx="160" cy="170" rx="132" ry="26" fill="#4a5a70" />
      <ellipse cx="160" cy="164" rx="124" ry="22" fill="#d9c9a6" />
      <rect x="60" y="150" width="200" height="6" rx="3" fill="#b88b5a" />
      {domes.map((d) => (
        <g key={d.x}>
          <path
            d={`M${d.x - d.r} ${d.y + d.r * 0.55} A${d.r} ${d.r} 0 0 1 ${d.x + d.r} ${d.y + d.r * 0.55} Z`}
            fill={d.tint}
            opacity={0.75}
          />
          <path
            d={`M${d.x - d.r} ${d.y + d.r * 0.55} A${d.r} ${d.r} 0 0 1 ${d.x + d.r} ${d.y + d.r * 0.55}`}
            fill="none"
            stroke="#f3fbff"
            strokeWidth={2}
          />
          <rect x={d.x - d.r} y={d.y + d.r * 0.55} width={d.r * 2} height={8} rx={3} fill="#e9f1f7" />
          <circle cx={d.x} cy={d.y + d.r * 0.2} r={3} fill="#ffd479" />
        </g>
      ))}
      <path d="M205 68 L212 40 L219 68 Z" fill="#e9f1f7" />
      <circle cx="212" cy="38" r="3" fill="#ffd479" />
      {corals.map(([x, y, c]) => (
        <g key={`${x}`} stroke={c} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d={`M${x} ${y} v-18 M${x} ${y - 10} l-7 -9 M${x} ${y - 12} l7 -8`} />
        </g>
      ))}
      <ellipse cx="258" cy="46" rx="14" ry="9" fill="#d9a8ff" opacity={0.8} />
      <path
        d="M250 52 q-2 14 2 20 M258 54 q0 14 0 22 M266 52 q2 14 -2 20"
        stroke="#d9a8ff"
        strokeWidth={2}
        fill="none"
        opacity={0.8}
      />
    </svg>
  );
}

/**
 * Built-in worlds use the drawn art above until their real scene captures exist.
 * Worlds made with the create-world workflow use public/worlds/<id>/preview.webp.
 */
export function WorldPreviewArt({ themeId }: { themeId: WorldId }) {
  if (themeId === 'aqua-world') return <AquaArt />;
  if (themeId === 'modern-city') return <CityArt />;
  if (themeId === 'haunted-world') return <HauntedArt />;
  return (
    <img
      className="world-preview-img"
      src={`${import.meta.env.BASE_URL}worlds/${themeId}/preview.webp`}
      alt={`${themeId.replaceAll('-', ' ')} preview`}
      loading="lazy"
    />
  );
}
