import { Injectable, computed, signal } from '@angular/core';

import {
  cityBuildingPlanDefinitions,
  cityConfigurationPresets,
  citySpecialBuildingSlotDefinitions,
} from '../data/city-planner-presets';
import { planConfigPresets } from '../data/plan-config-presets';
import { troopConfigurationPresets } from '../data/troops-planner-presets';
import {
  CityConfiguration,
  CitySpecialBuildingOptionId,
  CitySpecialBuildingSlotId,
} from '../models/city-configuration.model';
import {
  PLAN_CONFIG_FORMAT,
  PLAN_CONFIG_VERSION,
  PlanConfig,
  PlanConfigBundle,
  PlanConfigSettings,
} from '../models/plan-config.model';
import { TroopConfiguration } from '../models/troop-configuration.model';

@Injectable({
  providedIn: 'root',
})
export class PlanConfigService {
  private readonly storageKey = 'grepo-hub-plan-configs';
  private readonly legacyCityStorageKey = 'grepo-hub-city-configurations';
  private readonly legacyTroopStorageKey = 'grepo-hub-troop-configurations';
  private readonly planConfigs = signal<PlanConfig[]>(this.loadPlans());
  private readonly selectedPlanId = signal(this.planConfigs()[0]?.id ?? '');

  readonly plans = this.planConfigs.asReadonly();
  readonly activePlanId = this.selectedPlanId.asReadonly();
  readonly activePlan = computed(() => {
    return (
      this.planConfigs().find((plan) => plan.id === this.selectedPlanId()) ??
      this.planConfigs()[0] ??
      planConfigPresets[0]
    );
  });

  selectPlan(planId: string): void {
    if (!this.planConfigs().some((plan) => plan.id === planId)) {
      return;
    }

    this.selectedPlanId.set(planId);
  }

