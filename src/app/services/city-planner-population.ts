import {
  cityBuildingPlanDefinitions,
  cityModifierDefinitions,
  citySpecialBuildingOptionDefinitions,
} from '../data/city-planner-presets';
import {
  CityBuildingPlanDefinition,
  CityConfiguration,
  CitySpecialBuildingOptionId,
} from '../models/city-configuration.model';

const cityBuildingMinLevels: Record<string, number> = {
  barracks: 1,
  farm: 1,
  marketplace: 1,
  quarry: 1,
  senate: 9,
  silver_mine: 1,
  temple: 1,
  timber_camp: 1,
  warehouse: 1,
};

export interface CityPlannerPopulationBreakdown {
  readonly farmLevel: number;
  readonly farmCapacity: number;
  readonly aphroditeCapacity: number;
  readonly thermalBaseCapacity: number;
  readonly thermalAdjustedCapacity: number;
  readonly otherBuildingCapacity: number;
  readonly fixedModifierCapacity: number;
  readonly specialBuildingCapacity: number;
  readonly buildingUsedPopulation: number;
  readonly specialBuildingUsedPopulation: number;
}

export interface CityPlannerPopulationResult {
  readonly populationCapacity: number;
  readonly usedPopulation: number;
  readonly freePopulation: number;
  readonly breakdown: CityPlannerPopulationBreakdown;
}

export function calculateCityPlannerPopulation(
  configuration: CityConfiguration,
): CityPlannerPopulationResult {
  const farmLevel = getCityPlannerBuildingLevel(configuration, 'farm');
  const farmCapacity = Math.max(getCityPlannerBuildingPopulation('farm', farmLevel), 0);
  const aphroditeCapacity = configuration.modifiers['aphroditeActive'] ? farmLevel * 5 : 0;
  const thermalBaseCapacity = farmCapacity + aphroditeCapacity;
  const thermalAdjustedCapacity = hasCityPlannerSpecialBuilding(configuration, 'thermal_baths')
    ? Math.round(thermalBaseCapacity * 1.1)
    : thermalBaseCapacity;
  const otherBuildingCapacity = cityBuildingPlanDefinitions.reduce((sum, building) => {
    if (building.id === 'farm') {
      return sum;
    }

    const level = getCityPlannerBuildingLevel(configuration, building.id);
    const population = getCityPlannerBuildingPopulation(building.id, level);

    return population > 0 ? sum + population : sum;
  }, 0);
  const fixedModifierCapacity = cityModifierDefinitions.reduce((sum, modifier) => {
    if (!configuration.modifiers[modifier.id] || modifier.id === 'aphroditeActive') {
      return sum;
    }

    return sum + Math.max(modifier.populationDelta, 0);
  }, 0);
  const specialBuildingCapacity = getCityPlannerSpecialBuildingPopulationCapacity(configuration);
  const populationCapacity =
    thermalAdjustedCapacity + otherBuildingCapacity + fixedModifierCapacity + specialBuildingCapacity;
  const buildingUsedPopulation = cityBuildingPlanDefinitions.reduce((sum, building) => {
    const level = getCityPlannerBuildingLevel(configuration, building.id);
    const population = getExactCityPlannerBuildingPopulation(building.id, level);

    return population < 0 ? sum + Math.abs(population) : sum;
  }, 0);
  const specialBuildingUsedPopulation = getCityPlannerSpecialBuildingUsedPopulation(configuration);
  const usedPopulation = Math.round(buildingUsedPopulation + specialBuildingUsedPopulation);

  return {
    populationCapacity,
    usedPopulation,
    freePopulation: populationCapacity - usedPopulation,
    breakdown: {
      farmLevel,
      farmCapacity,
      aphroditeCapacity,
      thermalBaseCapacity,
      thermalAdjustedCapacity,
      otherBuildingCapacity,
      fixedModifierCapacity,
      specialBuildingCapacity,
      buildingUsedPopulation,
      specialBuildingUsedPopulation,
    },
  };
}

function getCityPlannerBuildingLevel(configuration: CityConfiguration, buildingId: string): number {
  const definition = getCityPlannerBuildingDefinition(buildingId);
  const configuredLevel = configuration.buildingLevels[buildingId] ?? 0;

  if (!definition) {
    return configuredLevel;
  }

  return Math.min(
    Math.max(configuredLevel, cityBuildingMinLevels[buildingId] ?? 0),
    definition.maxLevel,
  );
}

function getCityPlannerBuildingPopulation(buildingId: string, level: number): number {
  return roundCityPlannerPopulation(getExactCityPlannerBuildingPopulation(buildingId, level));
}

function getExactCityPlannerBuildingPopulation(buildingId: string, level: number): number {
  const definition = getCityPlannerBuildingDefinition(buildingId);

  if (!definition) {
    return 0;
  }

  return definition.populationByLevel[level] ?? 0;
}

function getCityPlannerBuildingDefinition(
  buildingId: string,
): CityBuildingPlanDefinition | undefined {
  return cityBuildingPlanDefinitions.find((building) => building.id === buildingId);
}

function getCityPlannerSpecialBuildingPopulation(
  optionId: CitySpecialBuildingOptionId,
): number {
  const option = citySpecialBuildingOptionDefinitions.find((definition) => {
    return definition.id === optionId;
  });

  return option?.populationDelta ?? 0;
}

function getCityPlannerSpecialBuildingPopulationCapacity(
  configuration: CityConfiguration,
): number {
  return Object.values(configuration.specialBuildings).reduce((sum, optionId) => {
    const delta = getCityPlannerSpecialBuildingPopulation(optionId);

    return delta > 0 ? sum + delta : sum;
  }, 0);
}

function getCityPlannerSpecialBuildingUsedPopulation(configuration: CityConfiguration): number {
  return Object.values(configuration.specialBuildings).reduce((sum, optionId) => {
    const delta = getCityPlannerSpecialBuildingPopulation(optionId);

    return delta < 0 ? sum + Math.abs(delta) : sum;
  }, 0);
}

function hasCityPlannerSpecialBuilding(
  configuration: CityConfiguration,
  optionId: CitySpecialBuildingOptionId,
): boolean {
  return Object.values(configuration.specialBuildings).includes(optionId);
}

function roundCityPlannerPopulation(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}
