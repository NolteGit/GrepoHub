import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  cityBuildingPlanDefinitions,
  cityModifierDefinitions,
  citySpecialBuildingOptionDefinitions,
  citySpecialBuildingSlotDefinitions,
} from '../../data/city-planner-presets';
import {
  CityBuildingPlanDefinition,
  CityConfiguration,
  CityModifierId,
  CitySpecialBuildingOptionId,
  CitySpecialBuildingSlotId,
} from '../../models/city-configuration.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PlanConfigService } from '../../services/plan-config.service';
import { PlanReadableExportService } from '../../services/plan-readable-export.service';
import { AppIconComponent } from '../../shared/app-icon/app-icon';

@Component({
  selector: 'app-city-planner',
  imports: [FormsModule, TranslatePipe, AppIconComponent],
  templateUrl: './city-planner.html',
  styleUrl: './city-planner.scss',
})
export class CityPlanner {
  protected readonly planImportDialog = signal<{
    readonly isError: boolean;
    readonly detailLines: readonly string[];
  } | null>(null);

  protected readonly clearPlanDialogOpen = signal(false);
  protected readonly exportMenuOpen = signal(false);
  protected readonly configurationMenuOpen = signal(false);

  private readonly planConfigService = inject(PlanConfigService);
  private readonly planReadableExportService = inject(PlanReadableExportService);
  protected readonly canDeleteActivePlan = this.planConfigService.canDeleteActivePlan;
  protected readonly activePlanName = computed(() => this.planConfigService.activePlan().name);
  protected readonly deletePlanDialogOpen = signal(false);
  protected readonly planDeleteResultDialog = signal<{
    readonly isError: boolean;
    readonly detailLines: readonly string[];
  } | null>(null);
  private readonly buildingLevelOptionsCache = new Map<string, readonly number[]>();
  private readonly buildingMinLevels: Record<string, number> = {
    barracks: 1,
    farm: 1,
    marketplace: 1,
    quarry: 1,
    senate: 9,
    silver_mine: 1,
    temple: 1,
    timber_camp: 1,
    warehouse: 1,
  };

  protected readonly buildingDefinitions = cityBuildingPlanDefinitions;
  protected readonly modifierDefinitions = cityModifierDefinitions;
  protected readonly specialBuildingSlotDefinitions = citySpecialBuildingSlotDefinitions;
  protected readonly specialBuildingOptionDefinitions = citySpecialBuildingOptionDefinitions;

  protected readonly buildingLayoutRows: string[][] = [
    ['senate'],
    ['timber_camp', 'farm', 'quarry', 'warehouse'],
    ['silver_mine', 'barracks', 'temple', 'marketplace'],
    ['harbour', 'academy', 'city_wall', 'cave'],
  ];

  protected readonly configurations = computed(() => this.planConfigService.plans());
  protected readonly selectedConfigurationId = this.planConfigService.activePlanId;

  protected readonly selectedConfiguration = computed<CityConfiguration>(() => {
    return this.planConfigService.activePlan().cityPlan;
  });

  protected readonly populationCapacity = computed(() => {
    const configuration = this.selectedConfiguration();
    const farmLevel = this.getBuildingLevel('farm');
    const farmCapacity = Math.max(this.getBuildingPopulation('farm', farmLevel), 0);
    const aphroditeCapacity = configuration.modifiers['aphroditeActive'] ? farmLevel * 5 : 0;
    const thermalBaseCapacity = farmCapacity + aphroditeCapacity;
    const thermalAdjustedCapacity = this.hasSpecialBuilding(configuration, 'thermal_baths')
      ? Math.round(thermalBaseCapacity * 1.1)
      : thermalBaseCapacity;

    const otherBuildingCapacity = this.buildingDefinitions.reduce((sum, building) => {
      if (building.id === 'farm') {
        return sum;
      }

      const level = this.getBuildingLevel(building.id);
      const population = this.getBuildingPopulation(building.id, level);

      return population > 0 ? sum + population : sum;
    }, 0);

    const fixedModifierCapacity = this.modifierDefinitions.reduce((sum, modifier) => {
      if (!configuration.modifiers[modifier.id] || modifier.id === 'aphroditeActive') {
        return sum;
      }

      return sum + Math.max(modifier.populationDelta, 0);
    }, 0);

    return (
      thermalAdjustedCapacity +
      otherBuildingCapacity +
      fixedModifierCapacity +
      this.getSpecialBuildingPopulationCapacity(configuration)
    );
  });

