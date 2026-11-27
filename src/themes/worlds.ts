/** A world id is the folder name under worlds/ and public/worlds/ (kebab-case). */
export type WorldId = string;

export interface WorldCardInfo {
  id: WorldId;
  name: string;
  tagline: string;
  /** Short flavour line shown on the world card. */
  blurb: string;
  accent: string;
  /** Locked worlds are shown as "coming soon" and cannot be entered yet. */
  available: boolean;
}

export const ALL_WORLDS: readonly WorldCardInfo[] = [
  {
    id: 'modern-city',
    name: 'Modern City',
    tagline: 'Skyscrapers, yellow cabs, and food carts downtown',
    blurb: 'Walk-ups to supertalls, sized by instance type',
    accent: '#5eead4',
    available: true,
  },
  {
    id: 'haunted-world',
    name: 'Haunted World',
    tagline: 'Vampire manors, iron gates, and ghosts in the fog',
    blurb: "Cottages to Dracula's castle, crypts and cauldrons",
    accent: '#fb923c',
    available: true,
  },
  {
    id: 'aqua-world',
    name: 'Aqua World',
    tagline: 'Glass domes and boardwalks beneath a sparkling sea',
    blurb: 'Reef islands, waterfalls, and curious sea life',
    accent: '#38bdf8',
    available: false,
  },
];

/**
 * Every world. A new world made with the create-world workflow is added here, with a preview at
 * public/worlds/<id>/preview.webp. Worlds with `available: false` are shown as coming soon.
 */

/** Worlds that can be entered today. */
export const BUILT_IN_WORLDS: readonly WorldCardInfo[] = ALL_WORLDS.filter((w) => w.available);

export const worldById = (id: string): WorldCardInfo | undefined => ALL_WORLDS.find((w) => w.id === id);

export const isPlayableWorld = (id: string): boolean => BUILT_IN_WORLDS.some((w) => w.id === id);
