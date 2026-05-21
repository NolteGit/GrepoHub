import { Injectable, computed, signal } from '@angular/core';

import { cityConfigurationPresets } from '../data/city-planner-presets';
import { planConfigPresets } from '../data/plan-config-presets';
import { troopConfigurationPresets } from '../data/troops-planner-presets';
import { CityConfiguration } from '../models/city-configuration.model';
import {
  PLAN_CONFIG_FORMAT,
  PLAN_CONFIG_VERSION,
  PlanConfig,
  PlanConfigBundle,
} from '../models/plan-config.model';
import { TroopConfiguration } from '../models/troop-configuration.model';

import {
  assertSupportedPlanConfigBundle,
  getValidatedImportedPlans,
  parsePlanConfigBundleJson,
  planImportFileSizeLimitBytes,
} from './plan-config-import';
import {
  cloneCityPlan,
  clonePlan,
  cloneTroopPlan,
  createDefaultSettings,
  createEmptyUnitAmounts,
  createImportedPlanId,
  createMinimumBuildingLevels,
  createUniqueNameFromNames,
  isPlainRecord,
  normalizeCityConfiguration,
  normalizeCityPlanNote,
  normalizeDisplayPlanName,
  normalizeImportName,
  normalizeNameKey,
  normalizePlanConfig,
  normalizeTroopConfiguration,
} from './plan-config-normalization';

export interface PlanImportResult {
  readonly count: number;
  readonly plans: readonly {
    readonly name: string;
    readonly requestedName: string;
    readonly renamed: boolean;
  }[];
}

type PlanImportResultPlan = PlanImportResult['plans'][number];

@Injectable({
  providedIn: 'root',
})
export class PlanConfigService {
  readonly planImportFileSizeLimitBytes = planImportFileSizeLimitBytes;
  private readonly storageKey = 'grepo-hub-plan-configs';
  private readonly selectedPlanStorageKey = 'grepo-hub-selected-plan-id';
  private readonly legacyCityStorageKey = 'grepo-hub-city-configurations';
  private readonly legacyTroopStorageKey = 'grepo-hub-troop-configurations';
  private readonly autosaveDelayMs = 300;
  private autosaveTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private customPlanIdCounter = 0;
  private readonly planConfigs = signal<PlanConfig[]>(this.loadPlans());
  private readonly selectedPlanId = signal(this.getInitialSelectedPlanId(this.planConfigs()));

  readonly plans = this.planConfigs.asReadonly();
  readonly activePlanId = this.selectedPlanId.asReadonly();
  readonly activePlan = computed(() => {
    return (
      this.planConfigs().find((plan) => plan.id === this.selectedPlanId()) ??
      this.planConfigs()[0] ??
      planConfigPresets[0]
    );
  });
  constructor() {
    const normalizedPlans = this.normalizeExistingPlanNames(this.planConfigs());
    const currentPlans = this.planConfigs();
    const changedPlans =
      normalizedPlans.length !== currentPlans.length ||
      normalizedPlans.some((plan, index) => {
        const currentPlan = currentPlans[index];

        return !currentPlan || plan.id !== currentPlan.id || plan.name !== currentPlan.name;
      });

    if (!changedPlans) {
      return;
    }

    const activePlanId = this.selectedPlanId();

    this.planConfigs.set(normalizedPlans);
    this.selectedPlanId.set(
      normalizedPlans.some((plan) => plan.id === activePlanId)
        ? activePlanId
        : (normalizedPlans[0]?.id ?? ''),
    );
    this.savePlans();
  }
  readonly canDeleteActivePlan = computed(() => this.planConfigs().length > 1);

  selectPlan(planId: string): void {
    if (!this.planConfigs().some((plan) => plan.id === planId)) {
      return;
    }

    this.selectedPlanId.set(planId);
    this.saveSelectedPlanId();
  }

