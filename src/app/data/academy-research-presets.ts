export type AcademyResearchId =
  | 'slinger'
  | 'archer'
  | 'city_guard'
  | 'hoplite'
  | 'meteorology'
  | 'espionage'
  | 'villager_loyalty'
  | 'ceramics'
  | 'horseman'
  | 'architecture'
  | 'instructor'
  | 'bireme'
  | 'crane'
  | 'shipwright'
  | 'colony_ship'
  | 'chariot'
  | 'fire_ship'
  | 'conscription'
  | 'demolition_ship'
  | 'catapult'
  | 'cryptography'
  | 'fast_transport_ship'
  | 'plow'
  | 'bunks'
  | 'trireme'
  | 'phalanx'
  | 'breakthrough'
  | 'mathematics'
  | 'revolt'
  | 'ram'
  | 'cartography'
  | 'stone_hail'
  | 'temple_looting'
  | 'divine_selection'
  | 'combat_experience'
  | 'strong_wine'
  | 'set_sail';

export interface AcademyResearchDefinition {
  readonly id: AcademyResearchId;
  readonly nameKey: string;
  readonly fallbackName: string;
  readonly cost: number;
  readonly requiredAcademyLevel: number;
  readonly icon: string;
}

interface AcademyResearchLevelGroup {
  readonly requiredAcademyLevel: number;
  readonly researches: readonly AcademyResearchDefinition[];
}

const createResearch = (
  id: AcademyResearchId,
  fallbackName: string,
  cost: number,
  requiredAcademyLevel: number,
  icon: string,
): AcademyResearchDefinition => ({
  id,
  nameKey: `academyResearch.${id}`,
  fallbackName,
  cost,
  requiredAcademyLevel,
  icon,
});

export const academyResearchLevelGroups: readonly AcademyResearchLevelGroup[] = [
  {
    requiredAcademyLevel: 1,
    researches: [
      createResearch('slinger', 'Slinger', 4, 1, '⚔️'),
      createResearch('archer', 'Archer', 8, 1, '🏹'),
      createResearch('city_guard', 'City Guard', 3, 1, '🛡️'),
    ],
  },
  {
    requiredAcademyLevel: 4,
    researches: [
      createResearch('hoplite', 'Hoplite', 8, 4, '🪖'),
      createResearch('meteorology', 'Meteorology', 4, 4, '🌬️'),
    ],
  },
  {
    requiredAcademyLevel: 7,
    researches: [
      createResearch('espionage', 'Espionage', 3, 7, '🕵️'),
      createResearch('villager_loyalty', 'Villager Loyalty', 6, 7, '🏘️'),
      createResearch('ceramics', 'Ceramics', 4, 7, '🏺'),
    ],
  },
  {
    requiredAcademyLevel: 10,
    researches: [
      createResearch('horseman', 'Horseman', 8, 10, '🐎'),
      createResearch('architecture', 'Architecture', 6, 10, '🏛️'),
      createResearch('instructor', 'Instructor', 4, 10, '🎓'),
    ],
  },
  {
    requiredAcademyLevel: 13,
    researches: [
      createResearch('bireme', 'Bireme', 8, 13, '⛵'),
      createResearch('crane', 'Crane', 4, 13, '🏗️'),
      createResearch('shipwright', 'Shipwright', 6, 13, '🪚'),
      createResearch('colony_ship', 'Colony Ship', 0, 13, '🚢'),
    ],
  },
  {
    requiredAcademyLevel: 16,
    researches: [
      createResearch('chariot', 'Chariot', 8, 16, '🏇'),
      createResearch('fire_ship', 'Fire Ship', 8, 16, '🔥'),
      createResearch('conscription', 'Conscription', 4, 16, '📜'),
    ],
  },
  {
    requiredAcademyLevel: 19,
    researches: [
      createResearch('demolition_ship', 'Demolition Ship', 8, 19, '💥'),
      createResearch('catapult', 'Catapult', 8, 19, '🪨'),
      createResearch('cryptography', 'Cryptography', 6, 19, '🔐'),
    ],
  },
  {
    requiredAcademyLevel: 22,
    researches: [
      createResearch('fast_transport_ship', 'Fast Transport Ship', 8, 22, '🚤'),
      createResearch('plow', 'Plow', 4, 22, '🌾'),
      createResearch('bunks', 'Bunks', 6, 22, '🛏️'),
    ],
  },
  {
    requiredAcademyLevel: 25,
    researches: [
      createResearch('trireme', 'Trireme', 8, 25, '⚓'),
      createResearch('phalanx', 'Phalanx', 9, 25, '🛡️'),
      createResearch('breakthrough', 'Breakthrough', 6, 25, '➜'),
      createResearch('mathematics', 'Mathematics', 6, 25, 'Σ'),
    ],
  },
  {
    requiredAcademyLevel: 28,
    researches: [
      createResearch('revolt', 'Revolt', 0, 28, '✊'),
      createResearch('ram', 'Ram', 10, 28, '🐏'),
      createResearch('cartography', 'Cartography', 8, 28, '🗺️'),
    ],
  },
  {
    requiredAcademyLevel: 31,
    researches: [
      createResearch('stone_hail', 'Stone Hail', 4, 31, '☄️'),
      createResearch('temple_looting', 'Temple Looting', 6, 31, '🏺'),
      createResearch('divine_selection', 'Divine Selection', 10, 31, '✨'),
    ],
  },
  {
    requiredAcademyLevel: 34,
    researches: [
      createResearch('combat_experience', 'Combat Experience', 6, 34, '🎖️'),
      createResearch('strong_wine', 'Strong Wine', 4, 34, '🍷'),
      createResearch('set_sail', 'Set Sail', 8, 34, '⛵'),
    ],
  },
];

export const academyResearchDefinitions: readonly AcademyResearchDefinition[] =
  academyResearchLevelGroups.flatMap((group) => group.researches);
