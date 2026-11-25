import type { GameMode } from '@/app/store';

export interface MissionInfo {
  id: GameMode;
  name: string;
  tagline: string;
  start: string;
  perks: readonly string[];
}

export const MISSIONS: readonly MissionInfo[] = [
  {
    id: 'explorer',
    name: 'Showcase',
    tagline: 'Fly over your cloud and watch it come alive.',
    start: 'Start Showcase',
    perks: ['Orbit and zoom', 'Trace relationships', 'See shared resources'],
  },
  {
    id: 'defender',
    name: 'Attack Path',
    tagline: 'Hunt the intruder’s route and seal every weak spot.',
    start: 'Start Attack Path',
    perks: ['Earn points', 'Catch every finding', 'Hints when you’re stuck'],
  },
];

export const missionById = (id: GameMode): MissionInfo => MISSIONS.find((m) => m.id === id) ?? MISSIONS[0]!;