  createNewPlan(name = 'New Plan'): PlanConfig {
    const now = new Date().toISOString();
    const requestedName = normalizeDisplayPlanName(name, 'New Plan');
    const uniqueName = this.createUniquePlanName(requestedName, 'Copy');
    const idSuffix = this.createCustomPlanIdSuffix();
    const newPlan = normalizePlanConfig({
      id: `custom-plan-${idSuffix}`,
      name: uniqueName,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
      settings: createDefaultSettings(),
      cityPlan: {
        id: `custom-city-${idSuffix}`,
        name: uniqueName,
        isPreset: false,
        buildingLevels: createMinimumBuildingLevels(),
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
        id: `custom-troops-${idSuffix}`,
        name: uniqueName,
        isPreset: false,
        unitAmounts: createEmptyUnitAmounts({}),
        modifiers: {
          bunks: false,
        },
      },
    });

    this.planConfigs.update((plans) => [...plans, newPlan]);
    this.selectedPlanId.set(newPlan.id);
    this.savePlans();

    return newPlan;
  }

  savePlans(): void {
    if (this.autosaveTimeoutId !== null) {
      clearTimeout(this.autosaveTimeoutId);
      this.autosaveTimeoutId = null;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(this.createExportBundle()));
    this.saveSelectedPlanId();
  }
  duplicateActivePlan(name: string): PlanConfig {
    const now = new Date().toISOString();
    const currentPlan = this.activePlan();
    const requestedName =
      typeof name === 'string' && name.trim().length > 0 ? name.trim() : currentPlan.name + ' Copy';
    const uniqueName = this.createUniquePlanName(requestedName, 'Copy');
    const idSuffix = this.createCustomPlanIdSuffix();
    const duplicatedPlan: PlanConfig = {
      ...clonePlan(currentPlan),
      id: `custom-plan-${idSuffix}`,
      name: uniqueName,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
      cityPlan: {
        ...cloneCityPlan(currentPlan.cityPlan),
        id: `custom-city-${idSuffix}`,
        name: uniqueName,
        isPreset: false,
      },
      troopPlan: {
        ...cloneTroopPlan(currentPlan.troopPlan),
        id: `custom-troops-${idSuffix}`,
        name: uniqueName,
        isPreset: false,
      },
    };

    this.planConfigs.update((plans) => [...plans, duplicatedPlan]);
    this.selectedPlanId.set(duplicatedPlan.id);
    this.savePlans();

    return duplicatedPlan;
  }

  renameActivePlan(name: string): PlanConfig | null {
    const requestedName = normalizeDisplayPlanName(name, 'Configuration');

    if (!requestedName) {
      return null;
    }

    const currentPlan = this.activePlan();
    const uniqueName = createUniqueNameFromNames(
      requestedName,
      'Copy',
      this.planConfigs()
        .filter((plan) => plan.id !== currentPlan.id)
        .map((plan) => plan.name),
    );
    let renamedPlan: PlanConfig | null = null;

    this.updateActivePlan((plan) => {
      const nextPlan = normalizePlanConfig({
        ...plan,
        name: uniqueName,
        isPreset: false,
        cityPlan: {
          ...plan.cityPlan,
          name: uniqueName,
        },
        troopPlan: {
          ...plan.troopPlan,
          name: uniqueName,
        },
      });

      renamedPlan = nextPlan;

      return nextPlan;
    });

    return renamedPlan;
  }

  updateActiveCityPlanNote(note: string): void {
    this.updateActiveCityPlan({
      note: normalizeCityPlanNote(note),
    });
  }

