import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { PLAN_CONFIG_FORMAT, PLAN_CONFIG_VERSION } from '../models/plan-config.model';
import { PlanConfigService } from './plan-config.service';

describe('PlanConfigService import validation', () => {
  let service: PlanConfigService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanConfigService);
  });

  afterEach(() => {
    service.savePlans();
    vi.clearAllTimers();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('rejects invalid JSON imports', () => {
    expect(() => service.importJsonAsNewPlans('{invalid')).toThrow(
      'The selected file is not valid JSON.',
    );
  });

  it('rejects invalid plan entries', () => {
    const bundle = {
      format: PLAN_CONFIG_FORMAT,
      version: PLAN_CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      plans: [null],
    };

    expect(() => service.importJsonAsNewPlans(JSON.stringify(bundle))).toThrow(
      'The selected file contains invalid plan entries.',
    );
  });

  it('imports multiple plans with duplicate-safe names and selects the first imported plan', () => {
    const initialPlanCount = service.plans().length;
    const bundle = {
      format: PLAN_CONFIG_FORMAT,
      version: PLAN_CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      plans: [
        {
          name: 'Empty',
          cityPlan: {
            name: 'Imported City A',
            buildingLevels: {
              farm: 100,
            },
            specialBuildings: {
              slot1: 'library',
              slot2: 'tower',
            },
          },
          troopPlan: {
            name: 'Imported Troops A',
            unitAmounts: {
              swordsman: 1,
            },
          },
        },
        {
          name: 'empty',
          troopPlan: {
            unitAmounts: {
              swordsman: 2,
            },
          },
        },
      ],
    };

    const result = service.importJsonAsNewPlans(JSON.stringify(bundle));
    const importedPlans = service.plans().slice(initialPlanCount);

    expect(result).toEqual({
      count: 2,
      plans: [
        { name: 'Empty Import', requestedName: 'Empty', renamed: true },
        { name: 'empty Import 2', requestedName: 'empty', renamed: true },
      ],
    });
    expect(service.plans().length).toBe(initialPlanCount + 2);
    expect(importedPlans.map((plan) => plan.name)).toEqual(['Empty Import', 'empty Import 2']);
    expect(service.activePlan().id).toBe(importedPlans[0].id);
    expect(importedPlans[0].isPreset).toBe(false);
    expect(importedPlans[0].cityPlan.buildingLevels['farm']).toBe(45);
    expect(importedPlans[0].cityPlan.specialBuildings).toEqual({
      slot1: 'library',
      slot2: 'tower',
    });
    expect(importedPlans[1].troopPlan.unitAmounts['swordsman']).toBe(2);
  });

  it('clears a custom plan back to minimum city levels and zero troop amounts', () => {
    service.selectPlan('preset-hybrid-plan');
    const customPlan = service.duplicateActivePlan('Hybrid Custom');

    service.updateActiveTroopPlan({
      unitAmounts: {
        swordsman: 20,
        transport_boat: 3,
      },
      modifiers: {
        bunks: true,
      },
    });

    service.clearActivePlan();

    const clearedPlan = service.activePlan();

    expect(clearedPlan.id).toBe(customPlan.id);
    expect(clearedPlan.isPreset).toBe(false);
    expect(clearedPlan.cityPlan.buildingLevels['senate']).toBe(9);
    expect(clearedPlan.cityPlan.buildingLevels['farm']).toBe(1);
    expect(clearedPlan.cityPlan.buildingLevels['harbour']).toBe(0);
    expect(clearedPlan.cityPlan.buildingLevels['land_expansion']).toBe(0);
    expect(clearedPlan.cityPlan.modifiers).toEqual({
      plowResearched: false,
      aphroditeActive: false,
    });
    expect(clearedPlan.cityPlan.specialBuildings).toEqual({
      slot1: 'none',
      slot2: 'none',
    });
    expect(Object.values(clearedPlan.troopPlan.unitAmounts).every((amount) => amount === 0)).toBe(
      true,
    );
    expect(clearedPlan.troopPlan.unitAmounts['transport_boat']).toBe(0);
    expect(clearedPlan.troopPlan.modifiers.bunks).toBe(false);
  });

  it('autosaves active plan updates after a short delay', () => {
    vi.useFakeTimers();
    service.selectPlan('preset-hybrid-plan');
    const customPlan = service.duplicateActivePlan('Autosave Test');

    service.updateActiveCityPlan({
      buildingLevels: {
        ...customPlan.cityPlan.buildingLevels,
        farm: 20,
      },
    });

    const storedBeforeAutosave = JSON.parse(localStorage.getItem('grepo-hub-plan-configs') ?? '{}');
    const planBeforeAutosave = storedBeforeAutosave.plans.find(
      (plan: { readonly id: string }) => plan.id === customPlan.id,
    );

    expect(planBeforeAutosave.cityPlan.buildingLevels.farm).toBe(
      customPlan.cityPlan.buildingLevels['farm'],
    );

    vi.advanceTimersByTime(300);

    const storedAfterAutosave = JSON.parse(localStorage.getItem('grepo-hub-plan-configs') ?? '{}');
    const planAfterAutosave = storedAfterAutosave.plans.find(
      (plan: { readonly id: string }) => plan.id === customPlan.id,
    );

    expect(planAfterAutosave.cityPlan.buildingLevels.farm).toBe(20);
  });

  it('deletes preset and custom plans and selects the next available plan', () => {
    expect(service.activePlan().id).toBe('preset-empty');

    const deletedPreset = service.deleteActivePlan();

    expect(deletedPreset).toEqual({
      deletedPlanName: 'Empty',
      selectedPlanName: 'Hybrid',
    });
    expect(service.activePlan().id).toBe('preset-hybrid-plan');
    expect(service.plans().some((plan) => plan.id === 'preset-empty')).toBe(false);

    const firstCustomPlan = service.duplicateActivePlan('Temporary One');
    const secondCustomPlan = service.duplicateActivePlan('Temporary Two');

    expect(service.activePlan().id).toBe(secondCustomPlan.id);

    const deletedCustom = service.deleteActivePlan();

    expect(deletedCustom).toEqual({
      deletedPlanName: 'Temporary Two',
      selectedPlanName: firstCustomPlan.name,
    });
    expect(service.activePlan().id).toBe(firstCustomPlan.id);
    expect(service.plans().some((plan) => plan.id === secondCustomPlan.id)).toBe(false);
  });

  it('keeps deleted preset plans removed after the service reloads', () => {
    expect(service.activePlan().id).toBe('preset-empty');

    service.deleteActivePlan();

    expect(service.plans().some((plan) => plan.id === 'preset-empty')).toBe(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanConfigService);

    expect(service.plans().some((plan) => plan.id === 'preset-empty')).toBe(false);
    expect(service.activePlan().id).toBe('preset-hybrid-plan');
  });

  it('keeps the final remaining plan so the planner always has an active configuration', () => {
    while (service.plans().length > 1) {
      expect(service.canDeleteActivePlan()).toBe(true);
      expect(service.deleteActivePlan()).not.toBeNull();
    }

    const finalPlan = service.activePlan();

    expect(service.canDeleteActivePlan()).toBe(false);
    expect(service.deleteActivePlan()).toBeNull();
    expect(service.plans()).toEqual([finalPlan]);
  });

  it('exports CSV and BBCode from the normalized active plan state', () => {
    service.selectPlan('preset-hybrid-plan');
    service.duplicateActivePlan('CSV, BBCode "Plan"');
    service.updateActiveTroopPlan({
      unitAmounts: {
        swordsman: 12,
        archer: 3,
      },
    });

    const planOverviewCsv = service.toPlanOverviewCsv();
    const troopAmountsCsv = service.toTroopAmountsCsv();
    const bbCode = service.toBbCode();

    expect(planOverviewCsv.split('\n')[0]).toBe(
      'planId,planName,cityPlanName,troopPlanName,worldSpeed,unitSpeed,updatedAt',
    );
    expect(planOverviewCsv).toContain('"CSV, BBCode ""Plan"""');
    expect(troopAmountsCsv).toContain('swordsman,12');
    expect(troopAmountsCsv).toContain('archer,3');
    expect(bbCode).toContain('[b]CSV, BBCode "Plan"[/b]');
    expect(bbCode).toContain('[*]swordsman[|]12');
    expect(bbCode).toContain('[*]archer[|]3');
  });

  it('strips unknown units and clamps imported troop amounts', () => {
    const bundle = {
      format: PLAN_CONFIG_FORMAT,
      version: PLAN_CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      plans: [
        {
          name: 'Imported Test Plan',
          troopPlan: {
            name: 'Imported Test Troops',
            unitAmounts: {
              swordsman: 10001.6,
              archer: -4,
              unknown_unit: 25,
            },
          },
        },
      ],
    };

    service.importJsonAsNewPlans(JSON.stringify(bundle));

    const importedPlan = service.activePlan();

    expect(importedPlan.troopPlan.unitAmounts['swordsman']).toBe(10000);
    expect(importedPlan.troopPlan.unitAmounts['archer']).toBe(0);
    expect(importedPlan.troopPlan.unitAmounts['unknown_unit']).toBeUndefined();
  });
});
