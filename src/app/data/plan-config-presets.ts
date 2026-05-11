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

const createCityPlan = (
  id: string,
  name: string,
  levels: {
    readonly senate: number;
    readonly farm?: number;
    readonly timberCamp: number;
    readonly quarry: number;
    readonly silverMine: number;
    readonly barracks: number;
    readonly harbour: number;
    readonly marketplace: number;
    readonly academy: number;
    readonly temple: number;
    readonly warehouse: number;
    readonly cityWall?: number;
    readonly cave?: number;
    readonly landExpansion?: number;
  },
): CityConfiguration => ({
  id,
  name,
  isPreset: true,
  buildingLevels: {
    senate: levels.senate,
    farm: levels.farm ?? 45,
    timber_camp: levels.timberCamp,
    quarry: levels.quarry,
    silver_mine: levels.silverMine,
    barracks: levels.barracks,
    temple: levels.temple,
    marketplace: levels.marketplace,
    warehouse: levels.warehouse,
    harbour: levels.harbour,
    academy: levels.academy,
    city_wall: levels.cityWall ?? 0,
    cave: levels.cave ?? 10,
    land_expansion: levels.landExpansion ?? 0,
  },
  modifiers: {
    plowResearched: true,
    aphroditeActive: true,
  },
  specialBuildings: {
    slot1: 'thermal_baths',
    slot2: 'merchants_shop',
  },
});

const createTroopPlan = (
  id: string,
  name: string,
  unitAmounts: Record<string, number>,
  modifiers: Partial<TroopConfiguration['modifiers']> = {},
): TroopConfiguration => ({
  id,
  name,
  isPreset: true,
  unitAmounts,
  modifiers: {
    bunks: false,
    ...modifiers,
  },
});

const createPlanPreset = (
  id: string,
  name: string,
  cityPlan: CityConfiguration,
  troopPlan: TroopConfiguration,
): PlanConfig => ({
  id,
  name,
  isPreset: true,
  createdAt: null,
  updatedAt: null,
  settings: { ...defaultSettings },
  cityPlan: cloneCityPlan(cityPlan),
  troopPlan: cloneTroopPlan(troopPlan),
});

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

const hybridCityPlan = createCityPlan('preset-hybrid-city', 'Hybrid City', {
  senate: 24,
  timberCamp: 40,
  quarry: 40,
  silverMine: 40,
  barracks: 30,
  harbour: 20,
  marketplace: 30,
  academy: 36,
  temple: 5,
  warehouse: 1,
});

const hybridTroopPlan = createTroopPlan(
  'preset-hybrid-troops',
  'Hybrid Troops',
  {
    colony_ship: 1,
    fire_ship: 0,
    trireme: 5,
    siren: 13,
    transport_boat: 1,
    fast_transport_ship: 140,
    archer: 0,
    light_ship: 1,
    hoplite: 2240,
  },
  { bunks: true },
);

const mixDeffCityPlan = createCityPlan('preset-mix-deff-city', 'Mix-Deff City', {
  senate: 24,
  timberCamp: 40,
  quarry: 40,
  silverMine: 40,
  barracks: 30,
  harbour: 10,
  marketplace: 30,
  academy: 36,
  temple: 5,
  warehouse: 35,
});

const mixDeffTroopPlan = createTroopPlan(
  'preset-mix-deff-troops',
  'Mix-Deff Troops',
  {
    bireme: 150,
    siren: 9,
    transport_boat: 1,
    fast_transport_ship: 100,
    swordsman: 100,
    archer: 700,
    chariot: 200,
    light_ship: 1,
  },
  { bunks: true },
);

const soBalCityPlan = createCityPlan('preset-so-bal-city', 'SO Bal City', {
  senate: 9,
  timberCamp: 40,
  quarry: 20,
  silverMine: 20,
  barracks: 1,
  harbour: 30,
  marketplace: 16,
  academy: 1,
  temple: 5,
  warehouse: 35,
});

const soBalTroopPlan = createTroopPlan('preset-so-bal-troops', 'SO Bal Troops', {
  fire_ship: 0,
  siren: 1,
  transport_boat: 1,
  light_ship: 380,
});

const triremCityPlan = createCityPlan('preset-trirem-city', 'Trirem City', {
  senate: 9,
  timberCamp: 40,
  quarry: 40,
  silverMine: 40,
  barracks: 1,
  harbour: 30,
  marketplace: 30,
  academy: 36,
  temple: 5,
  warehouse: 35,
});

const triremTroopPlan = createTroopPlan('preset-trirem-troops', 'Trirem Troops', {
  fire_ship: 0,
  trireme: 200,
  siren: 20,
  transport_boat: 1,
  light_ship: 1,
});

export const planConfigPresets: PlanConfig[] = [
  createEmptyPlanPreset(),
  createPlanPreset('preset-hybrid-plan', 'Hybrid', hybridCityPlan, hybridTroopPlan),
  createPlanPreset('preset-mix-deff-plan', 'Mix-Deff', mixDeffCityPlan, mixDeffTroopPlan),
  createPlanPreset('preset-so-bal-plan', 'SO Bal', soBalCityPlan, soBalTroopPlan),
  createPlanPreset('preset-trirem-plan', 'Trirem', triremCityPlan, triremTroopPlan),
];