  deleteActivePlan(): {
    readonly deletedPlanName: string;
    readonly selectedPlanName: string;
  } | null {
    const currentPlan = this.activePlan();

    const currentPlans = this.planConfigs();
    const currentIndex = currentPlans.findIndex((plan) => plan.id === currentPlan.id);
    const remainingPlans = currentPlans.filter((plan) => plan.id !== currentPlan.id);

    if (remainingPlans.length === 0) {
      return null;
    }

    const nextPlan =
      remainingPlans[Math.min(currentIndex, remainingPlans.length - 1)] ??
      remainingPlans[currentIndex - 1] ??
      remainingPlans[0];

    this.planConfigs.set(remainingPlans);
    this.selectedPlanId.set(nextPlan.id);
    this.savePlans();

    return {
      deletedPlanName: currentPlan.name,
      selectedPlanName: nextPlan.name,
    };
  }
  clearActiveCityPlan(): void {
    const currentPlan = this.activePlan();
    const now = new Date().toISOString();
    const clearedPlan = normalizePlanConfig({
      ...currentPlan,
      isPreset: false,
      updatedAt: now,
      cityPlan: {
        ...currentPlan.cityPlan,
        isPreset: false,
        buildingLevels: createMinimumBuildingLevels(),
        modifiers: {
          plowResearched: false,
          aphroditeActive: false,
        },
        specialBuildings: {
          slot1: 'none',
          slot2: 'none',
        },
      },
    });

    this.planConfigs.update((plans) =>
      plans.map((plan) => (plan.id === currentPlan.id ? clearedPlan : plan)),
    );
    this.selectedPlanId.set(clearedPlan.id);
    this.savePlans();
  }
  clearActiveTroopPlan(): void {
    const currentPlan = this.activePlan();
    const now = new Date().toISOString();
    const clearedPlan = normalizePlanConfig({
      ...currentPlan,
      isPreset: false,
      updatedAt: now,
      troopPlan: {
        ...currentPlan.troopPlan,
        isPreset: false,
        unitAmounts: createEmptyUnitAmounts(currentPlan.troopPlan.unitAmounts),
        modifiers: {
          bunks: false,
        },
      },
    });

    this.planConfigs.update((plans) =>
      plans.map((plan) => (plan.id === currentPlan.id ? clearedPlan : plan)),
    );
    this.selectedPlanId.set(clearedPlan.id);
    this.savePlans();
  }
  clearActivePlan(): void {
    this.clearActiveCityPlan();
    this.clearActiveTroopPlan();
  }

  updateActiveCityPlan(partialCityPlan: Partial<CityConfiguration>): void {
    this.updateActivePlan((plan) => ({
      ...plan,
      cityPlan: normalizeCityConfiguration({
        ...plan.cityPlan,
        ...partialCityPlan,
      }),
    }));
  }

  updateActiveTroopPlan(partialTroopPlan: Partial<TroopConfiguration>): void {
    this.updateActivePlan((plan) => ({
      ...plan,
      troopPlan: normalizeTroopConfiguration({
        ...plan.troopPlan,
        ...partialTroopPlan,
      }),
    }));
  }

  resetActiveCityPlan(): void {
    const currentPlan = this.activePlan();
    const presetPlan = planConfigPresets.find((plan) => plan.id === currentPlan.id);
    const presetCityPlan =
      presetPlan?.cityPlan ??
      cityConfigurationPresets.find(
        (configuration) => configuration.id === currentPlan.cityPlan.id,
      );

    if (!presetCityPlan) {
      return;
    }

    this.updateActivePlan((plan) => ({
      ...plan,
      cityPlan: {
        ...cloneCityPlan(presetCityPlan),
        note: plan.cityPlan.note,
      },
    }));
    this.savePlans();
  }

  resetActiveTroopPlan(): void {
    const currentPlan = this.activePlan();
    const presetPlan = planConfigPresets.find((plan) => plan.id === currentPlan.id);
    const presetTroopPlan =
      presetPlan?.troopPlan ??
      troopConfigurationPresets.find(
        (configuration) => configuration.id === currentPlan.troopPlan.id,
      );

    if (!presetTroopPlan) {
      return;
    }

    this.updateActivePlan((plan) => ({
      ...plan,
      troopPlan: cloneTroopPlan(presetTroopPlan),
    }));
    this.savePlans();
  }

  createExportBundle(): PlanConfigBundle {
    return {
      format: PLAN_CONFIG_FORMAT,
      version: PLAN_CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      plans: this.planConfigs().map((plan) => clonePlan(plan)),
    };
  }

