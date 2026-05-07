import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { troopConfigurationPresets } from '../../data/troops-planner-presets';
import { TroopConfiguration, TroopModifierId } from '../../models/troop-configuration.model';
import { AttackType, Unit } from '../../models/unit.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { GameDataService } from '../../services/game-data.service';

@Component({
  selector: 'app-troops-planner',
  imports: [FormsModule, NgTemplateOutlet, TranslatePipe],
  templateUrl: './troops-planner.html',
  styleUrl: './troops-planner.scss',
})
export class TroopsPlanner {
  private readonly gameDataService = inject(GameDataService);
  private readonly storageKey = 'grepo-hub-troop-configurations';
  private readonly fallbackConfiguration = structuredClone(troopConfigurationPresets[0]);

  protected readonly units = toSignal(this.gameDataService.getUnitDefinitions(), {
    initialValue: [] as Unit[],
  });

  protected readonly configurations = signal<TroopConfiguration[]>(this.loadConfigurations());
  protected readonly selectedConfigurationId = signal(this.configurations()[0]?.id ?? '');

  protected readonly selectedConfiguration = computed<TroopConfiguration>(() => {
    return (
      this.configurations().find(
        (configuration) => configuration.id === this.selectedConfigurationId(),
      ) ??
      this.configurations()[0] ??
      this.fallbackConfiguration
    );
  });

  protected readonly visibleUnits = computed(() => {
    return this.units().filter((unit) => unit.id !== 'militia');
  });

  protected readonly regularLandUnits = computed(() => {
    return this.visibleUnits().filter((unit) => unit.type === 'land' && !unit.isMythical);
  });

  protected readonly regularSeaUnits = computed(() => {
    return this.visibleUnits().filter((unit) => unit.type === 'sea' && !unit.isMythical);
  });

  protected readonly mythicalUnits = computed(() => {
    return this.visibleUnits().filter((unit) => unit.isMythical);
  });

  protected readonly selectedUnits = computed(() => {
    return this.visibleUnits()
      .map((unit) => ({
        unit,
        amount: this.getUnitAmount(unit.id),
      }))
      .filter((entry) => entry.amount > 0);
  });

  protected readonly totalUnitCount = computed(() => {
    return this.selectedUnits().reduce((sum, entry) => sum + entry.amount, 0);
  });

  protected readonly transportShipCount = computed(() => {
    return this.getUnitAmount('transport_boat') + this.getUnitAmount('fast_transport_ship');
  });

  protected readonly bunksCapacityBonus = computed(() => {
    if (!this.selectedConfiguration().modifiers.bunks) {
      return 0;
    }

    return this.transportShipCount() * 6;
  });

  protected readonly totals = computed(() => {
    const baseTotals = this.selectedUnits().reduce(
      (sum, entry) => ({
        wood: sum.wood + entry.unit.cost.wood * entry.amount,
        stone: sum.stone + entry.unit.cost.stone * entry.amount,
        silver: sum.silver + entry.unit.cost.silver * entry.amount,
        favor: sum.favor + entry.unit.cost.favor * entry.amount,
        population: sum.population + entry.unit.cost.population * entry.amount,
        landPopulation:
          sum.landPopulation +
          (entry.unit.type === 'land' ? entry.unit.cost.population * entry.amount : 0),
        seaPopulation:
          sum.seaPopulation +
          (entry.unit.type === 'sea' ? entry.unit.cost.population * entry.amount : 0),
        transportCapacity:
          sum.transportCapacity + entry.unit.transportCapacity * entry.amount,
        transportSpace: sum.transportSpace + entry.unit.transportSpace * entry.amount,
        attack: sum.attack + entry.unit.attack * entry.amount,
        attackSea: sum.attackSea + this.getUnitSeaAttackValue(entry.unit) * entry.amount,
        defenseBlunt: sum.defenseBlunt + entry.unit.defenseBlunt * entry.amount,
        defenseSharp: sum.defenseSharp + entry.unit.defenseSharp * entry.amount,
        defenseDistance:
          sum.defenseDistance + entry.unit.defenseDistance * entry.amount,
        defenseSea: sum.defenseSea + entry.unit.defenseSea * entry.amount,
      }),
      {
        wood: 0,
        stone: 0,
        silver: 0,
        favor: 0,
        population: 0,
        landPopulation: 0,
        seaPopulation: 0,
        transportCapacity: 0,
        transportSpace: 0,
        attack: 0,
        attackSea: 0,
        defenseBlunt: 0,
        defenseSharp: 0,
        defenseDistance: 0,
        defenseSea: 0,
      },
    );

    return {
      ...baseTotals,
      transportCapacity: baseTotals.transportCapacity + this.bunksCapacityBonus(),
    };
  });

