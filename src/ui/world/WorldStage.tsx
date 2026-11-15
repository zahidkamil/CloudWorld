import { PlaceholderDiorama } from '@/engine/render/PlaceholderDiorama';
import { WorldCanvas } from '@/engine/render/WorldCanvas';

const PLACEHOLDER_LOOK: Record<
  string,
  { background: string; ground: string; building: string; glow: string }
> = {
  'modern-city': { background: '#070b16', ground: '#1b2333', building: '#334155', glow: '#5eead4' },
  'haunted-world': { background: '#c2410c', ground: '#d6d0c4', building: '#5b4a5e', glow: '#fdba74' },
};

/** Lazily loaded so three.js stays out of the landing-page bundle. */
export default function WorldStage({ themeId }: { themeId: string }) {
  const look = PLACEHOLDER_LOOK[themeId] ?? PLACEHOLDER_LOOK['modern-city']!;
  return (
    <WorldCanvas themeId={themeId} background={look.background}>
      <PlaceholderDiorama ground={look.ground} building={look.building} glow={look.glow} />
    </WorldCanvas>
  );
}