  importBundle(rawBundle: Partial<PlanConfigBundle>): void {
    assertSupportedPlanConfigBundle(rawBundle);

    const rawPlans = getValidatedImportedPlans(rawBundle.plans, false);

    if (rawPlans.length === 0) {
      return;
    }

    const plans = rawPlans.map((plan) => normalizePlanConfig(plan));

    this.planConfigs.set(plans);
    this.selectedPlanId.set(plans[0]?.id ?? '');
    this.savePlans();
  }
  importJsonAsNewPlans(json: string): PlanImportResult {
    const parsedBundle = parsePlanConfigBundleJson(json);

    assertSupportedPlanConfigBundle(parsedBundle);

    const rawPlans = getValidatedImportedPlans(parsedBundle.plans, true);

    const importedAt = new Date().toISOString();
    const importedPlanNames: string[] = [];
    const importSummaries: PlanImportResultPlan[] = [];
    const importedPlans = rawPlans.map((rawPlan, index) => {
      const requestedName = normalizeImportName(rawPlan.name, 'Imported Plan ' + (index + 1));
      const importedPlan = this.normalizeImportedPlan(
        rawPlan,
        importedAt,
        index,
        importedPlanNames,
      );

      importedPlanNames.push(importedPlan.name);
      importSummaries.push({
        name: importedPlan.name,
        requestedName,
        renamed: normalizeNameKey(importedPlan.name) !== normalizeNameKey(requestedName),
      });

      return importedPlan;
    });

    this.planConfigs.update((plans) => [...plans, ...importedPlans]);
    this.selectedPlanId.set(importedPlans[0]?.id ?? this.selectedPlanId());
    this.savePlans();

    return {
      count: importedPlans.length,
      plans: importSummaries,
    };
  }
  private normalizeImportedPlan(
    rawPlan: Partial<PlanConfig>,
    importedAt: string,
    index: number,
    importedPlanNames: readonly string[],
  ): PlanConfig {
    const requestedPlanName = normalizeDisplayPlanName(rawPlan.name, 'Imported ' + (index + 1));
    const planName = this.createUniquePlanName(requestedPlanName, 'Import', importedPlanNames);
    const rawCityPlan: Partial<CityConfiguration> = isPlainRecord(rawPlan.cityPlan)
      ? rawPlan.cityPlan
      : {};
    const rawTroopPlan: Partial<TroopConfiguration> = isPlainRecord(rawPlan.troopPlan)
      ? rawPlan.troopPlan
      : {};
    const cityPlanName = normalizeImportName(rawCityPlan.name, planName + ' City');
    const troopPlanName = normalizeImportName(rawTroopPlan.name, planName + ' Troops');
    const importSuffix = Date.now() + '-' + (index + 1);

    const cityPlan = normalizeCityConfiguration({
      ...rawCityPlan,
      id: createImportedPlanId('imported-city', cityPlanName, importSuffix),
      name: cityPlanName,
      isPreset: false,
    });

    const troopPlan = normalizeTroopConfiguration({
      ...rawTroopPlan,
      id: createImportedPlanId('imported-troops', troopPlanName, importSuffix),
      name: troopPlanName,
      isPreset: false,
    });

    return normalizePlanConfig({
      ...rawPlan,
      id: createImportedPlanId('imported-plan', planName, importSuffix),
      name: planName,
      isPreset: false,
      createdAt: rawPlan.createdAt ?? importedAt,
      updatedAt: importedAt,
      cityPlan,
      troopPlan,
    });
  }

  private createCustomPlanIdSuffix(): string {
    this.customPlanIdCounter += 1;

    return `${Date.now()}-${this.customPlanIdCounter}`;
  }

  private normalizeExistingPlanNames(plans: readonly PlanConfig[]): PlanConfig[] {
    const usedNames: string[] = [];

    return plans.map((plan) => {
      const suffix = plan.id.startsWith('imported-plan') ? 'Import' : 'Copy';
      const uniqueName = createUniqueNameFromNames(plan.name, suffix, usedNames);

      usedNames.push(uniqueName);

      if (uniqueName === plan.name) {
        return plan;
      }

      return {
        ...plan,
        name: uniqueName,
        cityPlan: {
          ...plan.cityPlan,
          name: plan.cityPlan.name === plan.name ? uniqueName : plan.cityPlan.name,
        },
        troopPlan: {
          ...plan.troopPlan,
          name: plan.troopPlan.name === plan.name ? uniqueName : plan.troopPlan.name,
        },
      };
    });
  }

