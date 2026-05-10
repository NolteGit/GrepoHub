import {
  CityBuildingPlanDefinition,
  CityConfiguration,
  CityModifierDefinition,
  CitySpecialBuildingOptionDefinition,
  CitySpecialBuildingSlotDefinition,
} from '../models/city-configuration.model';

const createLinearPopulationTable = (maxLevel: number, populationPerLevel: number): number[] => {
  return Array.from({ length: maxLevel + 1 }, (_, level) => level * populationPerLevel);
};

const FARM_POPULATION = [
  0, 114, 121, 134, 152, 175, 206, 245, 291, 343, 399, 458, 520, 584, 651, 720, 790, 863, 938, 1015,
  1094, 1174, 1257, 1341, 1426, 1514, 1602, 1693, 1785, 1878, 1973, 2070, 2168, 2267, 2368, 2470,
  2573, 2678, 2784, 2891, 3000, 3109, 3220, 3332, 3446, 3560,
];

const SENATE_POPULATION = [
  0, -1, -3, -6, -8, -12, -15, -19, -23, -27, -32, -37, -42, -47, -53, -59, -64, -71, -77, -83, -90,
  -97, -104, -111, -118, -125,
];

const RESOURCE_BUILDING_POPULATION = [
  0, -1, -3, -4, -6, -8, -10, -12, -14, -16, -18, -20, -23, -25, -28, -30, -32, -35, -38, -40, -43,
  -45, -48, -51, -54, -56, -59, -62, -65, -68, -71, -74, -77, -80, -83, -86, -89, -92, -95, -98,
  -101,
];

const BARRACKS_POPULATION = [
  0, -1, -3, -5, -7, -9, -11, -13, -15, -18, -20, -23, -26, -29, -31, -34, -37, -40, -43, -46, -50,
  -53, -56, -59, -63, -66, -70, -73, -77, -80, -84,
];

const CITY_WALL_POPULATION = [
  -1, -3, -6, -9, -11, -14, -17, -21, -24, -27, -30, -34, -37, -41, -44, -48, -51, -55, -59, -62,
  -66, -70, -74, -77, -81, -85,
];

const MARKETPLACE_POPULATION = [
  0, -2, -5, -7, -10, -12, -15, -17, -20, -23, -26, -28, -31, -34, -37, -40, -43, -46, -49, -51,
  -54, -57, -60, -63, -66, -69, -72, -76, -79, -82, -85,
];

const CAVE_POPULATION = [0, -3, -5, -6, -6, -7, -8, -8, -9, -9, -10];

export const cityBuildingPlanDefinitions: CityBuildingPlanDefinition[] = [
  {
    id: 'farm',
    maxLevel: 45,
    populationByLevel: FARM_POPULATION,
  },
  {
    id: 'senate',
    maxLevel: 25,
    populationByLevel: SENATE_POPULATION,
  },
  {
    id: 'academy',
    maxLevel: 36,
    populationByLevel: createLinearPopulationTable(36, -3),
  },
  {
    id: 'timber_camp',
    maxLevel: 40,
    populationByLevel: RESOURCE_BUILDING_POPULATION,
  },
  {
    id: 'quarry',
    maxLevel: 40,
    populationByLevel: RESOURCE_BUILDING_POPULATION,
  },
  {
    id: 'silver_mine',
    maxLevel: 40,
    populationByLevel: RESOURCE_BUILDING_POPULATION,
  },
  {
    id: 'barracks',
    maxLevel: 30,
    populationByLevel: BARRACKS_POPULATION,
  },
  {
    id: 'harbour',
    maxLevel: 30,
    populationByLevel: createLinearPopulationTable(30, -4),
  },
  {
    id: 'city_wall',
    maxLevel: 25,
    populationByLevel: CITY_WALL_POPULATION,
  },
  {
    id: 'temple',
    maxLevel: 25,
    populationByLevel: createLinearPopulationTable(25, -5),
  },
  {
    id: 'marketplace',
    maxLevel: 30,
    populationByLevel: MARKETPLACE_POPULATION,
  },
  {
    id: 'cave',
    maxLevel: 10,
    populationByLevel: CAVE_POPULATION,
  },
  {
    id: 'warehouse',
    maxLevel: 35,
    populationByLevel: createLinearPopulationTable(35, 0),
  },
  {
    id: 'land_expansion',
    maxLevel: 6,
    populationByLevel: createLinearPopulationTable(6, 50),
  },
];

export const cityModifierDefinitions: CityModifierDefinition[] = [
  {
    id: 'plowResearched',
    populationDelta: 200,
  },
  {
    id: 'aphroditeActive',
    populationDelta: 0,
  },
];

export const citySpecialBuildingSlotDefinitions: CitySpecialBuildingSlotDefinition[] = [
  {
    id: 'slot1',
    optionIds: ['none', 'theatre', 'thermal_baths', 'library', 'lighthouse'],
  },
  {
    id: 'slot2',
    optionIds: ['none', 'tower', 'divine_statue', 'oracle', 'merchants_shop'],
  },
];

export const citySpecialBuildingOptionDefinitions: CitySpecialBuildingOptionDefinition[] = [
  {
    id: 'none',
    populationDelta: 0,
  },
  {
    id: 'theatre',
    populationDelta: -60,
  },
  {
    id: 'thermal_baths',
    populationDelta: -60,
  },
  {
    id: 'library',
    populationDelta: -60,
  },
  {
    id: 'lighthouse',
    populationDelta: -60,
  },
  {
    id: 'tower',
    populationDelta: -60,
  },
  {
    id: 'divine_statue',
    populationDelta: -60,
  },
  {
    id: 'oracle',
    populationDelta: -60,
  },
  {
    id: 'merchants_shop',
    populationDelta: -60,
  },
];

export const cityConfigurationPresets: CityConfiguration[] = [
  {
    id: 'preset-balanced-city',
    name: 'Balanced City',
    isPreset: true,
    buildingLevels: {
      farm: 40,
      senate: 20,
      academy: 30,
      timber_camp: 30,
      quarry: 30,
      silver_mine: 30,
      barracks: 20,
      harbour: 20,
      city_wall: 20,
      temple: 20,
      marketplace: 20,
      cave: 6,
      warehouse: 25,
      land_expansion: 0,
    },
    modifiers: {
      plowResearched: true,
      aphroditeActive: false,
    },
    specialBuildings: {
      slot1: 'none',
      slot2: 'none',
    },
  },
  {
    id: 'preset-fresh-city',
    name: 'Fresh City',
    isPreset: true,
    buildingLevels: {
      farm: 10,
      senate: 10,
      academy: 0,
      timber_camp: 15,
      quarry: 15,
      silver_mine: 12,
      barracks: 4,
      harbour: 0,
      city_wall: 0,
      temple: 11,
      marketplace: 2,
      cave: 0,
      warehouse: 10,
      land_expansion: 0,
    },
    modifiers: {
      plowResearched: false,
      aphroditeActive: false,
    },
    specialBuildings: {
      slot1: 'none',
      slot2: 'none',
    },
  },
];
