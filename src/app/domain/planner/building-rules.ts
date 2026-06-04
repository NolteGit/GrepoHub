import { cityBuildingPlanDefinitions } from '../../data/city-planner-presets';
import type { CityBuildingPlanDefinition } from '../../models/city-configuration.model';

export const landExpansionMaxLevel = 6;

const landExpansionPopulationPerLevel = 50;

const cityBuildingMinimumLevels: Record<string, number> = {
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

export function getCityBuildingDefinition(
  buildingId: string,
): CityBuildingPlanDefinition | undefined {
  return cityBuildingPlanDefinitions.find((building) => building.id === buildingId);
}

export function getCityBuildingMaxLevel(buildingId: string): number {
  return getCityBuildingDefinition(buildingId)?.maxLevel ?? 40;
}

export function clampLandExpansionLevel(level: number): number {
  return Math.min(landExpansionMaxLevel, normalizeNonNegativeInteger(level));
}

export function clampCityBuildingLevel(buildingId: string, level: number): number {
  if (buildingId === 'land_expansion') {
    return clampLandExpansionLevel(level);
  }

  return Math.min(getCityBuildingMaxLevel(buildingId), normalizeNonNegativeInteger(level));
}

export function clampCityBuildingLevelForPopulation(buildingId: string, level: number): number {
  const definition = getCityBuildingDefinition(buildingId);
  const normalizedLevel = normalizeNonNegativeInteger(level);

  if (!definition) {
    return normalizedLevel;
  }

  return Math.min(
    Math.max(normalizedLevel, cityBuildingMinimumLevels[buildingId] ?? 0),
    definition.maxLevel,
  );
}

export function createMinimumCityBuildingLevels(): Record<string, number> {
  return cityBuildingPlanDefinitions.reduce(
    (levels, building) => {
      levels[building.id] = Math.min(
        cityBuildingMinimumLevels[building.id] ?? 0,
        building.maxLevel,
      );

      return levels;
    },
    {} as Record<string, number>,
  );
}

export function getLandExpansionPopulationBonus(level: number): number {
  return clampLandExpansionLevel(level) * landExpansionPopulationPerLevel;
}

export function createLandExpansionProgressSteps(level: number): readonly boolean[] {
  const normalizedLevel = clampLandExpansionLevel(level);

  return Array.from({ length: landExpansionMaxLevel }, (_, index) => index < normalizedLevel);
}

function normalizeNonNegativeInteger(value: number): number {
  return Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
}