  private createUniquePlanName(
    requestedName: string,
    duplicateSuffix: 'Copy' | 'Import',
    additionalExistingNames: readonly string[] = [],
  ): string {
    return createUniqueNameFromNames(requestedName, duplicateSuffix, [
      ...this.planConfigs().map((plan) => plan.name),
      ...additionalExistingNames,
    ]);
  }

  toJson(): string {
    return JSON.stringify(this.createExportBundle(), null, 2);
  }

  fromJson(json: string): void {
    this.importBundle(parsePlanConfigBundleJson(json));
  }

  toCsv(): string {
    return this.toPlanOverviewCsv();
  }

  toPlanOverviewCsv(): string {
    const rows = this.planConfigs().map((plan) => [
      plan.id,
      plan.name,
      plan.cityPlan.name,
      plan.troopPlan.name,
      plan.settings.worldSpeed ?? '',
      plan.settings.unitSpeed ?? '',
      plan.cityPlan.note ?? '',
      plan.updatedAt ?? '',
    ]);

    return this.stringifyCsv([
      [
        'planId',
        'planName',
        'cityPlanName',
        'troopPlanName',
        'worldSpeed',
        'unitSpeed',
        'cityPlanNote',
        'updatedAt',
      ],
      ...rows,
    ]);
  }

  toCityBuildingsCsv(): string {
    const rows = this.planConfigs().flatMap((plan) =>
      Object.entries(plan.cityPlan.buildingLevels).map(([buildingId, level]) => [
        plan.id,
        plan.name,
        plan.cityPlan.id,
        plan.cityPlan.name,
        buildingId,
        level,
      ]),
    );

    return this.stringifyCsv([
      ['planId', 'planName', 'cityPlanId', 'cityPlanName', 'buildingId', 'level'],
      ...rows,
    ]);
  }

  toTroopAmountsCsv(): string {
    const rows = this.planConfigs().flatMap((plan) =>
      Object.entries(plan.troopPlan.unitAmounts).map(([unitId, amount]) => [
        plan.id,
        plan.name,
        plan.troopPlan.id,
        plan.troopPlan.name,
        unitId,
        amount,
      ]),
    );

    return this.stringifyCsv([
      ['planId', 'planName', 'troopPlanId', 'troopPlanName', 'unitId', 'amount'],
      ...rows,
    ]);
  }