  protected readonly attackTotals = computed(() => {
    return this.selectedUnits().reduce(
      (sum, entry) => {
        const unitAttackValue = entry.unit.attack * entry.amount;

        if (entry.unit.type === 'sea' || entry.unit.attackType === 'naval') {
          sum.sea += this.getUnitSeaAttackValue(entry.unit) * entry.amount;
          return sum;
        }

        if (entry.unit.attackType === 'blunt') {
          sum.blunt += unitAttackValue;
        }

        if (entry.unit.attackType === 'sharp') {
          sum.sharp += unitAttackValue;
        }

        if (entry.unit.attackType === 'distance') {
          sum.distance += unitAttackValue;
        }

        return sum;
      },
      {
        blunt: 0,
        sharp: 0,
        distance: 0,
        sea: 0,
      },
    );
  });

  protected readonly transportDelta = computed(() => {
    return this.totals().transportCapacity - this.totals().transportSpace;
  });

  protected readonly slowestSpeed = computed<number | null>(() => {
    const speeds = this.selectedUnits()
      .map((entry) => this.getUnitSpeedValue(entry.unit))
      .filter((speed) => speed > 0);

    return speeds.length > 0 ? Math.min(...speeds) : null;
  });

  protected readonly totalRecruitmentTimeMinutes = computed(() => {
    return this.selectedUnits().reduce((sum, entry) => {
      return sum + this.getUnitRecruitmentTimeValue(entry.unit) * entry.amount;
    }, 0);
  });

  protected readonly hasRecruitmentTimeData = computed(() => {
    return this.totalRecruitmentTimeMinutes() > 0;
  });

