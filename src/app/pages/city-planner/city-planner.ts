import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  cityBuildingPlanDefinitions,
  cityConfigurationPresets,
  cityModifierDefinitions,
} from '../../data/city-planner-presets';
import {
  CityConfiguration,
  CityModifierId,
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

  protected readonly buildingDefinitions = cityBuildingPlanDefinitions;
  protected readonly modifierDefinitions = cityModifierDefinitions;

  protected readonly configurations = signal<CityConfiguration[]>(this.loadConfigurations());
  protected readonly selectedConfigurationId = signal(this.configurations()[0]?.id ?? '');

  protected readonly selectedConfiguration = computed(() => {
    return (
      this.configurations().find(
        (configuration) => configuration.id === this.selectedConfigurationId(),
      ) ?? this.configurations()[0]
    );
  });

  protected readonly populationCapacity = computed(() => {
    const configuration = this.selectedConfiguration();

    return this.buildingDefinitions.reduce((sum, building) => {
      const level = configuration.buildingLevels[building.id] ?? 0;
      const population = this.getBuildingPopulation(building.id, level);

      return population > 0 ? sum + population : sum;
    }, this.getModifierPopulationCapacity(configuration));
  });

  protected readonly usedPopulation = computed(() => {
    const configuration = this.selectedConfiguration();

    return this.buildingDefinitions.reduce((sum, building) => {
      const level = configuration.buildingLevels[building.id] ?? 0;
      const population = this.getBuildingPopulation(building.id, level);

      return population < 0 ? sum + Math.abs(population) : sum;
    }, 0);
  });

  protected readonly freePopulation = computed(() => {
    return this.populationCapacity() - this.usedPopulation();
  });

  protected selectConfiguration(configurationId: string): void {
    this.selectedConfigurationId.set(configurationId);
  }

  protected updateBuildingLevel(buildingId: string, value: string | number): void {
    const definition = this.buildingDefinitions.find((building) => building.id === buildingId);

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

  protected updateModifier(modifierId: CityModifierId, checked: boolean): void {
    this.updateSelectedConfiguration({
      modifiers: {
        ...this.selectedConfiguration().modifiers,
        [modifierId]: checked,
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
  }

  protected getBuildingLevel(buildingId: string): number {
    return this.selectedConfiguration().buildingLevels[buildingId] ?? 0;
  }

  protected getBuildingPopulation(buildingId: string, level: number): number {
    const definition = this.buildingDefinitions.find((building) => building.id === buildingId);

    if (!definition) {
      return 0;
    }

    return definition.populationByLevel[level] ?? 0;
  }

  protected getModifierPopulation(modifierId: CityModifierId): number {
    const modifier = this.modifierDefinitions.find((definition) => definition.id === modifierId);

    return modifier?.populationDelta ?? 0;
  }

  private updateSelectedConfiguration(
    partialConfiguration: Partial<CityConfiguration>,
  ): void {
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
      return configuration.modifiers[modifier.id]
        ? sum + Math.max(modifier.populationDelta, 0)
        : sum;
    }, 0);
  }

  private loadConfigurations(): CityConfiguration[] {
    const storedConfigurations = localStorage.getItem(this.storageKey);

    if (!storedConfigurations) {
      return structuredClone(cityConfigurationPresets);
    }

    try {
      return JSON.parse(storedConfigurations) as CityConfiguration[];
    } catch {
      return structuredClone(cityConfigurationPresets);
    }
  }
}