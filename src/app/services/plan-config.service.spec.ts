import { TestBed } from '@angular/core/testing';

import { PLAN_CONFIG_FORMAT, PLAN_CONFIG_VERSION } from '../models/plan-config.model';
import { PlanConfigService } from './plan-config.service';

describe('PlanConfigService import validation', () => {
  let service: PlanConfigService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanConfigService);
  });

  afterEach(() => {
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
