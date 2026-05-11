import { Injectable, inject, signal } from '@angular/core';

import { PlanImportResult } from './plan-config.service';
import { PlanFileTransferService } from './plan-file-transfer.service';

export interface PlanDialogState {
  readonly isError: boolean;
  readonly detailLines: readonly string[];
}

@Injectable()
export class PlanImportExportUiService {
  readonly planImportDialog = signal<PlanDialogState | null>(null);
  readonly exportMenuOpen = signal(false);

  private readonly planFileTransferService = inject(PlanFileTransferService);

  toggleExportMenu(onOpen?: () => void): void {
    const shouldOpen = !this.exportMenuOpen();

    this.exportMenuOpen.set(shouldOpen);

    if (shouldOpen) {
      onOpen?.();
    }
  }

  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  exportActivePlanAsJson(): void {
    this.planFileTransferService.exportActivePlanAsJson();
  }

  async importPlanFromJsonFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const result = await this.planFileTransferService.importJsonFileAsNewPlans(file);

      this.showPlanImportSuccessDialog(result.plans);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not import plan file.';

      this.showPlanImportErrorDialog(message);
    } finally {
      input.value = '';
    }
  }

  closePlanImportDialog(): void {
    this.planImportDialog.set(null);
  }

  private showPlanImportSuccessDialog(importedPlans: PlanImportResult['plans']): void {
    const detailLines = importedPlans.map((plan) =>
      plan.renamed ? plan.requestedName + ' → ' + plan.name : plan.name,
    );

    this.planImportDialog.set({
      isError: false,
      detailLines,
    });
  }

  private showPlanImportErrorDialog(message: string): void {
    this.planImportDialog.set({
      isError: true,
      detailLines: [message],
    });
  }
}
