import { TestBed } from '@angular/core/testing';

import { PlanFileTransferService } from './plan-file-transfer.service';
import { PlanImportExportUiService } from './plan-import-export-ui.service';

class PlanFileTransferServiceStub {
  readonly importJsonFileAsNewPlans = vi.fn();
  readonly exportActivePlanAsJson = vi.fn();
}

describe('PlanImportExportUiService', () => {
  let service: PlanImportExportUiService;
  let fileTransferService: PlanFileTransferServiceStub;

  beforeEach(() => {
    fileTransferService = new PlanFileTransferServiceStub();

    TestBed.configureTestingModule({
      providers: [
        PlanImportExportUiService,
        { provide: PlanFileTransferService, useValue: fileTransferService },
      ],
    });

    service = TestBed.inject(PlanImportExportUiService);
  });

  it('toggles the export menu and runs the open callback only when opening', () => {
    const onOpen = vi.fn();

    service.toggleExportMenu(onOpen);

    expect(service.exportMenuOpen()).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);

    service.toggleExportMenu(onOpen);

    expect(service.exportMenuOpen()).toBe(false);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });


  it('delegates JSON export to the file transfer service', () => {
    service.exportActivePlanAsJson();

    expect(fileTransferService.exportActivePlanAsJson).toHaveBeenCalledTimes(1);
  });

  it('shows imported plan names after a successful import', async () => {
    const file = new File(['{}'], 'plans.json', { type: 'application/json' });
    const input = document.createElement('input');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fileTransferService.importJsonFileAsNewPlans.mockResolvedValue({
      importedCount: 2,
      plans: [
        { name: 'City Plan', requestedName: 'City Plan', renamed: false },
        { name: 'Troop Plan 2', requestedName: 'Troop Plan', renamed: true },
      ],
    });

    await service.importPlanFromJsonFile({ target: input } as unknown as Event);

    expect(fileTransferService.importJsonFileAsNewPlans).toHaveBeenCalledWith(file);
    expect(service.planImportDialog()).toEqual({
      isError: false,
      detailLines: ['City Plan', 'Troop Plan → Troop Plan 2'],
    });
  });

  it('shows an error dialog after a failed import', async () => {
    const file = new File(['{}'], 'plans.json', { type: 'application/json' });
    const input = document.createElement('input');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fileTransferService.importJsonFileAsNewPlans.mockRejectedValue(new Error('Invalid JSON'));

    await service.importPlanFromJsonFile({ target: input } as unknown as Event);

    expect(service.planImportDialog()).toEqual({
      isError: true,
      detailLines: ['Invalid JSON'],
    });
  });
});
