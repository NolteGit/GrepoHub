import { Injectable, inject } from '@angular/core';

import { PLAN_CONFIG_FORMAT, PLAN_CONFIG_VERSION } from '../models/plan-config.model';
import { PlanConfigService, PlanImportResult } from './plan-config.service';
import { isPlainRecord } from './plan-config-normalization';

interface PlanFileExport {
  readonly fileName: string;
  readonly content: string;
  readonly mimeType: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlanFileTransferService {
  private readonly planConfigService = inject(PlanConfigService);

  createActivePlanJsonExport(): PlanFileExport {
    const exportedAt = new Date().toISOString();
    const exportIdSuffix = exportedAt.replace(/\D/g, '').slice(0, 14);
    const activePlan = this.preparePlanForExport(
      structuredClone(this.planConfigService.activePlan()) as Record<string, unknown>,
      exportedAt,
      exportIdSuffix,
    );
    const exportBundle = {
      format: PLAN_CONFIG_FORMAT,
      version: PLAN_CONFIG_VERSION,
      exportedAt,
      plans: [activePlan],
    };
    const planName = typeof activePlan['name'] === 'string' ? activePlan['name'] : 'grepo-plan';

    return {
      fileName: this.sanitizeFileName(planName) + '.grepo-plan.json',
      content: JSON.stringify(exportBundle, null, 2),
      mimeType: 'application/json',
    };
  }

  exportActivePlanAsJson(): void {
    const exportFile = this.createActivePlanJsonExport();

    this.downloadTextFile(exportFile.fileName, exportFile.content, exportFile.mimeType);
  }

  importJsonFileAsNewPlans(file: File): Promise<PlanImportResult> {
    if (file.size > this.planConfigService.planImportFileSizeLimitBytes) {
      return Promise.reject(
        new Error('The selected file is too large. Import files must be 1 MB or smaller.'),
      );
    }

    return this.readTextFile(file).then((content) =>
      this.planConfigService.importJsonAsNewPlans(content),
    );
  }

  private readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(typeof reader.result === 'string' ? reader.result : '');
      };

      reader.onerror = () => {
        reject(new Error('Could not read plan file.'));
      };

      reader.readAsText(file);
    });
  }

  private preparePlanForExport(
    plan: Record<string, unknown>,
    exportedAt: string,
    exportIdSuffix: string,
  ): Record<string, unknown> {
    const portablePlan = this.removeNullishValues(plan) as Record<string, unknown>;
    const planName = typeof portablePlan['name'] === 'string' ? portablePlan['name'] : 'Grepo Plan';

    delete portablePlan['isPreset'];
    portablePlan['id'] = this.createPortableExportId('plan', planName, exportIdSuffix);
    portablePlan['createdAt'] =
      typeof portablePlan['createdAt'] === 'string' ? portablePlan['createdAt'] : exportedAt;
    portablePlan['updatedAt'] = exportedAt;
    portablePlan['settings'] = this.removeNullishValues(
      isPlainRecord(portablePlan['settings']) ? portablePlan['settings'] : {},
    );

    const cityPlan = portablePlan['cityPlan'];

    if (isPlainRecord(cityPlan)) {
      const portableCityPlan = this.removeNullishValues(cityPlan) as Record<string, unknown>;
      const cityPlanName =
        typeof portableCityPlan['name'] === 'string'
          ? portableCityPlan['name']
          : planName + ' City';

      delete portableCityPlan['isPreset'];
      portableCityPlan['id'] = this.createPortableExportId('city', cityPlanName, exportIdSuffix);
      portablePlan['cityPlan'] = portableCityPlan;
    }

    const troopPlan = portablePlan['troopPlan'];

    if (isPlainRecord(troopPlan)) {
      const portableTroopPlan = this.removeNullishValues(troopPlan) as Record<string, unknown>;
      const troopPlanName =
        typeof portableTroopPlan['name'] === 'string'
          ? portableTroopPlan['name']
          : planName + ' Troops';

      delete portableTroopPlan['isPreset'];
      portableTroopPlan['id'] = this.createPortableExportId(
        'troops',
        troopPlanName,
        exportIdSuffix,
      );
      portablePlan['troopPlan'] = portableTroopPlan;
    }

    return portablePlan;
  }

  private createPortableExportId(prefix: string, name: string, exportIdSuffix: string): string {
    return prefix + '-' + this.sanitizeFileName(name) + '-' + exportIdSuffix;
  }

  private removeNullishValues(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.removeNullishValues(item));
    }

    if (!isPlainRecord(value)) {
      return value;
    }

    return Object.entries(value).reduce<Record<string, unknown>>((cleanedValue, [key, item]) => {
      if (item !== null && item !== undefined) {
        cleanedValue[key] = this.removeNullishValues(item);
      }

      return cleanedValue;
    }, {});
  }

  private downloadTextFile(fileName: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private sanitizeFileName(value: string): string {
    const sanitizedValue = value
      .trim()
      .replace(/[^a-z0-9._-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return sanitizedValue || 'grepo-plan';
  }
}
