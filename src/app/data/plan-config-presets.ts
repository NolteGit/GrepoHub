import { cityConfigurationPresets } from './city-planner-presets';
import { troopConfigurationPresets } from './troops-planner-presets';
import { CityConfiguration } from '../models/city-configuration.model';
import { PLAN_CONFIG_VERSION, PlanConfig, PlanConfigSettings } from '../models/plan-config.model';
import { TroopConfiguration } from '../models/troop-configuration.model';

const defaultSettings: PlanConfigSettings = {
  worldSpeed: null,
  unitSpeed: null,
  timezone: null,
  locale: null,
};

const cloneCityPlan = (configuration: CityConfiguration): CityConfiguration => ({
  ...configuration,
  buildingLevels: { ...configuration.buildingLevels },
  modifiers: { ...configuration.modifiers },
  specialBuildings: { ...configuration.specialBuildings },
});

const cloneTroopPlan = (configuration: TroopConfiguration): TroopConfiguration => ({
  ...configuration,
  unitAmounts: { ...configuration.unitAmounts },
  modifiers: { ...configuration.modifiers },
});

const createPlanPreset = (
  id: string,
  name: string,
  cityPresetId: string,
  troopPresetId: string,
): PlanConfig => {
  const cityPlan = cityConfigurationPresets.find(
    (configuration) => configuration.id === cityPresetId,
  );
  const troopPlan = troopConfigurationPresets.find(
    (configuration) => configuration.id === troopPresetId,
  );

  return {
    id,
    name,
    isPreset: true,
    createdAt: null,
    updatedAt: null,
    settings: { ...defaultSettings },
    cityPlan: cloneCityPlan(cityPlan ?? cityConfigurationPresets[0]),
    troopPlan: cloneTroopPlan(troopPlan ?? troopConfigurationPresets[0]),
  };
};

const emptyCityPlan: CityConfiguration = {
  id: 'preset-empty-city',
  name: 'Empty City',
  isPreset: true,
  buildingLevels: {
    senate: 9,
    farm: 1,
    timber_camp: 1,
    quarry: 1,
    silver_mine: 1,
    barracks: 1,
    temple: 1,
    marketplace: 1,
    warehouse: 1,
    harbour: 0,
    academy: 0,
    city_wall: 0,
    cave: 0,
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
};

const emptyTroopPlan: TroopConfiguration = {
  id: 'preset-empty-troops',
  name: 'Empty Troops',
  isPreset: true,
  unitAmounts: {},
  modifiers: {
    bunks: false,
  },
};

const createEmptyPlanPreset = (): PlanConfig => ({
  id: 'preset-empty',
  name: 'Empty',
  isPreset: true,
  createdAt: null,
  updatedAt: null,
  settings: { ...defaultSettings },
  cityPlan: cloneCityPlan(emptyCityPlan),
  troopPlan: cloneTroopPlan(emptyTroopPlan),
});

export const planConfigPresets: PlanConfig[] = [
  createEmptyPlanPreset(),
  createPlanPreset('preset-balanced-plan', 'Balanced', 'preset-balanced-city', 'balanced-army'),
  createPlanPreset('preset-fresh-land-plan', 'Fresh Land', 'preset-fresh-city', 'land-offense'),
  createPlanPreset(
    'preset-naval-defense-plan',
    'Naval Defense',
    'preset-balanced-city',
    'naval-defense',
  ),
];
