import type { BuiltInThemeId } from '@/app/store';

export interface WorldCardInfo {
  id: BuiltInThemeId;
  name: string;
  tagline: string;
  /** Preview image path relative to the public base. Replaced by real captures in Task 7. */
  preview?: string;
  accent: string;
}

export const BUILT_IN_WORLDS: readonly WorldCardInfo[] = [
  {
    id: 'modern-city',
    name: 'Modern City',
    tagline: 'A neon metropolis of districts, towers, and traffic',
    accent: '#5eead4',
  },
  {
    id: 'haunted-world',
    name: 'Haunted World',
    tagline: 'Gothic mansions, graveyards, and glowing pumpkins',
    accent: '#fb923c',
  },
];
