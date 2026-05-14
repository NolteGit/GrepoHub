import { Injectable, inject, signal } from '@angular/core';

import { PlanImportResult } from './plan-config.service';
import { PlanFileTransferService } from './plan-file-transfer.service';
import { TranslatableError } from './translatable-error';
import { TranslationService } from './translation.service';

export interface PlanDialogState {
  readonly isError: boolean;
  readonly detailLines: readonly string[];
}

@Injectable()
export class PlanImportExportUiService {
  readonly planImportDialog = signal<PlanDialogState | null>(null);
  readonly exportMenuOpen = signal(false);

  private readonly planFileTransferService = inject(PlanFileTransferService);
  private readonly translationService = inject(TranslationService);

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
      const message = this.translateImportError(error);

      this.showPlanImportErrorDialog(message);
    } finally {
      input.value = '';
    }
  }

  closePlanImportDialog(): void {
    this.planImportDialog.set(null);
  }

  private translateImportError(error: unknown): string {
    if (error instanceof TranslatableError) {
      return this.translationService.translate(error.translationKey, error.message, error.params);
    }

    if (error instanceof Error) {
      return error.message;
    }

    return this.translationService.translate(
      'planConfig.importError.unknown',
      'Could not import plan file.',
    );
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
