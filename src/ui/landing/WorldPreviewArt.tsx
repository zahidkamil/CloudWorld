import type { BuiltInThemeId } from '@/app/store';

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

function CityArt() {
  const towers = [
    { gx: 1, gy: 1, h: 70 },
    { gx: 3, gy: 1, h: 46 },
    { gx: 1, gy: 3, h: 38 },
    { gx: 3, gy: 3, h: 92 },
    { gx: 5, gy: 2, h: 54 },
    { gx: 2, gy: 5, h: 60 },
    { gx: 5, gy: 5, h: 30 },
  ];
  return (
    <svg
      viewBox="0 0 320 220"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Modern City preview"
    >
      <defs>
        <radialGradient id="city-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#1e2b4a" />
          <stop offset="1" stopColor="#070b16" />
        </radialGradient>
      </defs>
      <rect width="320" height="220" fill="url(#city-bg)" />
      <IsoBox gx={0} gy={0} size={7.4} h={0} top="#1b2333" left="#111827" right="#0f1522" />
      {[...Array(8).keys()].map((i) => {
        const [x, y] = iso(i, 0.1);
        const [x2, y2] = iso(i, 7.3);
        return <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke="#2a3550" strokeWidth={0.6} />;
      })}
      {towers.map((t) => (
        <g key={`${t.gx}-${t.gy}`}>
          <IsoBox gx={t.gx} gy={t.gy} size={1.4} h={t.h} top="#334155" left="#1e293b" right="#16202f" />
          <Windows gx={t.gx} gy={t.gy} size={1.4} h={t.h} color={t.h > 60 ? '#5eead4' : '#fcd34d'} />
        </g>
      ))}
      {[
        [0.5, 4.6],
        [4.6, 0.5],
        [6.8, 4],
        [4, 6.8],
      ].map(([gx = 0, gy = 0], i) => {
        const [x, y] = iso(gx, gy, 0);
        return <circle key={i} cx={x} cy={y} r={2.2} fill="#fde68a" opacity={0.9} />;
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
          <stop offset="0" stopColor="#f97316" />
          <stop offset="1" stopColor="#9a3412" />
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#haunt-bg)" />
      <circle cx="262" cy="40" r="16" fill="#fff7d6" opacity={0.9} />
      <IsoBox gx={0} gy={0} size={7.4} h={0} top="#d6d0c4" left="#3b2a2a" right="#2a1d1d" />
      <polygon points={pts([iso(0, 3.2), iso(7.4, 3.2), iso(7.4, 4.2), iso(0, 4.2)])} fill="#3f3f46" />
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
              top="#6b5b6e"
              left="#5b4a5e"
              right="#4a3b4d"
            />
            <polygon points={pts([l, c, peak])} fill="#2e2438" />
            <polygon points={pts([c, r, peak])} fill="#221a2b" />
            <Windows gx={house.gx} gy={house.gy} size={size} h={house.h} color="#fdba74" />
          </g>
        );
      })}
      {[
        [0.4, 6.5],
        [3.3, 6.6],
        [6.6, 2.6],
        [6.8, 6.8],
      ].map(([gx = 0, gy = 0], i) => {
        const [x, y] = iso(gx, gy, 0);
        return (
          <g key={i}>
            <ellipse cx={x} cy={y - 4} rx={6} ry={4.8} fill="#ea580c" />
            <rect x={x - 0.8} y={y - 10.5} width={1.6} height={2.5} fill="#365314" />
            <circle cx={x} cy={y - 4} r={1.6} fill="#fde047" />
          </g>
        );
      })}
    </svg>
  );
}

export function WorldPreviewArt({ themeId }: { themeId: BuiltInThemeId }) {
  return themeId === 'modern-city' ? <CityArt /> : <HauntedArt />;
}