  protected readonly usedPopulation = computed(() => {
    const configuration = this.selectedConfiguration();

    const usedPopulation = this.buildingDefinitions.reduce((sum, building) => {
      const level = this.getBuildingLevel(building.id);
      const population = this.getExactBuildingPopulation(building.id, level);

      return population < 0 ? sum + Math.abs(population) : sum;
    }, this.getSpecialBuildingUsedPopulation(configuration));

    return Math.round(usedPopulation);
  });

  protected readonly freePopulation = computed(() => {
    return this.populationCapacity() - this.usedPopulation();
  });

  protected selectConfiguration(configurationId: string): void {
    this.planConfigService.selectPlan(configurationId);
    this.closeExportMenu();
    this.closeConfigurationMenu();
  }

  protected toggleExportMenu(): void {
    const shouldOpen = !this.exportMenuOpen();

    this.exportMenuOpen.set(shouldOpen);

    if (shouldOpen) {
      this.closeConfigurationMenu();
    }
  }

  protected closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  protected toggleConfigurationMenu(): void {
    const shouldOpen = !this.configurationMenuOpen();

    this.configurationMenuOpen.set(shouldOpen);

    if (shouldOpen) {
      this.closeExportMenu();
    }
  }

  protected closeConfigurationMenu(): void {
    this.configurationMenuOpen.set(false);
  }

  protected updateBuildingLevel(buildingId: string, value: string | number): void {
    const definition = this.getBuildingDefinition(buildingId);

    if (!definition) {
      return;
    }

    const parsedValue = Number(value);
    const safeLevel = Number.isFinite(parsedValue) ? parsedValue : 0;
    const minLevel = this.getBuildingMinLevel(buildingId);
    const level = Math.min(Math.max(Math.round(safeLevel), minLevel), definition.maxLevel);

    this.updateSelectedConfiguration({
      buildingLevels: {
        ...this.selectedConfiguration().buildingLevels,
        [buildingId]: level,
      },
    });
  }

  protected stepBuildingLevel(buildingId: string, delta: number): void {
    this.updateBuildingLevel(buildingId, this.getBuildingLevel(buildingId) + delta);
  }

  protected getBuildingLevelOptions(buildingId: string, maxLevel: number): readonly number[] {
    const safeMinLevel = this.getBuildingMinLevel(buildingId);
    const safeMaxLevel = Math.max(Math.floor(maxLevel), safeMinLevel);
    const cacheKey = `${buildingId}:${safeMinLevel}:${safeMaxLevel}`;
    const cachedOptions = this.buildingLevelOptionsCache.get(cacheKey);

    if (cachedOptions) {
      return cachedOptions;
    }

    const options = Array.from(
      { length: safeMaxLevel - safeMinLevel + 1 },
      (_, index) => safeMinLevel + index,
    );
    this.buildingLevelOptionsCache.set(cacheKey, options);

    return options;
  }

  protected setBuildingToMinLevel(buildingId: string): void {
    this.updateBuildingLevel(buildingId, this.getBuildingMinLevel(buildingId));
  }

  protected setBuildingToMaxLevel(buildingId: string): void {
    this.updateBuildingLevel(buildingId, this.getBuildingMaxLevel(buildingId));
  }

  protected getBuildingMaxLevel(buildingId: string): number {
    return this.getBuildingDefinition(buildingId)?.maxLevel ?? this.getBuildingLevel(buildingId);
  }

