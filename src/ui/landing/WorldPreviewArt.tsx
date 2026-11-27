import { worldById, type WorldId } from '@/themes/worlds';

/**
 * Drawn placeholder for worlds that are still planned (Aqua World).
 * Built worlds use a capture of their real scene instead.
 */
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
 * Built worlds show a capture of their real scene: public/worlds/<id>/preview.webp.
 * Aqua World is still planned and keeps its drawn placeholder.
 */
export function WorldPreviewArt({ themeId }: { themeId: WorldId }) {
  if (themeId === 'aqua-world') return <AquaArt />;
  return (
    <img
      className="world-preview-img"
      src={`${import.meta.env.BASE_URL}worlds/${themeId}/preview.webp`}
      alt={`${worldById(themeId)?.name ?? themeId.replaceAll('-', ' ')} preview`}
      loading="lazy"
    />
  );
}
