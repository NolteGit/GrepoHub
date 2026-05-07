import {
  CityBuildingPlanDefinition,
  CityConfiguration,
  CityModifierDefinition,
} from '../models/city-configuration.model';

const createLinearPopulationTable = (
  maxLevel: number,
  populationPerLevel: number,
): number[] => {
  return Array.from({ length: maxLevel + 1 }, (_, level) => level * populationPerLevel);
};

export const cityBuildingPlanDefinitions: CityBuildingPlanDefinition[] = [
  {
    id: 'farm',
    maxLevel: 45,
    populationByLevel: createLinearPopulationTable(45, 12),
  },
  {
    id: 'senate',
    maxLevel: 25,
    populationByLevel: createLinearPopulationTable(25, -1),
  },
  {
    id: 'academy',
    maxLevel: 36,
    populationByLevel: createLinearPopulationTable(36, -3),
  },
  {
    id: 'timber_camp',
    maxLevel: 40,
    populationByLevel: createLinearPopulationTable(40, -1),
  },
  {
    id: 'quarry',
    maxLevel: 40,
    populationByLevel: createLinearPopulationTable(40, -1),
  },
  {
    id: 'silver_mine',
    maxLevel: 40,
    populationByLevel: createLinearPopulationTable(40, -1),
  },
  {
    id: 'barracks',
    maxLevel: 30,
    populationByLevel: createLinearPopulationTable(30, -4),
  },
  {
    id: 'harbour',
    maxLevel: 30,
    populationByLevel: createLinearPopulationTable(30, -4),
  },
  {
    id: 'city_wall',
    maxLevel: 25,
    populationByLevel: createLinearPopulationTable(25, -1),
  },
  {
    id: 'temple',
    maxLevel: 25,
    populationByLevel: createLinearPopulationTable(25, -3),
  },
  {
    id: 'marketplace',
    maxLevel: 30,
    populationByLevel: createLinearPopulationTable(30, -3),
  },
  {
    id: 'cave',
    maxLevel: 10,
    populationByLevel: createLinearPopulationTable(10, -3),
  },
  {
    id: 'warehouse',
    maxLevel: 35,
    populationByLevel: createLinearPopulationTable(35, -2),
  },
  {
    id: 'land_expansion',
    maxLevel: 10,
    populationByLevel: createLinearPopulationTable(10, 20),
  },
];

export const cityModifierDefinitions: CityModifierDefinition[] = [
  {
    id: 'specialBuildingSlot1',
    populationDelta: 0,
  },
  {
    id: 'specialBuildingSlot2',
    populationDelta: 0,
  },
  {
    id: 'plowResearched',
    populationDelta: 200,
  },
  {
    id: 'thermalBathsBuilt',
    populationDelta: 50,
  },
  {
    id: 'aphroditeActive',
    populationDelta: 0,
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
      cave: 10,
      warehouse: 25,
      land_expansion: 0,
    },
    modifiers: {
      specialBuildingSlot1: false,
      specialBuildingSlot2: false,
      plowResearched: true,
      thermalBathsBuilt: false,
      aphroditeActive: false,
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
      timber_camp: 10,
      quarry: 10,
      silver_mine: 10,
      barracks: 5,
      harbour: 0,
      city_wall: 5,
      temple: 5,
      marketplace: 0,
      cave: 0,
      warehouse: 10,
      land_expansion: 0,
    },
    modifiers: {
      specialBuildingSlot1: false,
      specialBuildingSlot2: false,
      plowResearched: false,
      thermalBathsBuilt: false,
      aphroditeActive: false,
    },
  },
];