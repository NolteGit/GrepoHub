import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { TroopConfiguration, TroopModifierId } from '../../models/troop-configuration.model';
import { AttackType, Unit } from '../../models/unit.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { GameDataService } from '../../services/game-data.service';
import { PlanConfigService } from '../../services/plan-config.service';
import { PlanFileTransferService } from '../../services/plan-file-transfer.service';
import { PlanReadableExportService } from '../../services/plan-readable-export.service';
import { AppIconComponent } from '../../shared/app-icon/app-icon';

type TroopUnitSectionId = 'land' | 'sea' | 'mythical';

@Component({
  selector: 'app-troops-planner',
  imports: [FormsModule, NgTemplateOutlet, TranslatePipe, AppIconComponent],
  templateUrl: './troops-planner.html',
  styleUrl: './troops-planner.scss',
})
export class TroopsPlanner {
  protected readonly planImportDialog = signal<{
    readonly isError: boolean;
    readonly detailLines: readonly string[];
  } | null>(null);

  protected readonly clearPlanDialogOpen = signal(false);
  protected readonly exportMenuOpen = signal(false);
  protected readonly configurationMenuOpen = signal(false);

  private readonly maxUnitAmount = 10000;
  private unitAmountOptionsCloseTimer: ReturnType<typeof setTimeout> | null = null;
  protected readonly openUnitAmountOptionsId = signal<string | null>(null);
  private readonly unitAmountOptions: readonly number[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600,
    700, 800, 900, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
  ];

  protected readonly collapsedUnitSections = signal<Record<TroopUnitSectionId, boolean>>({
    land: false,
    sea: false,
    mythical: false,
  });

  private readonly gameDataService = inject(GameDataService);
  private readonly planConfigService = inject(PlanConfigService);
  private readonly planReadableExportService = inject(PlanReadableExportService);
  private readonly planFileTransferService = inject(PlanFileTransferService);
  protected readonly canDeleteActivePlan = this.planConfigService.canDeleteActivePlan;
  protected readonly activePlanName = computed(() => this.planConfigService.activePlan().name);
  protected readonly deletePlanDialogOpen = signal(false);
  protected readonly planDeleteResultDialog = signal<{
    readonly isError: boolean;
    readonly detailLines: readonly string[];
  } | null>(null);

  protected readonly units = toSignal(this.gameDataService.getUnitDefinitions(), {
    initialValue: [] as Unit[],
  });

  protected readonly configurations = computed(() => this.planConfigService.plans());
  protected readonly selectedConfigurationId = this.planConfigService.activePlanId;

  protected readonly selectedConfiguration = computed<TroopConfiguration>(() => {
    return this.planConfigService.activePlan().troopPlan;
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
        transportCapacity: sum.transportCapacity + entry.unit.transportCapacity * entry.amount,
        transportSpace: sum.transportSpace + entry.unit.transportSpace * entry.amount,
        attack: sum.attack + entry.unit.attack * entry.amount,
        attackSea: sum.attackSea + this.getUnitSeaAttackValue(entry.unit) * entry.amount,
        defenseBlunt: sum.defenseBlunt + entry.unit.defenseBlunt * entry.amount,
        defenseSharp: sum.defenseSharp + entry.unit.defenseSharp * entry.amount,
        defenseDistance: sum.defenseDistance + entry.unit.defenseDistance * entry.amount,
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

  protected isUnitSectionCollapsed(sectionId: TroopUnitSectionId): boolean {
    return this.collapsedUnitSections()[sectionId];
  }

  protected toggleUnitSection(sectionId: TroopUnitSectionId): void {
    this.collapsedUnitSections.update((sections) => ({
      ...sections,
      [sectionId]: !sections[sectionId],
    }));
  }

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
    this.planFileTransferService.exportActivePlanAsJson();
  }
  protected async importPlanFromJsonFile(event: Event): Promise<void> {
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
    this.planConfigService.clearActiveTroopPlan();
  }

  protected resetSelectedConfiguration(): void {
    this.planConfigService.resetActiveTroopPlan();
  }

  protected updateModifier(modifierId: TroopModifierId, checked: boolean): void {
    this.updateSelectedConfiguration({
      modifiers: {
        ...this.selectedConfiguration().modifiers,
        [modifierId]: checked,
      },
    });
  }

  protected getUnitAmountOptions(unitId: string): readonly number[] {
    const amount = this.getUnitAmount(unitId);

    if (this.unitAmountOptions.includes(amount)) {
      return this.unitAmountOptions;
    }

    if (!Number.isFinite(amount) || amount < 0 || amount > this.maxUnitAmount) {
      return this.unitAmountOptions;
    }

    return [...this.unitAmountOptions, amount].sort((left, right) => left - right);
  }

  protected openUnitAmountOptions(unitId: string): void {
    this.clearUnitAmountOptionsCloseTimer();
    this.openUnitAmountOptionsId.set(unitId);
  }

  protected toggleUnitAmountOptions(unitId: string): void {
    this.clearUnitAmountOptionsCloseTimer();
    this.openUnitAmountOptionsId.update((activeUnitId) =>
      activeUnitId === unitId ? null : unitId,
    );
  }

  protected closeUnitAmountOptions(): void {
    this.clearUnitAmountOptionsCloseTimer();
    this.openUnitAmountOptionsId.set(null);
  }

  protected closeUnitAmountOptionsSoon(): void {
    this.clearUnitAmountOptionsCloseTimer();
    this.unitAmountOptionsCloseTimer = setTimeout(
      () => this.openUnitAmountOptionsId.set(null),
      120,
    );
  }

  protected selectUnitAmountOption(unitId: string, amount: number): void {
    this.setUnitAmount(unitId, amount);
    this.closeUnitAmountOptions();
  }

  protected updateUnitAmount(unitId: string, value: string | number): void {
    this.setUnitAmount(unitId, this.parseUnitAmount(value));
  }

  protected stepUnitAmount(unitId: string, delta: number): void {
    const direction = Math.sign(delta);

    if (direction === 0) {
      return;
    }

    this.setUnitAmount(unitId, this.getUnitAmount(unitId) + direction);
  }

  private clearUnitAmountOptionsCloseTimer(): void {
    if (!this.unitAmountOptionsCloseTimer) {
      return;
    }

    clearTimeout(this.unitAmountOptionsCloseTimer);
    this.unitAmountOptionsCloseTimer = null;
  }

  private parseUnitAmount(value: string | number): number {
    const parsedValue = Number(value);
    const safeAmount = Number.isFinite(parsedValue) ? parsedValue : 0;

    return Math.trunc(safeAmount);
  }

  private setUnitAmount(unitId: string, value: number): void {
    const amount = Math.min(Math.max(value, 0), this.maxUnitAmount);

    this.updateSelectedConfiguration({
      unitAmounts: {
        ...this.selectedConfiguration().unitAmounts,
        [unitId]: amount,
      },
    });
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
    const recruitmentTimeMinutes = (
      unit as Unit & {
        recruitmentTimeMinutes?: number | null;
      }
    ).recruitmentTimeMinutes;

    return typeof recruitmentTimeMinutes === 'number' && Number.isFinite(recruitmentTimeMinutes)
      ? recruitmentTimeMinutes
      : 0;
  }

  private updateSelectedConfiguration(partialConfiguration: Partial<TroopConfiguration>): void {
    this.planConfigService.updateActiveTroopPlan(partialConfiguration);
  }

  protected isTransportShip(unit: Unit): boolean {
    return unit.id === 'transport_boat' || unit.id === 'fast_transport_ship';
  }
}
