import { TestBed } from '@angular/core/testing';

import { PLAN_CONFIG_FORMAT, PLAN_CONFIG_VERSION } from '../models/plan-config.model';
import { PlanFileTransferService } from './plan-file-transfer.service';

interface ExportedPlanBundle {
  readonly format: string;
  readonly version: number;
  readonly plans: readonly {
    readonly isPreset?: boolean;
    readonly cityPlan?: { readonly isPreset?: boolean };
    readonly troopPlan?: { readonly isPreset?: boolean };
  }[];
}

describe('PlanFileTransferService', () => {
  let service: PlanFileTransferService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanFileTransferService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('creates a portable active plan JSON export', () => {
    const exportFile = service.createActivePlanJsonExport();
    const bundle = JSON.parse(exportFile.content) as ExportedPlanBundle;
    const exportedPlan = bundle.plans[0];

    expect(exportFile.fileName).toMatch(/\.grepo-plan\.json$/);
    expect(exportFile.mimeType).toBe('application/json');
    expect(bundle.format).toBe(PLAN_CONFIG_FORMAT);
    expect(bundle.version).toBe(PLAN_CONFIG_VERSION);
    expect(bundle.plans.length).toBe(1);
    expect(exportedPlan.isPreset).toBeUndefined();
    expect(exportedPlan.cityPlan?.isPreset).toBeUndefined();
    expect(exportedPlan.troopPlan?.isPreset).toBeUndefined();
  });


  it('imports a normal-sized JSON plan file', async () => {
    const bundle = {
      format: PLAN_CONFIG_FORMAT,
      version: PLAN_CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      plans: [
        {
          name: 'File Import Reference',
          troopPlan: {
            unitAmounts: {
              swordsman: 5,
            },
          },
        },
      ],
    };
    const file = new File([JSON.stringify(bundle)], 'plan.grepo-plan.json', {
      type: 'application/json',
    });

    const result = await service.importJsonFileAsNewPlans(file);

    expect(result.count).toBe(1);
    expect(result.plans[0]).toEqual({
      name: 'File Import Reference',
      requestedName: 'File Import Reference',
      renamed: false,
    });
  });

  it('rejects oversized import files before reading them', async () => {
    const oversizedFile = new File([new Uint8Array(1024 * 1024 + 1)], 'large-plan.json', {
      type: 'application/json',
    });

    await expect(service.importJsonFileAsNewPlans(oversizedFile)).rejects.toThrow(
      'The selected file is too large. Import files must be 1 MB or smaller.',
    );
  });
});
