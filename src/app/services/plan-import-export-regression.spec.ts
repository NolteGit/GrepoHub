import { TestBed } from '@angular/core/testing';

import { PLAN_CONFIG_FORMAT, PLAN_CONFIG_VERSION } from '../models/plan-config.model';
import { PlanConfigService } from './plan-config.service';
import { PlanFileTransferService } from './plan-file-transfer.service';

describe('plan import/export regression flows', () => {
  let planConfigService: PlanConfigService;
  let planFileTransferService: PlanFileTransferService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    planConfigService = TestBed.inject(PlanConfigService);
    planFileTransferService = TestBed.inject(PlanFileTransferService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('imports a portable JSON export as a new normalized custom plan', () => {
    planConfigService.selectPlan('preset-hybrid-plan');
    const sourcePlan = planConfigService.duplicateActivePlan('Round Trip Regression');

    planConfigService.updateActiveCityPlan({
      note: 'Roundtrip note',
      buildingLevels: {
        ...sourcePlan.cityPlan.buildingLevels,
        farm: 45,
        warehouse: 35,
      },
    });
    planConfigService.updateActiveTroopPlan({
      unitAmounts: {
        ...sourcePlan.troopPlan.unitAmounts,
        swordsman: 42,
        transport_boat: 3,
      },
    });

    const exportFile = planFileTransferService.createActivePlanJsonExport();
    const bundle = JSON.parse(exportFile.content) as {
      readonly format: string;
      readonly version: number;
      readonly plans: readonly Record<string, unknown>[];
    };

    expect(bundle.format).toBe(PLAN_CONFIG_FORMAT);
    expect(bundle.version).toBe(PLAN_CONFIG_VERSION);
    expect(bundle.plans[0]['isPreset']).toBeUndefined();
    expect((bundle.plans[0]['cityPlan'] as Record<string, unknown>)['isPreset']).toBeUndefined();
    expect((bundle.plans[0]['troopPlan'] as Record<string, unknown>)['isPreset']).toBeUndefined();

    const importResult = planConfigService.importJsonAsNewPlans(exportFile.content);
    const importedPlan = planConfigService.activePlan();

    expect(importResult.count).toBe(1);
    expect(importResult.plans[0]).toEqual({
      name: 'Round Trip Regression Import',
      requestedName: 'Round Trip Regression',
      renamed: true,
    });
    expect(importedPlan.name).toBe('Round Trip Regression Import');
    expect(importedPlan.id).not.toBe(sourcePlan.id);
    expect(importedPlan.cityPlan.id).not.toBe(sourcePlan.cityPlan.id);
    expect(importedPlan.troopPlan.id).not.toBe(sourcePlan.troopPlan.id);
    expect(importedPlan.isPreset).toBe(false);
    expect(importedPlan.cityPlan.isPreset).toBe(false);
    expect(importedPlan.troopPlan.isPreset).toBe(false);
    expect(importedPlan.cityPlan.note).toBe('Roundtrip note');
    expect(importedPlan.cityPlan.buildingLevels['farm']).toBe(45);
    expect(importedPlan.cityPlan.buildingLevels['warehouse']).toBe(35);
    expect(importedPlan.troopPlan.unitAmounts['swordsman']).toBe(42);
    expect(importedPlan.troopPlan.unitAmounts['transport_boat']).toBe(3);
  });

  it('repairs colliding imported IDs and duplicate imported names', () => {
    const bundle = {
      format: PLAN_CONFIG_FORMAT,
      version: PLAN_CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      plans: [
        {
          id: 'same-export-id',
          name: 'Collision Regression',
          cityPlan: {
            id: 'same-city-id',
            name: 'Collision City',
          },
          troopPlan: {
            id: 'same-troops-id',
            name: 'Collision Troops',
          },
        },
        {
          id: 'same-export-id',
          name: 'Collision Regression',
          cityPlan: {
            id: 'same-city-id',
            name: 'Collision City',
          },
          troopPlan: {
            id: 'same-troops-id',
            name: 'Collision Troops',
          },
        },
      ],
    };

    const initialIds = new Set(planConfigService.plans().map((plan) => plan.id));
    const importResult = planConfigService.importJsonAsNewPlans(JSON.stringify(bundle));
    const importedPlans = planConfigService
      .plans()
      .filter((plan) => !initialIds.has(plan.id) && plan.name.startsWith('Collision Regression'));

    expect(importResult).toEqual({
      count: 2,
      plans: [
        {
          name: 'Collision Regression',
          requestedName: 'Collision Regression',
          renamed: false,
        },
        {
          name: 'Collision Regression Import',
          requestedName: 'Collision Regression',
          renamed: true,
        },
      ],
    });
    expect(importedPlans.map((plan) => plan.name)).toEqual([
      'Collision Regression',
      'Collision Regression Import',
    ]);
    expect(new Set(importedPlans.map((plan) => plan.id)).size).toBe(2);
    expect(new Set(importedPlans.map((plan) => plan.cityPlan.id)).size).toBe(2);
    expect(new Set(importedPlans.map((plan) => plan.troopPlan.id)).size).toBe(2);
    expect(importedPlans.every((plan) => plan.id !== 'same-export-id')).toBe(true);
    expect(importedPlans.every((plan) => plan.cityPlan.id !== 'same-city-id')).toBe(true);
    expect(importedPlans.every((plan) => plan.troopPlan.id !== 'same-troops-id')).toBe(true);
  });

  it('normalizes partial imported plans instead of preserving unsafe values', () => {
    const bundle = {
      format: PLAN_CONFIG_FORMAT,
      version: PLAN_CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      plans: [
        {
          name: 'Partial Regression',
          settings: {
            selectedGod: 'not-a-real-god',
            worldSpeed: -10,
            unitSpeed: Number.POSITIVE_INFINITY,
          },
          cityPlan: {
            buildingLevels: {
              farm: 999,
              harbour: -5,
            },
            specialBuildings: {
              slot1: 'invalid-special-building',
              slot2: 'tower',
            },
          },
          troopPlan: {
            unitAmounts: {
              swordsman: 999999,
              transport_boat: -5,
              unknown_unit: 100,
            },
          },
        },
      ],
    };

    planConfigService.importJsonAsNewPlans(JSON.stringify(bundle));

    const importedPlan = planConfigService.activePlan();

    expect(importedPlan.name).toBe('Partial Regression');
    expect(importedPlan.settings.selectedGod).toBe('aphrodite');
    expect(importedPlan.settings.worldSpeed).toBeNull();
    expect(importedPlan.settings.unitSpeed).toBeNull();
    expect(importedPlan.cityPlan.buildingLevels['farm']).toBe(45);
    expect(importedPlan.cityPlan.buildingLevels['harbour']).toBe(0);
    expect(importedPlan.cityPlan.specialBuildings).toEqual({
      slot1: 'none',
      slot2: 'tower',
    });
    expect(importedPlan.troopPlan.unitAmounts['swordsman']).toBe(5000);
    expect(importedPlan.troopPlan.unitAmounts['transport_boat']).toBe(0);
    expect(importedPlan.troopPlan.unitAmounts['unknown_unit']).toBeUndefined();
  });
});
