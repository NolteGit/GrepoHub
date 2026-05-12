import { CityConfiguration } from '../models/city-configuration.model';
import { PlanConfig } from '../models/plan-config.model';
import { TroopConfiguration } from '../models/troop-configuration.model';

import {
  clonePlan,
  createEmptyUnitAmounts,
  createImportedPlanId,
  createMinimumBuildingLevels,
  createUniqueNameFromNames,
  normalizeCityConfiguration,
  normalizeDisplayPlanName,
  normalizeNameKey,
  normalizePlanConfig,
  normalizeTroopConfiguration,
} from './plan-config-normalization';

describe('plan config normalization', () => {
  it('normalizes city configs by clamping levels and migrating legacy thermal baths', () => {
    const rawCityConfiguration = {
      id: 'city-1',
      name: '  Imported City  ',
      isPreset: true,
      buildingLevels: {
        farm: 99.6,
        senate: -5,
        barracks: '7.4',
        harbour: Number.NaN,
        academy: 'not-a-number',
        land_expansion: 2.4,
      },
      modifiers: {
        plowResearched: 1,
        aphroditeActive: 0,
        thermalBathsBuilt: true,
      },
      specialBuildings: {
        slot2: 'invalid-slot-option',
      },
    } as unknown as Partial<CityConfiguration>;

    const normalized = normalizeCityConfiguration(rawCityConfiguration);

    expect(normalized.id).toBe('city-1');
    expect(normalized.name).toBe('Imported City');
    expect(normalized.isPreset).toBe(true);
    expect(normalized.buildingLevels['farm']).toBe(45);
    expect(normalized.buildingLevels['senate']).toBe(0);
    expect(normalized.buildingLevels['barracks']).toBe(7);
    expect(normalized.buildingLevels['harbour']).toBe(0);
    expect(normalized.buildingLevels['academy']).toBe(0);
    expect(normalized.buildingLevels['land_expansion']).toBe(2);
    expect(normalized.modifiers).toEqual({
      plowResearched: true,
      aphroditeActive: false,
    });
    expect(normalized.specialBuildings).toEqual({
      slot1: 'thermal_baths',
      slot2: 'none',
    });
  });

  it('normalizes troop configs by accepting only known units and safe amounts', () => {
    const rawTroopConfiguration = {
      id: 'troops-1',
      name: '  Imported Troops  ',
      isPreset: true,
      unitAmounts: {
        swordsman: 12.6,
        archer: -4,
        hydra: '5',
        horseman: 50000,
        slinger: 'bad-value',
        unknown_unit: 25,
      },
      modifiers: {
        bunks: 'yes',
      },
    } as unknown as Partial<TroopConfiguration>;

    const normalized = normalizeTroopConfiguration(rawTroopConfiguration);

    expect(normalized.id).toBe('troops-1');
    expect(normalized.name).toBe('Imported Troops');
    expect(normalized.isPreset).toBe(true);
    expect(normalized.unitAmounts['swordsman']).toBe(13);
    expect(normalized.unitAmounts['archer']).toBe(0);
    expect(normalized.unitAmounts['hydra']).toBe(5);
    expect(normalized.unitAmounts['horseman']).toBe(10000);
    expect(normalized.unitAmounts['slinger']).toBe(0);
    expect(normalized.unitAmounts['unknown_unit']).toBeUndefined();
    expect(normalized.modifiers.bunks).toBe(true);
  });

  it('builds a complete normalized plan from partial input and safe defaults', () => {
    const rawPlan = {
      id: '',
      name: '  Attack Plan  ',
      settings: {
        worldSpeed: '3',
        unitSpeed: -1,
        timezone: 'Europe/Vienna',
        locale: '',
      },
      cityPlan: {
        name: 'Nested City',
        buildingLevels: { farm: 12 },
      },
      troopPlan: {
        name: 'Nested Troops',
        unitAmounts: { swordsman: 20 },
      },
    } as unknown as Partial<PlanConfig>;

    const normalized = normalizePlanConfig(rawPlan);

    expect(normalized.id).toMatch(/^custom-plan-/);
    expect(normalized.name).toBe('Attack');
    expect(normalized.settings).toEqual({
      worldSpeed: 3,
      unitSpeed: null,
      timezone: 'Europe/Vienna',
      locale: null,
    });
    expect(normalized.cityPlan.name).toBe('Nested City');
    expect(normalized.cityPlan.buildingLevels['farm']).toBe(12);
    expect(normalized.troopPlan.name).toBe('Nested Troops');
    expect(normalized.troopPlan.unitAmounts['swordsman']).toBe(20);
  });

  it('creates minimum building levels and empty unit amount maps for reset workflows', () => {
    const minimumLevels = createMinimumBuildingLevels();
    const emptyAmounts = createEmptyUnitAmounts({
      custom_unit: 99,
      swordsman: 25,
    });

    expect(minimumLevels['senate']).toBe(9);
    expect(minimumLevels['farm']).toBe(1);
    expect(minimumLevels['harbour']).toBe(0);
    expect(minimumLevels['land_expansion']).toBe(0);
    expect(emptyAmounts['custom_unit']).toBe(0);
    expect(emptyAmounts['swordsman']).toBe(0);
    expect(emptyAmounts['bireme']).toBe(0);
  });

  it('creates duplicate-safe names with normalized whitespace and casing', () => {
    expect(createUniqueNameFromNames(' Alpha  Plan ', 'Copy', [])).toBe('Alpha');
    expect(createUniqueNameFromNames('Alpha', 'Copy', [' alpha ', 'Alpha Copy'])).toBe(
      'Alpha Copy 2',
    );
    expect(createUniqueNameFromNames('Alpha Copy 2', 'Copy', ['Alpha Copy', 'Alpha Copy 2'])).toBe(
      'Alpha Copy 3',
    );
    expect(normalizeNameKey('  Alpha    Copy  ')).toBe('alpha copy');
    expect(normalizeDisplayPlanName('  Alpha Plan  ', 'Fallback')).toBe('Alpha');
  });

  it('creates portable imported IDs and deep-clones nested plan objects', () => {
    const plan = normalizePlanConfig({
      id: 'plan-1',
      name: 'Clone Source',
      cityPlan: {
        id: 'city-1',
        name: 'City',
        buildingLevels: { farm: 10 },
        modifiers: {
          plowResearched: false,
          aphroditeActive: false,
        },
        specialBuildings: {
          slot1: 'none',
          slot2: 'none',
        },
      },
      troopPlan: {
        id: 'troops-1',
        name: 'Troops',
        unitAmounts: { swordsman: 20 },
        isPreset: false,
        modifiers: {
          bunks: false,
        },
      },
    });
    const clonedPlan = clonePlan(plan);

    clonedPlan.settings.worldSpeed = 2;
    clonedPlan.cityPlan.buildingLevels['farm'] = 20;
    clonedPlan.cityPlan.specialBuildings.slot1 = 'library';
    clonedPlan.troopPlan.unitAmounts['swordsman'] = 40;
    clonedPlan.troopPlan.modifiers.bunks = true;

    expect(createImportedPlanId('imported-plan', ' My Nice Plan! ', '123')).toBe(
      'imported-plan-my-nice-plan-123',
    );
    expect(plan.settings.worldSpeed).toBeNull();
    expect(plan.cityPlan.buildingLevels['farm']).toBe(10);
    expect(plan.cityPlan.specialBuildings.slot1).toBe('none');
    expect(plan.troopPlan.unitAmounts['swordsman']).toBe(20);
    expect(plan.troopPlan.modifiers.bunks).toBe(false);
  });
});