  savePlans(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.createExportBundle()));
  }

  duplicateActivePlan(name: string): PlanConfig {
    const now = new Date().toISOString();
    const currentPlan = this.activePlan();
    const duplicatedPlan: PlanConfig = {
      ...this.clonePlan(currentPlan),
      id: `custom-plan-${Date.now()}`,
      name,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
      cityPlan: {
        ...this.cloneCityPlan(currentPlan.cityPlan),
        id: `custom-city-${Date.now()}`,
        name,
        isPreset: false,
      },
      troopPlan: {
        ...this.cloneTroopPlan(currentPlan.troopPlan),
        id: `custom-troops-${Date.now()}`,
        name,
        isPreset: false,
      },
    };

    this.planConfigs.update((plans) => [...plans, duplicatedPlan]);
    this.selectedPlanId.set(duplicatedPlan.id);
    this.savePlans();

    return duplicatedPlan;
  }

  updateActiveCityPlan(partialCityPlan: Partial<CityConfiguration>): void {
    this.updateActivePlan((plan) => ({
      ...plan,
      cityPlan: this.normalizeCityConfiguration({
        ...plan.cityPlan,
        ...partialCityPlan,
      }),
    }));
  }

  updateActiveTroopPlan(partialTroopPlan: Partial<TroopConfiguration>): void {
    this.updateActivePlan((plan) => ({
      ...plan,
      troopPlan: this.normalizeTroopConfiguration({
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
      cityPlan: this.cloneCityPlan(presetCityPlan),
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
      troopPlan: this.cloneTroopPlan(presetTroopPlan),
    }));
    this.savePlans();
  }

  createExportBundle(): PlanConfigBundle {
    return {
      format: PLAN_CONFIG_FORMAT,
      version: PLAN_CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      plans: this.planConfigs().map((plan) => this.clonePlan(plan)),
    };
  }

  importBundle(rawBundle: Partial<PlanConfigBundle>): void {
    const rawPlans = rawBundle.plans ?? [];

    if (!Array.isArray(rawPlans) || rawPlans.length === 0) {
      return;
    }

    const plans = rawPlans.map((plan) => this.normalizePlanConfig(plan));

    this.planConfigs.set(plans);
    this.selectedPlanId.set(plans[0]?.id ?? '');
    this.savePlans();
  }

  toJson(): string {
    return JSON.stringify(this.createExportBundle(), null, 2);
  }

  fromJson(json: string): void {
    const parsed = JSON.parse(json) as Partial<PlanConfigBundle>;

    this.importBundle(parsed);
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
          return rawPlans.map((plan) => this.normalizePlanConfig(plan));
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
      return planConfigPresets.map((plan) => this.clonePlan(plan));
    }

    return Array.from({ length: maxLength }, (_, index) => {
      const cityPlan = legacyCityConfigurations[index] ?? cityConfigurationPresets[0];
      const troopPlan = legacyTroopConfigurations[index] ?? troopConfigurationPresets[0];
      const name =
        cityPlan.name === troopPlan.name ? cityPlan.name : `${cityPlan.name} / ${troopPlan.name}`;

      return this.normalizePlanConfig({
        id: `migrated-plan-${index + 1}`,
        name,
        isPreset: cityPlan.isPreset && troopPlan.isPreset,
        createdAt: null,
        updatedAt: null,
        settings: this.createDefaultSettings(),
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
      const parsedConfigurations = JSON.parse(storedConfigurations) as Partial<CityConfiguration>[];

      return Array.isArray(parsedConfigurations)
        ? parsedConfigurations.map((configuration) =>
            this.normalizeCityConfiguration(configuration),
          )
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
      const parsedConfigurations = JSON.parse(
        storedConfigurations,
      ) as Partial<TroopConfiguration>[];

      return Array.isArray(parsedConfigurations)
        ? parsedConfigurations.map((configuration) =>
            this.normalizeTroopConfiguration(configuration),
          )
        : [];
    } catch {
      return [];
    }
  }

  private normalizePlanConfig(rawPlan: Partial<PlanConfig>): PlanConfig {
    return {
      id: rawPlan.id ?? `custom-plan-${Date.now()}`,
      name: rawPlan.name ?? 'Plan',
      isPreset: Boolean(rawPlan.isPreset),
      createdAt: this.normalizeOptionalString(rawPlan.createdAt),
      updatedAt: this.normalizeOptionalString(rawPlan.updatedAt),
      settings: this.normalizeSettings(rawPlan.settings),
      cityPlan: this.normalizeCityConfiguration(rawPlan.cityPlan ?? cityConfigurationPresets[0]),
      troopPlan: this.normalizeTroopConfiguration(
        rawPlan.troopPlan ?? troopConfigurationPresets[0],
      ),
    };
  }

  private normalizeSettings(
    rawSettings: Partial<PlanConfigSettings> | undefined,
  ): PlanConfigSettings {
    const parsedWorldSpeed = Number(rawSettings?.worldSpeed);
    const parsedUnitSpeed = Number(rawSettings?.unitSpeed);

    return {
      worldSpeed:
        Number.isFinite(parsedWorldSpeed) && parsedWorldSpeed > 0 ? parsedWorldSpeed : null,
      unitSpeed: Number.isFinite(parsedUnitSpeed) && parsedUnitSpeed > 0 ? parsedUnitSpeed : null,
      timezone: this.normalizeOptionalString(rawSettings?.timezone),
      locale: this.normalizeOptionalString(rawSettings?.locale),
    };
  }

  private createDefaultSettings(): PlanConfigSettings {
    return {
      worldSpeed: null,
      unitSpeed: null,
      timezone: null,
      locale: null,
    };
  }

  private normalizeCityConfiguration(
    rawConfiguration: Partial<CityConfiguration>,
  ): CityConfiguration {
    const rawBuildingLevels = rawConfiguration.buildingLevels ?? {};
    const rawModifiers = rawConfiguration.modifiers as Partial<Record<string, boolean>> | undefined;
    const rawSpecialBuildings = rawConfiguration.specialBuildings as
      | Partial<Record<CitySpecialBuildingSlotId, CitySpecialBuildingOptionId>>
      | undefined;
    const migratedSlot1 =
      rawSpecialBuildings?.slot1 ??
      (rawModifiers?.['thermalBathsBuilt'] ? 'thermal_baths' : 'none');
    const migratedSlot2 = rawSpecialBuildings?.slot2 ?? 'none';

    return {
      id: rawConfiguration.id ?? `custom-city-${Date.now()}`,
      name: rawConfiguration.name ?? 'City Plan',
      isPreset: Boolean(rawConfiguration.isPreset),
      buildingLevels: cityBuildingPlanDefinitions.reduce(
        (accumulator, building) => {
          const rawLevel = Number(rawBuildingLevels[building.id] ?? 0);
          const normalizedLevel = Number.isFinite(rawLevel) ? rawLevel : 0;

          accumulator[building.id] = Math.min(
            Math.max(Math.round(normalizedLevel), 0),
            building.maxLevel,
          );

          return accumulator;
        },
        {} as Record<string, number>,
      ),
      modifiers: {
        plowResearched: Boolean(rawModifiers?.['plowResearched']),
        aphroditeActive: Boolean(rawModifiers?.['aphroditeActive']),
      },
      specialBuildings: {
        slot1: this.isAllowedSpecialBuildingOption('slot1', migratedSlot1) ? migratedSlot1 : 'none',
        slot2: this.isAllowedSpecialBuildingOption('slot2', migratedSlot2) ? migratedSlot2 : 'none',
      },
    };
  }

  private normalizeTroopConfiguration(
    rawConfiguration: Partial<TroopConfiguration>,
  ): TroopConfiguration {
    const rawUnitAmounts = rawConfiguration.unitAmounts ?? {};
    const rawModifiers = rawConfiguration.modifiers as Partial<Record<string, boolean>> | undefined;

    return {
      id: rawConfiguration.id ?? `custom-troops-${Date.now()}`,
      name: rawConfiguration.name ?? 'Troop Plan',
      isPreset: Boolean(rawConfiguration.isPreset),
      unitAmounts: Object.entries(rawUnitAmounts).reduce(
        (amounts, [unitId, rawAmount]) => {
          const parsedAmount = Number(rawAmount);

          amounts[unitId] = Number.isFinite(parsedAmount)
            ? Math.max(Math.round(parsedAmount), 0)
            : 0;

          return amounts;
        },
        {} as Record<string, number>,
      ),
      modifiers: {
        bunks: Boolean(rawModifiers?.['bunks']),
      },
    };
  }

  private isAllowedSpecialBuildingOption(
    slotId: CitySpecialBuildingSlotId,
    optionId: CitySpecialBuildingOptionId,
  ): boolean {
    const slotDefinition = citySpecialBuildingSlotDefinitions.find((slot) => slot.id === slotId);

    return Boolean(slotDefinition?.optionIds.includes(optionId));
  }

  private clonePlan(plan: PlanConfig): PlanConfig {
    return {
      ...plan,
      settings: { ...plan.settings },
      cityPlan: this.cloneCityPlan(plan.cityPlan),
      troopPlan: this.cloneTroopPlan(plan.troopPlan),
    };
  }

  private cloneCityPlan(configuration: CityConfiguration): CityConfiguration {
    return {
      ...configuration,
      buildingLevels: { ...configuration.buildingLevels },
      modifiers: { ...configuration.modifiers },
      specialBuildings: { ...configuration.specialBuildings },
    };
  }

  private cloneTroopPlan(configuration: TroopConfiguration): TroopConfiguration {
    return {
      ...configuration,
      unitAmounts: { ...configuration.unitAmounts },
      modifiers: { ...configuration.modifiers },
    };
  }

  private normalizeOptionalString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
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
