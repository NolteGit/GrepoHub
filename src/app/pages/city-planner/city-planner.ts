import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  cityBuildingPlanDefinitions,
  cityConfigurationPresets,
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

@Component({
  selector: 'app-city-planner',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './city-planner.html',
  styleUrl: './city-planner.scss',
})
export class CityPlanner {
  private readonly storageKey = 'grepo-hub-city-configurations';
  private readonly fallbackConfiguration = structuredClone(cityConfigurationPresets[0]);

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

  protected readonly configurations = signal<CityConfiguration[]>(this.loadConfigurations());
  protected readonly selectedConfigurationId = signal(this.configurations()[0]?.id ?? '');

  protected readonly selectedConfiguration = computed<CityConfiguration>(() => {
    return (
      this.configurations().find(
        (configuration) => configuration.id === this.selectedConfigurationId(),
      ) ?? this.configurations()[0] ?? this.fallbackConfiguration
    );
  });

  protected readonly populationCapacity = computed(() => {
    const configuration = this.selectedConfiguration();

    return this.buildingDefinitions.reduce((sum, building) => {
      const level = configuration.buildingLevels[building.id] ?? 0;
      const population = this.getBuildingPopulation(building.id, level);

      return population > 0 ? sum + population : sum;
    }, this.getModifierPopulationCapacity(configuration) + this.getSpecialBuildingPopulationCapacity(configuration));
  });

  protected readonly usedPopulation = computed(() => {
    const configuration = this.selectedConfiguration();

    return this.buildingDefinitions.reduce((sum, building) => {
      const level = configuration.buildingLevels[building.id] ?? 0;
      const population = this.getBuildingPopulation(building.id, level);

      return population < 0 ? sum + Math.abs(population) : sum;
    }, this.getSpecialBuildingUsedPopulation(configuration));
  });

  protected readonly freePopulation = computed(() => {
    return this.populationCapacity() - this.usedPopulation();
  });

  protected selectConfiguration(configurationId: string): void {
    this.selectedConfigurationId.set(configurationId);
  }

  protected updateBuildingLevel(buildingId: string, value: string | number): void {
    const definition = this.getBuildingDefinition(buildingId);

    if (!definition) {
      return;
    }

    const parsedValue = Number(value);
    const safeLevel = Number.isFinite(parsedValue) ? parsedValue : 0;
    const level = Math.min(Math.max(Math.round(safeLevel), 0), definition.maxLevel);

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

  protected updateModifier(modifierId: CityModifierId, checked: boolean): void {
    this.updateSelectedConfiguration({
      modifiers: {
        ...this.selectedConfiguration().modifiers,
        [modifierId]: checked,
      },
    });
  }

  protected updateSpecialBuilding(
    slotId: CitySpecialBuildingSlotId,
    value: string,
  ): void {
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
    localStorage.setItem(this.storageKey, JSON.stringify(this.configurations()));
  }

  protected saveAsNewConfiguration(): void {
    const currentConfiguration = this.selectedConfiguration();
    const name = window.prompt('Configuration name', `${currentConfiguration.name} Copy`);

    if (!name) {
      return;
    }

    const newConfiguration: CityConfiguration = {
      ...structuredClone(currentConfiguration),
      id: `custom-${Date.now()}`,
      name,
      isPreset: false,
    };

    this.configurations.update((configurations) => [...configurations, newConfiguration]);
    this.selectedConfigurationId.set(newConfiguration.id);
    this.saveConfigurations();
  }

  protected resetSelectedConfiguration(): void {
    const currentConfiguration = this.selectedConfiguration();
    const preset = cityConfigurationPresets.find(
      (configuration) => configuration.id === currentConfiguration.id,
    );

    if (!preset) {
      return;
    }

    this.configurations.update((configurations) =>
      configurations.map((configuration) =>
        configuration.id === preset.id ? structuredClone(preset) : configuration,
      ),
    );

    this.saveConfigurations();
  }

  protected getBuildingDefinition(buildingId: string): CityBuildingPlanDefinition | undefined {
    return this.buildingDefinitions.find((building) => building.id === buildingId);
  }

  protected getBuildingLevel(buildingId: string): number {
    return this.selectedConfiguration().buildingLevels[buildingId] ?? 0;
  }

  protected getBuildingPopulation(buildingId: string, level: number): number {
    const definition = this.getBuildingDefinition(buildingId);

    if (!definition) {
      return 0;
    }

    return definition.populationByLevel[level] ?? 0;
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
      return (configuration.buildingLevels['farm'] ?? 0) * 5;
    }

    return this.getBaseModifierPopulation(modifierId);
  }

