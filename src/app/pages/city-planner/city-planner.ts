import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  cityBuildingPlanDefinitions,
  cityModifierDefinitions,
  citySpecialBuildingOptionDefinitions,
  citySpecialBuildingSlotDefinitions,
} from '../../data/city-planner-presets';
import { getBuildingImagePath as getAssetBuildingImagePath } from '../../data/asset-paths';
import {
  CityBuildingPlanDefinition,
  CityConfiguration,
  CityModifierId,
  CitySpecialBuildingOptionId,
  CitySpecialBuildingSlotId,
} from '../../models/city-configuration.model';
import { PlanConfig } from '../../models/plan-config.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { GameDataService } from '../../services/game-data.service';
import { calculateCityPlannerPopulation } from '../../services/city-planner-population';
import { PlanConfigService } from '../../services/plan-config.service';
import { PlanImportExportUiService } from '../../services/plan-import-export-ui.service';
import { PlanReadableExportService } from '../../services/plan-readable-export.service';
import { TranslationService } from '../../services/translation.service';
import { AppIconComponent } from '../../shared/app-icon/app-icon';
import { AcademyResearchDialogComponent } from './academy-research-dialog';

@Component({
  selector: 'app-city-planner',
  imports: [FormsModule, TranslatePipe, AppIconComponent, AcademyResearchDialogComponent],
  templateUrl: './city-planner.html',
  styleUrl: './city-planner.scss',
  providers: [PlanImportExportUiService],
})
export class CityPlanner {
  protected readonly clearPlanDialogOpen = signal(false);
  protected readonly configurationMenuOpen = signal(false);
  protected readonly newPlanDialogOpen = signal(false);
  protected readonly newPlanName = signal('');
  protected readonly academyResearchDialogOpen = signal(false);

  private readonly gameDataService = inject(GameDataService);
  private readonly planConfigService = inject(PlanConfigService);
  private readonly planReadableExportService = inject(PlanReadableExportService);
  private readonly planImportExportUiService = inject(PlanImportExportUiService);
  private readonly translationService = inject(TranslationService);
  protected readonly planImportDialog = this.planImportExportUiService.planImportDialog;
  protected readonly exportMenuOpen = this.planImportExportUiService.exportMenuOpen;
  protected readonly canDeleteActivePlan = this.planConfigService.canDeleteActivePlan;
  protected readonly activePlanName = computed(() =>
    this.displayPlanName(this.planConfigService.activePlan()),
  );
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

  protected readonly units = toSignal(this.gameDataService.getUnitDefinitions(), {
    initialValue: [],
  });

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

  protected readonly populationResult = computed(() => {
    return calculateCityPlannerPopulation(this.selectedConfiguration());
  });

  protected readonly populationCapacity = computed(() => {
    return this.populationResult().populationCapacity;
  });

  protected readonly usedPopulation = computed(() => {
    return this.populationResult().usedPopulation;
  });

  protected readonly usedTroopPopulation = computed(() => {
    const unitDefinitions = new Map(this.units().map((unit) => [unit.id, unit]));
    const troopPlan = this.planConfigService.activePlan().troopPlan;

    return Object.entries(troopPlan.unitAmounts).reduce((sum, [unitId, amount]) => {
      const unit = unitDefinitions.get(unitId);
      const safeAmount = Number.isFinite(amount) ? amount : 0;

      return sum + (unit?.cost.population ?? 0) * safeAmount;
    }, 0);
  });

  protected readonly freePopulation = computed(() => {
    return this.populationCapacity() - this.usedPopulation() - this.usedTroopPopulation();
  });

  protected selectConfiguration(configurationId: string): void {
    this.planConfigService.selectPlan(configurationId);
    this.closeExportMenu();
    this.closeConfigurationMenu();
  }

  protected toggleExportMenu(): void {
    this.planImportExportUiService.toggleExportMenu(() => this.closeConfigurationMenu());
  }

