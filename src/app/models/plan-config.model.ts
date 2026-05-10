import { CityConfiguration } from './city-configuration.model';
import { TroopConfiguration } from './troop-configuration.model';

export const PLAN_CONFIG_FORMAT = 'grepo-hub-plan-config';
export const PLAN_CONFIG_VERSION = 1;

type PlanConfigFormat = typeof PLAN_CONFIG_FORMAT;

export type PlanConfigSettings = {
  worldSpeed: number | null;
  unitSpeed: number | null;
  timezone: string | null;
  locale: string | null;
};

export type PlanConfig = {
  id: string;
  name: string;
  isPreset: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  settings: PlanConfigSettings;
  cityPlan: CityConfiguration;
  troopPlan: TroopConfiguration;
};

export type PlanConfigBundle = {
  format: PlanConfigFormat;
  version: number;
  exportedAt: string;
  plans: PlanConfig[];
};