  protected getSelectedSpecialBuilding(slotId: CitySpecialBuildingSlotId): CitySpecialBuildingOptionId {
    return this.selectedConfiguration().specialBuildings[slotId] ?? 'none';
  }

  protected getSpecialBuildingPopulation(optionId: CitySpecialBuildingOptionId): number {
    const option = this.specialBuildingOptionDefinitions.find((definition) => definition.id === optionId);

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

  protected getSelectedSpecialBuildingImagePath(
    slotId: CitySpecialBuildingSlotId,
  ): string {
    const selectedOption = this.getSelectedSpecialBuilding(slotId);

    if (selectedOption === 'none') {
      return '';
    }

    return this.getBuildingImagePath(selectedOption);
  }

  private updateSelectedConfiguration(partialConfiguration: Partial<CityConfiguration>): void {
    const currentConfiguration = this.selectedConfiguration();

    this.configurations.update((configurations) =>
      configurations.map((configuration) =>
        configuration.id === currentConfiguration.id
          ? {
              ...configuration,
              ...partialConfiguration,
            }
          : configuration,
      ),
    );
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

  private getSpecialBuildingUsedPopulation(configuration: CityConfiguration): number {
    return Object.values(configuration.specialBuildings).reduce((sum, optionId) => {
      const delta = this.getSpecialBuildingPopulation(optionId);

      return delta < 0 ? sum + Math.abs(delta) : sum;
    }, 0);
  }

  private createNormalizedConfiguration(rawConfiguration: Partial<CityConfiguration>): CityConfiguration {
    const rawBuildingLevels = rawConfiguration.buildingLevels ?? {};
    const rawModifiers = rawConfiguration.modifiers as Partial<Record<string, boolean>> | undefined;
    const rawSpecialBuildings = rawConfiguration.specialBuildings as
      | Partial<Record<CitySpecialBuildingSlotId, CitySpecialBuildingOptionId>>
      | undefined;

    const migratedSlot1 =
      rawSpecialBuildings?.['slot1'] ??
      (rawModifiers?.['thermalBathsBuilt'] ? 'thermal_baths' : 'none');

    const migratedSlot2 = rawSpecialBuildings?.['slot2'] ?? 'none';

    return {
      id: rawConfiguration.id ?? `custom-${Date.now()}`,
      name: rawConfiguration.name ?? 'Configuration',
      isPreset: rawConfiguration.isPreset ?? false,
      buildingLevels: this.buildingDefinitions.reduce(
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
        slot1: this.isAllowedSpecialBuildingOption('slot1', migratedSlot1)
          ? migratedSlot1
          : 'none',
        slot2: this.isAllowedSpecialBuildingOption('slot2', migratedSlot2)
          ? migratedSlot2
          : 'none',
      },
    };
  }

  private isAllowedSpecialBuildingOption(
    slotId: CitySpecialBuildingSlotId,
    optionId: CitySpecialBuildingOptionId,
  ): boolean {
    const slotDefinition = this.specialBuildingSlotDefinitions.find((slot) => slot.id === slotId);

    return Boolean(slotDefinition?.optionIds.includes(optionId));
  }

  private loadConfigurations(): CityConfiguration[] {
    const storedConfigurations = localStorage.getItem(this.storageKey);

    if (!storedConfigurations) {
      return structuredClone(cityConfigurationPresets);
    }

    try {
      const parsedConfigurations = JSON.parse(storedConfigurations) as Partial<CityConfiguration>[];

      if (!Array.isArray(parsedConfigurations) || parsedConfigurations.length === 0) {
        return structuredClone(cityConfigurationPresets);
      }

      return parsedConfigurations.map((configuration) =>
        this.createNormalizedConfiguration(configuration),
      );
    } catch {
      return structuredClone(cityConfigurationPresets);
    }
  }
}