  protected getBuildingLimitTargetAriaLabel(buildingId: string, limit: 'min' | 'max'): string {
    const buildingName = buildingId.replace(/_/g, ' ');
    const targetLevel =
      limit === 'min' ? this.getBuildingMinLevel(buildingId) : this.getBuildingMaxLevel(buildingId);

    return 'Set ' + buildingName + ' to level ' + targetLevel;
  }

  protected toggleBuildingLevelLimit(buildingId: string): void {
    const definition = this.getBuildingDefinition(buildingId);

    if (!definition) {
      return;
    }

    const minLevel = this.getBuildingMinLevel(buildingId);
    const currentLevel = this.getBuildingLevel(buildingId);
    const targetLevel = currentLevel >= definition.maxLevel ? minLevel : definition.maxLevel;

    this.updateBuildingLevel(buildingId, targetLevel);
  }

  protected getBuildingLimitButtonLabel(buildingId: string): 'Min' | 'Max' {
    const definition = this.getBuildingDefinition(buildingId);

    if (!definition) {
      return 'Max';
    }

    return this.getBuildingLevel(buildingId) >= definition.maxLevel ? 'Min' : 'Max';
  }

  protected getBuildingLimitButtonAriaLabel(buildingId: string): string {
    const definition = this.getBuildingDefinition(buildingId);
    const buildingName = buildingId.replace(/_/g, ' ');

    if (!definition) {
      return 'Set ' + buildingName + ' to limit level';
    }

    const targetLevel =
      this.getBuildingLevel(buildingId) >= definition.maxLevel
        ? this.getBuildingMinLevel(buildingId)
        : definition.maxLevel;

    return 'Set ' + buildingName + ' to level ' + targetLevel;
  }

  protected updateModifier(modifierId: CityModifierId, checked: boolean): void {
    this.updateSelectedConfiguration({
      modifiers: {
        ...this.selectedConfiguration().modifiers,
        [modifierId]: checked,
      },
    });
  }

  protected updateSpecialBuilding(slotId: CitySpecialBuildingSlotId, value: string): void {
    const optionId = value as CitySpecialBuildingOptionId;
    const slotDefinition = this.specialBuildingSlotDefinitions.find((slot) => slot.id === slotId);

    if (!slotDefinition || !slotDefinition.optionIds.includes(optionId)) {
      return;
    }

    this.updateSelectedConfiguration({
      specialBuildings: {
        ...this.selectedConfiguration().specialBuildings,
        [slotId]: optionId,
      },
    });
  }

  protected saveConfigurations(): void {
    this.planConfigService.savePlans();
  }
  protected exportActivePlanAsTxt(): void {
    this.planReadableExportService.exportActivePlanAsTxt();
  }

  protected exportActivePlanAsCsv(): void {
    this.planReadableExportService.exportActivePlanAsCsv();
  }

  protected exportActivePlanAsJson(): void {
    const exportedAt = new Date().toISOString();
    const exportIdSuffix = exportedAt.replace(/\D/g, '').slice(0, 14);
    const activePlan = this.preparePlanForExport(
      structuredClone(this.planConfigService.activePlan()) as Record<string, unknown>,
      exportedAt,
      exportIdSuffix,
    );
    const exportBundle = {
      format: 'grepo-hub-plan-config',
      version: 1,
      exportedAt,
      plans: [activePlan],
    };
    const planName = typeof activePlan['name'] === 'string' ? activePlan['name'] : 'grepo-plan';
    const fileName = this.sanitizeFileName(planName) + '.grepo-plan.json';

    this.downloadTextFile(fileName, JSON.stringify(exportBundle, null, 2), 'application/json');
  }
  protected importPlanFromJsonFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const content = typeof reader.result === 'string' ? reader.result : '';
        const result = this.planConfigService.importJsonAsNewPlans(content);

        this.showPlanImportSuccessDialog(result.plans);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not import plan file.';

