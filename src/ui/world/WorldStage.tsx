import { PlaceholderDiorama } from '@/engine/render/PlaceholderDiorama';
import { WorldCanvas } from '@/engine/render/WorldCanvas';

/** Interim colours that echo each reference image until the Blender libraries replace this scene (Tasks 5 and 6). */
const PLACEHOLDER_LOOK: Record<
  string,
  { background: string; ground: string; building: string; glow: string }
> = {
  'modern-city': { background: '#bfe6fb', ground: '#7bc043', building: '#d8c3a5', glow: '#ffd479' },
  'haunted-world': { background: '#141a33', ground: '#4a4553', building: '#5b5f78', glow: '#ffb454' },
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