  protected closeExportMenu(): void {
    this.planImportExportUiService.closeExportMenu();
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
    const targetLevel =
      limit === 'min' ? this.getBuildingMinLevel(buildingId) : this.getBuildingMaxLevel(buildingId);

    return this.translationService.translate(
      'cityPlanner.setBuildingToLevelAria',
      'Set {building} to level {level}',
      {
        building: this.getTranslatedBuildingName(buildingId),
        level: targetLevel,
      },
    );
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

  protected getBuildingLimitButtonLabel(buildingId: string): string {
    const definition = this.getBuildingDefinition(buildingId);

    if (!definition) {
      return this.translationService.translate('cityPlanner.maxShort', 'MAX');
    }

    return this.getBuildingLevel(buildingId) >= definition.maxLevel
      ? this.translationService.translate('cityPlanner.minShort', 'MIN')
      : this.translationService.translate('cityPlanner.maxShort', 'MAX');
  }

  protected getBuildingLimitButtonAriaLabel(buildingId: string): string {
    const definition = this.getBuildingDefinition(buildingId);

    if (!definition) {
      return this.translationService.translate(
        'cityPlanner.setBuildingToLimitAria',
        'Set {building} to limit level',
        { building: this.getTranslatedBuildingName(buildingId) },
      );
    }

    const targetLevel =
      this.getBuildingLevel(buildingId) >= definition.maxLevel
        ? this.getBuildingMinLevel(buildingId)
        : definition.maxLevel;

    return this.translationService.translate(
      'cityPlanner.setBuildingToLevelAria',
      'Set {building} to level {level}',
      {
        building: this.getTranslatedBuildingName(buildingId),
        level: targetLevel,
      },
    );
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

  protected exportActivePlanAsTxt(): void {
    this.planReadableExportService.exportActivePlanAsTxt();
  }

  protected exportActivePlanAsCsv(): void {
    this.planReadableExportService.exportActivePlanAsCsv();
  }

  protected exportActivePlanAsJson(): void {
    this.planImportExportUiService.exportActivePlanAsJson();
  }

  protected importPlanFromJsonFile(event: Event): Promise<void> {
    return this.planImportExportUiService.importPlanFromJsonFile(event);
  }

  protected deleteActivePlan(): void {
    if (!this.canDeleteActivePlan()) {
      this.showPlanDeleteResultDialog([this.getLastPlanDeleteDetail()], true);
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
      this.showPlanDeleteResultDialog([this.getLastPlanDeleteDetail()], true);
      return;
    }

    this.showPlanDeleteResultDialog([
      this.translationService.translate(
        'planConfig.deleteDialog.deletedDetail',
        '{name} deleted.',
        {
          name: result.deletedPlanName,
        },
      ),
      this.translationService.translate(
        'planConfig.deleteDialog.selectedDetail',
        'Now selected: {name}.',
        {
          name: this.activePlanName(),
        },
      ),
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
    this.planImportExportUiService.closePlanImportDialog();
  }

  protected openAcademyResearchDialog(): void {
    this.academyResearchDialogOpen.set(true);
  }

  protected closeAcademyResearchDialog(): void {
    this.academyResearchDialogOpen.set(false);
  }

  protected openNewPlanDialog(): void {
    const currentPlan = this.planConfigService.activePlan();

    this.newPlanName.set(
      this.translationService.translate('planConfig.newPlanDialog.copyName', '{name} Copy', {
        name: this.displayPlanName(currentPlan),
      }),
    );
    this.closeExportMenu();
    this.closeConfigurationMenu();
    this.newPlanDialogOpen.set(true);
  }

  protected updateNewPlanName(value: string): void {
    this.newPlanName.set(value);
  }

  protected cancelNewPlan(): void {
    this.newPlanDialogOpen.set(false);
    this.newPlanName.set('');
  }

  protected confirmNewPlan(): void {
    const planName = this.newPlanName().trim();

    if (!planName) {
      return;
    }

    this.planConfigService.duplicateActivePlan(planName);
    this.newPlanDialogOpen.set(false);
    this.newPlanName.set('');
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
    return getAssetBuildingImagePath(buildingId);
  }

  protected getSelectedSpecialBuildingImagePath(slotId: CitySpecialBuildingSlotId): string {
    const selectedOption = this.getSelectedSpecialBuilding(slotId);

    if (selectedOption === 'none') {
      return '';
    }

    return this.getBuildingImagePath(selectedOption);
  }

  protected displayPlanName(plan: Pick<PlanConfig, 'id' | 'name' | 'isPreset'>): string {
    this.translationService.currentLanguage();

    return plan.isPreset
      ? this.translationService.translate('planConfig.preset.' + plan.id, plan.name)
      : plan.name;
  }

  private getTranslatedBuildingName(buildingId: string): string {
    return this.translationService.translate(
      'building.' + buildingId,
      buildingId.replace(/_/g, ' '),
    );
  }

  private getLastPlanDeleteDetail(): string {
    return this.translationService.translate(
      'planConfig.deleteDialog.lastPlanDetail',
      'At least one plan is required. Create or import another plan before deleting this one.',
    );
  }

  private updateSelectedConfiguration(partialConfiguration: Partial<CityConfiguration>): void {
    this.planConfigService.updateActiveCityPlan(partialConfiguration);
  }
}