  toBbCode(): string {
    return this.planConfigs()
      .map((plan) => {
        const units = Object.entries(plan.troopPlan.unitAmounts)
          .filter(([, amount]) => amount > 0)
          .map(([unitId, amount]) => `[*]${unitId}[|]${amount}`)
          .join('\n');

        return [
          `[b]${plan.name}[/b]`,
          '',
          `[u]City plan[/u]: ${plan.cityPlan.name}`,
          `[u]Troop plan[/u]: ${plan.troopPlan.name}`,
          '',
          '[table]',
          '[**]Unit[||]Amount[/**]',
          units,
          '[/table]',
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n\n');
  }
  private updateActivePlan(updater: (plan: PlanConfig) => PlanConfig): void {
    const currentPlan = this.activePlan();
    const updatedAt = new Date().toISOString();

    this.planConfigs.update((plans) =>
      plans.map((plan) =>
        plan.id === currentPlan.id
          ? {
              ...updater(plan),
              updatedAt,
            }
          : plan,
      ),
    );
    this.scheduleSavePlans();
  }

  private scheduleSavePlans(): void {
    if (this.autosaveTimeoutId !== null) {
      clearTimeout(this.autosaveTimeoutId);
    }

    this.autosaveTimeoutId = setTimeout(() => {
      this.autosaveTimeoutId = null;
      this.savePlans();
    }, this.autosaveDelayMs);
  }

  private getInitialSelectedPlanId(plans: readonly PlanConfig[]): string {
    const storedPlanId = localStorage.getItem(this.selectedPlanStorageKey);

    if (storedPlanId && plans.some((plan) => plan.id === storedPlanId)) {
      return storedPlanId;
    }

    return plans[0]?.id ?? '';
  }

  private saveSelectedPlanId(): void {
    const planId = this.selectedPlanId();

    if (planId) {
      localStorage.setItem(this.selectedPlanStorageKey, planId);
      return;
    }

    localStorage.removeItem(this.selectedPlanStorageKey);
  }

  private loadPlans(): PlanConfig[] {
    const storedPlans = localStorage.getItem(this.storageKey);

    if (storedPlans) {
      try {
        const parsedPlans = JSON.parse(storedPlans) as
          | Partial<PlanConfigBundle>
          | Partial<PlanConfig>[];
        const rawPlans = Array.isArray(parsedPlans) ? parsedPlans : parsedPlans.plans;

        if (Array.isArray(rawPlans) && rawPlans.length > 0) {
          const validPlans = rawPlans.filter((plan): plan is Partial<PlanConfig> =>
            isPlainRecord(plan),
          );

          if (validPlans.length > 0) {
            return validPlans.map((plan) => normalizePlanConfig(plan));
          }
        }
      } catch {
        return this.loadLegacyOrPresetPlans();
      }
    }

    return this.loadLegacyOrPresetPlans();
  }

  private loadLegacyOrPresetPlans(): PlanConfig[] {
    const legacyCityConfigurations = this.loadLegacyCityConfigurations();
    const legacyTroopConfigurations = this.loadLegacyTroopConfigurations();
    const maxLength = Math.max(legacyCityConfigurations.length, legacyTroopConfigurations.length);

    if (maxLength === 0) {
      return planConfigPresets.map((plan) => clonePlan(plan));
    }

    return Array.from({ length: maxLength }, (_, index) => {
      const cityPlan = legacyCityConfigurations[index] ?? cityConfigurationPresets[0];
      const troopPlan = legacyTroopConfigurations[index] ?? troopConfigurationPresets[0];
      const name =
        cityPlan.name === troopPlan.name ? cityPlan.name : `${cityPlan.name} / ${troopPlan.name}`;

      return normalizePlanConfig({
        id: `migrated-plan-${index + 1}`,
        name,
        isPreset: cityPlan.isPreset && troopPlan.isPreset,
        createdAt: null,
        updatedAt: null,
        settings: createDefaultSettings(),
        cityPlan,
        troopPlan,
      });
    });
  }

  private loadLegacyCityConfigurations(): CityConfiguration[] {
    const storedConfigurations = localStorage.getItem(this.legacyCityStorageKey);

    if (!storedConfigurations) {
      return [];
    }

    try {
      const parsedConfigurations = JSON.parse(storedConfigurations) as unknown;

      return Array.isArray(parsedConfigurations)
        ? parsedConfigurations
            .filter((configuration): configuration is Partial<CityConfiguration> =>
              isPlainRecord(configuration),
            )
            .map((configuration) => normalizeCityConfiguration(configuration))
        : [];
    } catch {
      return [];
    }
  }

  private loadLegacyTroopConfigurations(): TroopConfiguration[] {
    const storedConfigurations = localStorage.getItem(this.legacyTroopStorageKey);

    if (!storedConfigurations) {
      return [];
    }

    try {
      const parsedConfigurations = JSON.parse(storedConfigurations) as unknown;

      return Array.isArray(parsedConfigurations)
        ? parsedConfigurations
            .filter((configuration): configuration is Partial<TroopConfiguration> =>
              isPlainRecord(configuration),
            )
            .map((configuration) => normalizeTroopConfiguration(configuration))
        : [];
    } catch {
      return [];
    }
  }

  private stringifyCsv(rows: (string | number)[][]): string {
    return rows
      .map((row) => row.map((cell) => this.stringifyCsvCell(String(cell))).join(','))
      .join('\n');
  }

  private stringifyCsvCell(value: string): string {
    if (!/[",\n]/.test(value)) {
      return value;
    }

    return `"${value.replaceAll('"', '""')}"`;
  }
}