  protected selectConfiguration(configurationId: string): void {
    this.selectedConfigurationId.set(configurationId);
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

    const newConfiguration: TroopConfiguration = {
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
    const preset = troopConfigurationPresets.find(
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

  protected updateModifier(modifierId: TroopModifierId, checked: boolean): void {
    this.updateSelectedConfiguration({
      modifiers: {
        ...this.selectedConfiguration().modifiers,
        [modifierId]: checked,
      },
    });
  }

  protected updateUnitAmount(unitId: string, value: string | number): void {
    const parsedValue = Number(value);
    const safeAmount = Number.isFinite(parsedValue) ? parsedValue : 0;
    const amount = Math.max(Math.round(safeAmount), 0);

    this.updateSelectedConfiguration({
      unitAmounts: {
        ...this.selectedConfiguration().unitAmounts,
        [unitId]: amount,
      },
    });
  }

  protected stepUnitAmount(unitId: string, delta: number): void {
    this.updateUnitAmount(unitId, this.getUnitAmount(unitId) + delta);
  }

  protected getUnitAmount(unitId: string): number {
    return this.selectedConfiguration().unitAmounts[unitId] ?? 0;
  }

  protected getUnitIconPath(unitId: string): string {
    const fileNameMap: Record<string, string> = {
      swordsman: 'swordsman.webp',
      slinger: 'slinger.webp',
      archer: 'archer.webp',
      hoplite: 'hoplite.webp',
      horseman: 'horseman.webp',
      chariot: 'chariot.webp',
      catapult: 'catapult.webp',
      divine_envoy: 'divineEnvoy.webp',
      divineEnvoy: 'divineEnvoy.webp',
      minotaur: 'minotaur.webp',
      manticore: 'manticore.webp',
      cyclop: 'cyclop.webp',
      hydra: 'hydra.webp',
      harpy: 'harpy.webp',
      medusa: 'medusa.webp',
      centaur: 'centaur.webp',
      pegasus: 'pegasus.webp',
      cerberus: 'cerberus.webp',
      erinys: 'erinys.webp',
      griffin: 'griffin.webp',
      calydonian_boar: 'calydonianBoar.webp',
      calydonianBoar: 'calydonianBoar.webp',
      siren: 'siren.webp',
      satyr: 'satyr.webp',
      ladon: 'ladon.webp',
      spartoi: 'spartoi.webp',
      transport_boat: 'transportBoat.webp',
      transportBoat: 'transportBoat.webp',
      bireme: 'bireme.webp',
      light_ship: 'lightShip.webp',
      lightShip: 'lightShip.webp',
      fire_ship: 'fireShip.webp',
      fireShip: 'fireShip.webp',
      fast_transport_ship: 'fastTransportShip.webp',
      fastTransportShip: 'fastTransportShip.webp',
      trireme: 'trireme.webp',
      colony_ship: 'colonyShip.webp',
      colonyShip: 'colonyShip.webp',
    };

    const fileName = fileNameMap[unitId];

    return fileName ? `/assets/images/units/${fileName}` : '';
  }

  protected getResourceIconPath(resource: keyof Unit['cost'] | 'buildtime'): string {
    return `/assets/images/resources/${resource}.png`;
  }

  protected getBattleIconPath(icon: string): string {
    const fileNameMap: Record<string, string> = {
      attackSea: 'attackSea.webp',
      attackBlunt: 'blunt.webp',
      attackSharp: 'sharp.png',
      attackDistance: 'distance.png',
      booty: 'booty.webp',
      capacity: 'capacity.webp',
      defenseBlunt: 'defenseBlunt.webp',
      defenseDistance: 'defenseDistance.webp',
      defenseSea: 'defenseSea.webp',
      defenseSharp: 'defenseSharp.webp',
      speed: 'speed.webp',
    };

    const fileName = fileNameMap[icon];

    return fileName ? `/assets/images/battle/${fileName}` : '';
  }

  protected getAttackIconPath(attackType: AttackType): string {
    if (attackType === 'naval') {
      return this.getBattleIconPath('attackSea');
    }

    if (attackType === 'sharp') {
      return this.getBattleIconPath('attackSharp');
    }

    if (attackType === 'distance') {
      return this.getBattleIconPath('attackDistance');
    }

    return this.getBattleIconPath('attackBlunt');
  }

  protected getDisplayedAttackIconPath(unit: Unit, isSea: boolean): string {
    return isSea ? this.getBattleIconPath('attackSea') : this.getAttackIconPath(unit.attackType);
  }

  protected getDisplayedAttackValue(unit: Unit, isSea: boolean): number {
    return isSea ? this.getUnitSeaAttackValue(unit) : unit.attack;
  }

  protected getAttackTitleKey(unit: Unit, isSea: boolean): string {
    if (isSea || unit.attackType === 'naval') {
      return 'unitAttribute.attackSea';
    }

    if (unit.attackType === 'sharp') {
      return 'unitAttribute.attackSharp';
    }

    if (unit.attackType === 'distance') {
      return 'unitAttribute.attackDistance';
    }

    return 'unitAttribute.attackBlunt';
  }

  protected formatDuration(totalMinutes: number): string {
    const totalSeconds = Math.max(Math.round(totalMinutes * 60), 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    const pad = (value: number) => value.toString().padStart(2, '0');

    if (days > 0) {
      return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    return `${pad(totalHours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  private getUnitSeaAttackValue(unit: Unit): number {
    return unit.attackSea || unit.attack;
  }

  private getUnitSpeedValue(unit: Unit): number {
    const speed = (unit as Unit & { speed?: number | null }).speed;

    return typeof speed === 'number' && Number.isFinite(speed) ? speed : 0;
  }

  private getUnitRecruitmentTimeValue(unit: Unit): number {
    const recruitmentTimeMinutes = (unit as Unit & {
      recruitmentTimeMinutes?: number | null;
    }).recruitmentTimeMinutes;

    return typeof recruitmentTimeMinutes === 'number' &&
      Number.isFinite(recruitmentTimeMinutes)
      ? recruitmentTimeMinutes
      : 0;
  }

  private updateSelectedConfiguration(partialConfiguration: Partial<TroopConfiguration>): void {
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

  private createNormalizedConfiguration(
    rawConfiguration: Partial<TroopConfiguration>,
  ): TroopConfiguration {
    const rawUnitAmounts = rawConfiguration.unitAmounts ?? {};
    const rawModifiers = rawConfiguration.modifiers as
      | Partial<Record<string, boolean>>
      | undefined;

    return {
      id: rawConfiguration.id ?? `custom-${Date.now()}`,
      name: rawConfiguration.name ?? 'Configuration',
      isPreset: rawConfiguration.isPreset ?? false,
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

  private loadConfigurations(): TroopConfiguration[] {
    const storedConfigurations = localStorage.getItem(this.storageKey);

    if (!storedConfigurations) {
      return structuredClone(troopConfigurationPresets);
    }

    try {
      const parsedConfigurations = JSON.parse(storedConfigurations) as Partial<TroopConfiguration>[];

      if (!Array.isArray(parsedConfigurations) || parsedConfigurations.length === 0) {
        return structuredClone(troopConfigurationPresets);
      }

      return parsedConfigurations.map((configuration) =>
        this.createNormalizedConfiguration(configuration),
      );
    } catch {
      return structuredClone(troopConfigurationPresets);
    }
  }

  protected isTransportShip(unit: Unit): boolean {
    return unit.id === 'transport_boat' || unit.id === 'fast_transport_ship';
  }

}