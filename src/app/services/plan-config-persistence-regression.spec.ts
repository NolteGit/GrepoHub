import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { PLAN_CONFIG_FORMAT, PLAN_CONFIG_VERSION } from '../models/plan-config.model';
import { PlanConfigService } from './plan-config.service';

const planStorageKey = 'grepo-hub-plan-configs';
const selectedPlanStorageKey = 'grepo-hub-selected-plan-id';

const createService = (): PlanConfigService => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});

  return TestBed.inject(PlanConfigService);
};

describe('PlanConfigService persistence regression flows', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('reloads the saved custom plan and selected plan id from localStorage', () => {
    const service = createService();
    const customPlan = service.createNewPlan('Persistence Regression');

    service.updateActiveTroopPlan({
      unitAmounts: {
        ...customPlan.troopPlan.unitAmounts,
        swordsman: 42,
      },
    });
    service.savePlans();

    const reloadedService = createService();

    expect(reloadedService.activePlan().id).toBe(customPlan.id);
    expect(reloadedService.activePlan().name).toBe('Persistence Regression');
    expect(reloadedService.activePlan().troopPlan.unitAmounts['swordsman']).toBe(42);
  });

  it('falls back to the default preset when the selected plan id is stale', () => {
    const service = createService();

    service.createNewPlan('Selected Fallback Regression');
    service.savePlans();
    localStorage.setItem(selectedPlanStorageKey, 'missing-plan-id');

    const reloadedService = createService();

    expect(reloadedService.activePlan().id).toBe('preset-empty');
    expect(reloadedService.activePlanId()).toBe('preset-empty');
  });

  it('normalizes unsafe stored plan values during startup', () => {
    localStorage.setItem(
      planStorageKey,
      JSON.stringify({
        format: PLAN_CONFIG_FORMAT,
        version: PLAN_CONFIG_VERSION,
        exportedAt: new Date().toISOString(),
        plans: [
          {
            id: 'stored-regression-plan',
            name: 'Stored Regression Plan',
            settings: {
              selectedGod: 'unknown-god',
              worldSpeed: '  3  ',
              unitSpeed: '  2  ',
              timezone: '  Europe/Berlin  ',
              locale: '  de  ',
            },
            cityPlan: {
              id: 'stored-regression-city',
              name: 'Stored Regression City',
              buildingLevels: {
                farm: 100,
                harbour: -5,
              },
              modifiers: {
                aphroditeActive: true,
              },
              specialBuildings: {
                slot1: 'invalid-building',
                slot2: 'tower',
              },
            },
            troopPlan: {
              id: 'stored-regression-troops',
              name: 'Stored Regression Troops',
              unitAmounts: {
                swordsman: 9999,
                colony_ship: 9999,
              },
              modifiers: {},
            },
          },
        ],
      }),
    );
    localStorage.setItem(selectedPlanStorageKey, 'stored-regression-plan');

    const service = createService();
    const plan = service.activePlan();

    expect(plan.id).toBe('stored-regression-plan');
    expect(plan.settings).toEqual({
      selectedGod: 'aphrodite',
      worldSpeed: 3,
      unitSpeed: 2,
      timezone: 'Europe/Berlin',
      locale: 'de',
    });
    expect(plan.cityPlan.buildingLevels['farm']).toBe(45);
    expect(plan.cityPlan.buildingLevels['harbour']).toBe(0);
    expect(plan.cityPlan.modifiers).toEqual({
      plowResearched: false,
      aphroditeActive: true,
    });
    expect(plan.cityPlan.specialBuildings).toEqual({
      slot1: 'none',
      slot2: 'tower',
    });
    expect(plan.troopPlan.unitAmounts['swordsman']).toBe(5000);
    expect(plan.troopPlan.unitAmounts['colony_ship']).toBe(30);
    expect(plan.troopPlan.modifiers.bunks).toBe(false);
  });
});
