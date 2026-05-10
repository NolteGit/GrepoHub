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

export const planConfigPresets: PlanConfig[] = [
  createPlanPreset(
    'preset-balanced-plan',
    'Balanced Plan',
    'preset-balanced-city',
    'balanced-army',
  ),
  createPlanPreset(
    'preset-fresh-land-plan',
    'Fresh Land Plan',
    'preset-fresh-city',
    'land-offense',
  ),
  createPlanPreset(
    'preset-naval-defense-plan',
    'Naval Defense Plan',
    'preset-balanced-city',
    'naval-defense',
  ),
];

export const planConfigPresetVersion = PLAN_CONFIG_VERSION;