        this.showPlanImportErrorDialog(message);
      } finally {
        input.value = '';
      }
    };

    reader.onerror = () => {
      this.showPlanImportErrorDialog('Could not read plan file.');
      input.value = '';
    };

    reader.readAsText(file);
  }

  protected deleteActivePlan(): void {
    if (!this.canDeleteActivePlan()) {
      this.showPlanDeleteResultDialog(
        ['Default presets cannot be deleted. Duplicate or import a plan first.'],
        true,
      );
      return;
    }

    this.deletePlanDialogOpen.set(true);
  }

  protected cancelDeleteActivePlan(): void {
    this.deletePlanDialogOpen.set(false);
  }

  protected confirmDeleteActivePlan(): void {
    this.deletePlanDialogOpen.set(false);

    const result = this.planConfigService.deleteActivePlan();

    if (!result) {
      this.showPlanDeleteResultDialog(
        ['Default presets cannot be deleted. Duplicate or import a plan first.'],
        true,
      );
      return;
    }

    this.showPlanDeleteResultDialog([
      result.deletedPlanName + ' deleted.',
      'Now selected: ' + result.selectedPlanName + '.',
    ]);
  }

  protected closePlanDeleteResultDialog(): void {
    this.planDeleteResultDialog.set(null);
  }

  private showPlanDeleteResultDialog(detailLines: readonly string[], isError = false): void {
    this.planDeleteResultDialog.set({
      isError,
      detailLines,
    });
  }

  protected closePlanImportDialog(): void {
    this.planImportDialog.set(null);
  }

  private showPlanImportSuccessDialog(
    importedPlans: readonly {
      readonly name: string;
      readonly requestedName: string;
      readonly renamed: boolean;
    }[],
  ): void {
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
      this.isPlainRecord(portablePlan['settings']) ? portablePlan['settings'] : {},
    );

    const cityPlan = portablePlan['cityPlan'];

    if (this.isPlainRecord(cityPlan)) {
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

    if (this.isPlainRecord(troopPlan)) {
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

    if (!this.isPlainRecord(value)) {
      return value;
    }

    return Object.entries(value).reduce<Record<string, unknown>>((cleanedValue, [key, item]) => {
      if (item !== null && item !== undefined) {
        cleanedValue[key] = this.removeNullishValues(item);
      }

      return cleanedValue;
    }, {});
  }

  private isPlainRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
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

  protected saveAsNewConfiguration(): void {
    const currentPlan = this.planConfigService.activePlan();
    const name = window.prompt('Plan name', `${currentPlan.name} Copy`);

    if (!name) {
      return;
    }

    this.planConfigService.duplicateActivePlan(name);
  }
  protected clearActivePlan(): void {
    this.clearPlanDialogOpen.set(true);
  }

  protected cancelClearActivePlan(): void {
    this.clearPlanDialogOpen.set(false);
  }

  protected confirmClearActivePlan(): void {
    this.clearPlanDialogOpen.set(false);
    this.planConfigService.clearActiveCityPlan();
  }

  protected resetSelectedConfiguration(): void {
    this.planConfigService.resetActiveCityPlan();
  }

  protected getBuildingDefinition(buildingId: string): CityBuildingPlanDefinition | undefined {
    return this.buildingDefinitions.find((building) => building.id === buildingId);
  }

  protected getBuildingLevel(buildingId: string): number {
    const definition = this.getBuildingDefinition(buildingId);
    const configuredLevel = this.selectedConfiguration().buildingLevels[buildingId] ?? 0;

    if (!definition) {
      return configuredLevel;
    }

    return Math.min(
      Math.max(configuredLevel, this.getBuildingMinLevel(buildingId)),
      definition.maxLevel,
    );
  }

  protected getBuildingMinLevel(buildingId: string): number {
    return this.buildingMinLevels[buildingId] ?? 0;
  }

  protected getBuildingPopulation(buildingId: string, level: number): number {
    return this.roundPopulation(this.getExactBuildingPopulation(buildingId, level));
  }

  private getExactBuildingPopulation(buildingId: string, level: number): number {
    const definition = this.getBuildingDefinition(buildingId);

    if (!definition) {
      return 0;
    }

    return definition.populationByLevel[level] ?? 0;
  }

  private roundPopulation(value: number): number {
    return Math.sign(value) * Math.round(Math.abs(value));
  }

  protected getBaseModifierPopulation(modifierId: CityModifierId): number {
    const modifier = this.modifierDefinitions.find((definition) => definition.id === modifierId);

    return modifier?.populationDelta ?? 0;
  }

  protected getDisplayedModifierPopulation(modifierId: CityModifierId): number {
    const configuration = this.selectedConfiguration();

    if (!configuration.modifiers[modifierId]) {
      return 0;
    }

    if (modifierId === 'aphroditeActive') {
      return this.getBuildingLevel('farm') * 5;
    }

    return this.getBaseModifierPopulation(modifierId);
  }

  protected getSelectedSpecialBuilding(
    slotId: CitySpecialBuildingSlotId,
  ): CitySpecialBuildingOptionId {
    return this.selectedConfiguration().specialBuildings[slotId] ?? 'none';
  }

  protected getSpecialBuildingPopulation(optionId: CitySpecialBuildingOptionId): number {
    const option = this.specialBuildingOptionDefinitions.find(
      (definition) => definition.id === optionId,
    );

    return option?.populationDelta ?? 0;
  }

  protected getSpecialBuildingOptionLabelKey(optionId: CitySpecialBuildingOptionId): string {
    return optionId === 'none' ? 'cityPlanner.none' : `building.${optionId}`;
  }

  protected getBuildingImagePath(buildingId: string): string {
    const fileNameMap: Record<string, string> = {
      academy: 'academy',
      barracks: 'barracks',
      cave: 'cave',
      divine_statue: 'divine_statue',
      farm: 'farm',
      harbour: 'harbour',
      library: 'library',
      lighthouse: 'light_house',
      marketplace: 'market_place',
      merchants_shop: 'merchant_shop',
      oracle: 'oracle',
      quarry: 'quarry',
      senate: 'senate',
      silver_mine: 'silver_mine',
      temple: 'temple',
      theatre: 'theatre',
      thermal_baths: 'thermal_baths',
      timber_camp: 'timber_camp',
      tower: 'tower',
      city_wall: 'wall',
      warehouse: 'warehouse',
    };

    const fileName = fileNameMap[buildingId];

    return fileName ? `/assets/images/buildings/${fileName}.webp` : '';
  }

  protected getSelectedSpecialBuildingImagePath(slotId: CitySpecialBuildingSlotId): string {
    const selectedOption = this.getSelectedSpecialBuilding(slotId);

    if (selectedOption === 'none') {
      return '';
    }

    return this.getBuildingImagePath(selectedOption);
  }

  private updateSelectedConfiguration(partialConfiguration: Partial<CityConfiguration>): void {
    this.planConfigService.updateActiveCityPlan(partialConfiguration);
  }

  private getModifierPopulationCapacity(configuration: CityConfiguration): number {
    return this.modifierDefinitions.reduce((sum, modifier) => {
      if (!configuration.modifiers[modifier.id]) {
        return sum;
      }

      if (modifier.id === 'aphroditeActive') {
        return sum + (configuration.buildingLevels['farm'] ?? 0) * 5;
      }

      return sum + Math.max(modifier.populationDelta, 0);
    }, 0);
  }

  private getSpecialBuildingPopulationCapacity(configuration: CityConfiguration): number {
    return Object.values(configuration.specialBuildings).reduce((sum, optionId) => {
      const delta = this.getSpecialBuildingPopulation(optionId);

      return delta > 0 ? sum + delta : sum;
    }, 0);
  }

  private hasSpecialBuilding(
    configuration: CityConfiguration,
    optionId: CitySpecialBuildingOptionId,
  ): boolean {
    return Object.values(configuration.specialBuildings).includes(optionId);
  }

  private getSpecialBuildingUsedPopulation(configuration: CityConfiguration): number {
    return Object.values(configuration.specialBuildings).reduce((sum, optionId) => {
      const delta = this.getSpecialBuildingPopulation(optionId);

      return delta < 0 ? sum + Math.abs(delta) : sum;
    }, 0);
  }
}
