import { Injectable, inject, signal } from '@angular/core';

import {
  cityBuildingPlanDefinitions,
  cityModifierDefinitions,
  citySpecialBuildingOptionDefinitions,
} from '../data/city-planner-presets';
import {
  CityConfiguration,
  CityModifierId,
  CitySpecialBuildingOptionId,
} from '../models/city-configuration.model';
import { PlanConfig } from '../models/plan-config.model';
import { Unit } from '../models/unit.model';
import { calculateCityPlannerPopulation } from './city-planner-population';
import { GameDataService } from './game-data.service';
import { PlanConfigService } from './plan-config.service';
import { TranslationService } from './translation.service';

type CsvRow = Record<string, string | number>;

@Injectable({
  providedIn: 'root',
})
export class PlanReadableExportService {
  private readonly gameDataService = inject(GameDataService);
  private readonly planConfigService = inject(PlanConfigService);
  private readonly translationService = inject(TranslationService);

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

  private readonly unitDefinitions = signal<Unit[]>([]);

  constructor() {
    this.gameDataService.getUnitDefinitions().subscribe((units) => {
      this.unitDefinitions.set(units);
    });
  }

  exportActivePlanAsTxt(): void {
    const exportedAt = new Date();
    this.runWithUnitDefinitions(() => {
      const activePlan = this.planConfigService.activePlan();
      const fileName = this.getReadableExportFileName(activePlan.name, exportedAt, 'txt');

      this.downloadTextFile(fileName, this.buildTextReport(activePlan, exportedAt), 'text/plain');
    });
  }

  exportActivePlanAsCsv(): void {
    const exportedAt = new Date();
    this.runWithUnitDefinitions(() => {
      const activePlan = this.planConfigService.activePlan();
      const fileName = this.getReadableExportFileName(activePlan.name, exportedAt, 'csv');
      const columns = [
        'Section',
        'Building',
        'Building Level',
        'Modifier',
        'Unit',
        'Unit Amount',
        'Space',
        'Population',
        'Wood',
        'Stone',
        'Silver',
        'Favor',
        'Value',
      ];

      this.downloadTextFile(
        fileName,
        '\uFEFF' + this.toCsv(this.buildCsvRows(activePlan), columns),
        'text/csv',
      );
    });
  }

  private runWithUnitDefinitions(action: () => void): void {
    if (this.unitDefinitions().length > 0) {
      action();
      return;
    }

    this.gameDataService.getUnitDefinitions().subscribe((units) => {
      this.unitDefinitions.set(units);
      action();
    });
  }

  private buildTextReport(plan: PlanConfig, exportedAt: Date): string {
    const buildingRows = this.getBuildingRows(plan.cityPlan);
    const modifierRows = this.getCityModifierRows(plan.cityPlan);
    const specialBuildingRows = this.getSpecialBuildingRows(plan.cityPlan);
    const citySummaryRows = this.getCitySummaryRows(plan.cityPlan);
    const unitRows = this.getSelectedUnitRows(plan);
    const troopModifierRows = this.getTroopModifierRows(plan);
    const troopSummaryRows = this.getTroopSummaryRows(plan);

    return [
      'Grepo Hub Export',
      'Config: ' + plan.name,
      'Date: ' + this.formatDisplayDate(exportedAt),
      '',
      'City Planner',
      '============',
      '',
      'Buildings',
      ...buildingRows.map(
        (row) =>
          '- ' +
          row.name +
          ': Level ' +
          row.level +
          ', Population ' +
          this.formatSigned(row.population),
      ),
      '',
      'Modifiers',
      ...modifierRows.map(
        (row) =>
          '- ' + row.name + ': ' + row.value + ', Population ' + this.formatSigned(row.population),
      ),
      '',
      'Special Buildings',
      ...specialBuildingRows.map(
        (row) =>
          '- ' + row.slot + ': ' + row.name + ', Population ' + this.formatSigned(row.population),
      ),
      '',
      'City Summary',
      ...citySummaryRows.map((row) => '- ' + row.name + ': ' + this.formatNumber(row.value)),
      '',
      'Troops Planner',
      '==============',
      '',
      'Units',
      ...this.getTextUnitLines(unitRows),
      '',
      'Troop Modifiers',
      ...troopModifierRows.map((row) => '- ' + row.name + ': ' + row.value),
      '',
      'Troops Summary',
      ...troopSummaryRows.map((row) => '- ' + row.name + ': ' + this.formatNumber(row.value)),
    ].join('\n');
  }

  private buildCsvRows(plan: PlanConfig): CsvRow[] {
    const buildingRows = this.getBuildingRows(plan.cityPlan).map((row) => ({
      Section: 'Building',
      Building: row.name,
      'Building Level': row.level,
      Population: row.population,
    }));
    const modifierRows = this.getCityModifierRows(plan.cityPlan).map((row) => ({
      Section: 'City Modifier',
      Modifier: row.name,
      Population: row.population,
      Value: row.value,
    }));
    const specialBuildingRows = this.getSpecialBuildingRows(plan.cityPlan).map((row) => ({
      Section: 'Special Building',
      Building: row.name,
      Modifier: row.slot,
      Population: row.population,
      Value: row.optionId,
    }));
    const citySummaryRows = this.getCitySummaryRows(plan.cityPlan).map((row) => ({
      Section: 'City Summary',
      Modifier: row.name,
      Value: row.value,
    }));
    const unitRows = this.getSelectedUnitRows(plan).map((row) => ({
      Section: row.section,
      Unit: row.name,
      'Unit Amount': row.amount,
      Space: row.space,
      Population: row.population,
      Wood: row.wood,
      Stone: row.stone,
      Silver: row.silver,
      Favor: row.favor,
    }));
    const troopModifierRows = this.getTroopModifierRows(plan).map((row) => ({
      Section: 'Troop Modifier',
      Modifier: row.name,
      Value: row.value,
    }));
    const troopSummaryRows = this.getTroopSummaryRows(plan).map((row) => ({
      Section: 'Troops Summary',
      Modifier: row.name,
      Value: row.value,
    }));

    return [
      ...buildingRows,
      ...modifierRows,
      ...specialBuildingRows,
      ...citySummaryRows,
      ...unitRows,
      ...troopModifierRows,
      ...troopSummaryRows,
    ];
  }

  private getBuildingRows(cityPlan: CityConfiguration): {
    readonly name: string;
    readonly level: number;
    readonly population: number;
  }[] {
    return cityBuildingPlanDefinitions
      .filter((building) => building.id !== 'land_expansion')
      .map((building) => {
        const level = this.getBuildingLevel(cityPlan, building.id);

        return {
          name: this.translate('building.' + building.id, this.toTitleCase(building.id)),
          level,
          population: this.getBuildingPopulation(building.id, level),
        };
      });
  }

  private getCityModifierRows(cityPlan: CityConfiguration): {
    readonly name: string;
    readonly value: string;
    readonly population: number;
  }[] {
    const modifierRows = cityModifierDefinitions.map((modifier) => ({
      name: this.translate('cityPlanner.modifier.' + modifier.id, this.toTitleCase(modifier.id)),
      value: this.formatBoolean(cityPlan.modifiers[modifier.id]),
      population: this.getDisplayedModifierPopulation(cityPlan, modifier.id),
    }));
    const landExpansionLevel = this.getBuildingLevel(cityPlan, 'land_expansion');

    return [
      ...modifierRows,
      {
        name: this.translate('building.land_expansion', 'Land Expansion'),
        value: 'Level ' + landExpansionLevel,
        population: this.getBuildingPopulation('land_expansion', landExpansionLevel),
      },
    ];
  }

  private getSpecialBuildingRows(cityPlan: CityConfiguration): {
    readonly slot: string;
    readonly name: string;
    readonly optionId: CitySpecialBuildingOptionId;
    readonly population: number;
  }[] {
    return Object.entries(cityPlan.specialBuildings).map(([slotId, optionId]) => ({
      slot: this.translate('cityPlanner.specialBuilding.' + slotId, this.toTitleCase(slotId)),
      name:
        optionId === 'none'
          ? this.translate('cityPlanner.none', 'None')
          : this.translate('building.' + optionId, this.toTitleCase(optionId)),
      optionId,
      population: this.getSpecialBuildingPopulation(optionId),
    }));
  }

  private getCitySummaryRows(cityPlan: CityConfiguration): {
    readonly name: string;
    readonly value: number;
  }[] {
    const population = calculateCityPlannerPopulation(cityPlan);

    return [
      {
        name: this.translate('cityPlanner.populationCapacity', 'Population capacity'),
        value: population.populationCapacity,
      },
      {
        name: this.translate('cityPlanner.usedPopulation', 'Used population'),
        value: population.usedPopulation,
      },
      {
        name: this.translate('cityPlanner.freePopulation', 'Free population'),
        value: population.freePopulation,
      },
    ];
  }

  private getSelectedUnitRows(plan: PlanConfig): {
    readonly section: string;
    readonly name: string;
    readonly amount: number;
    readonly space: number;
    readonly population: number;
    readonly wood: number;
    readonly stone: number;
    readonly silver: number;
    readonly favor: number;
  }[] {
    return this.unitDefinitions()
      .filter((unit) => unit.id !== 'militia')
      .map((unit) => ({
        unit,
        amount: plan.troopPlan.unitAmounts[unit.id] ?? 0,
      }))
      .filter((entry) => entry.amount > 0)
      .map((entry) => ({
        section: this.getUnitSectionLabel(entry.unit),
        name: this.translate(entry.unit.nameKey, this.toTitleCase(entry.unit.id)),
        amount: entry.amount,
        space: entry.unit.transportSpace * entry.amount,
        population: entry.unit.cost.population * entry.amount,
        wood: entry.unit.cost.wood * entry.amount,
        stone: entry.unit.cost.stone * entry.amount,
        silver: entry.unit.cost.silver * entry.amount,
        favor: entry.unit.cost.favor * entry.amount,
      }));
  }

  private getTroopModifierRows(plan: PlanConfig): {
    readonly name: string;
    readonly value: string;
  }[] {
    const bunksEnabled = plan.troopPlan.modifiers.bunks;
    const transportBonus = this.getTransportShipCount(plan) * 6;

    return [
      {
        name: this.translate('troopsPlanner.modifier.bunks', 'Bunks'),
        value: bunksEnabled
          ? this.formatBoolean(true) +
            ' (+' +
            this.formatNumber(transportBonus) +
            ' transport capacity)'
          : this.formatBoolean(false),
      },
    ];
  }

  private getTroopSummaryRows(plan: PlanConfig): {
    readonly name: string;
    readonly value: number;
  }[] {
    const totals = this.getTroopTotals(plan);

    return [
      {
        name: this.translate('troopsPlanner.totalUnits', 'Total units'),
        value: totals.totalUnits,
      },
      {
        name: this.translate('troopsPlanner.populationTotal', 'Total population'),
        value: totals.population,
      },
      {
        name: this.translate('troopsPlanner.populationLand', 'Land population'),
        value: totals.landPopulation,
      },
      {
        name: this.translate('troopsPlanner.populationSea', 'Sea population'),
        value: totals.seaPopulation,
      },
      {
        name: this.translate('troopsPlanner.transportCapacityShort', 'Transport capacity'),
        value: totals.transportCapacity,
      },
      {
        name: this.translate('troopsPlanner.transportUsedShort', 'Transport space'),
        value: totals.transportSpace,
      },
      {
        name: this.translate('troopsPlanner.transportBalanceShort', 'Transport balance'),
        value: totals.transportCapacity - totals.transportSpace,
      },
      {
        name: 'Wood',
        value: totals.wood,
      },
      {
        name: 'Stone',
        value: totals.stone,
      },
      {
        name: 'Silver',
        value: totals.silver,
      },
      {
        name: 'Favor',
        value: totals.favor,
      },
    ];
  }

  private getTextUnitLines(
    unitRows: readonly {
      readonly section: string;
      readonly name: string;
      readonly amount: number;
      readonly space: number;
      readonly population: number;
      readonly wood: number;
      readonly stone: number;
      readonly silver: number;
      readonly favor: number;
    }[],
  ): string[] {
    if (unitRows.length === 0) {
      return ['- No units selected'];
    }

    const sectionOrder = [
      this.translate('troopsPlanner.landUnits', 'Land units'),
      this.translate('troopsPlanner.seaUnits', 'Sea units'),
      this.translate('troopsPlanner.mythicalUnits', 'Mythical units'),
    ];

    return sectionOrder.flatMap((section) => {
      const sectionRows = unitRows.filter((row) => row.section === section);

      if (sectionRows.length === 0) {
        return [];
      }

      return [
        section,
        ...sectionRows.map(
          (row) =>
            '- ' +
            row.name +
            ': ' +
            this.formatNumber(row.amount) +
            ', Space ' +
            this.formatNumber(row.space) +
            ', Population ' +
            this.formatNumber(row.population) +
            ', Wood ' +
            this.formatNumber(row.wood) +
            ', Stone ' +
            this.formatNumber(row.stone) +
            ', Silver ' +
            this.formatNumber(row.silver) +
            (row.favor > 0 ? ', Favor ' + this.formatNumber(row.favor) : ''),
        ),
      ];
    });
  }

  private getTroopTotals(plan: PlanConfig): {
    readonly totalUnits: number;
    readonly wood: number;
    readonly stone: number;
    readonly silver: number;
    readonly favor: number;
    readonly population: number;
    readonly landPopulation: number;
    readonly seaPopulation: number;
    readonly transportCapacity: number;
    readonly transportSpace: number;
  } {
    const totals = this.unitDefinitions().reduce(
      (sum, unit) => {
        const amount = unit.id === 'militia' ? 0 : (plan.troopPlan.unitAmounts[unit.id] ?? 0);

        return {
          totalUnits: sum.totalUnits + amount,
          wood: sum.wood + unit.cost.wood * amount,
          stone: sum.stone + unit.cost.stone * amount,
          silver: sum.silver + unit.cost.silver * amount,
          favor: sum.favor + unit.cost.favor * amount,
          population: sum.population + unit.cost.population * amount,
          landPopulation:
            sum.landPopulation + (unit.type === 'land' ? unit.cost.population * amount : 0),
          seaPopulation:
            sum.seaPopulation + (unit.type === 'sea' ? unit.cost.population * amount : 0),
          transportCapacity: sum.transportCapacity + unit.transportCapacity * amount,
          transportSpace: sum.transportSpace + unit.transportSpace * amount,
        };
      },
      {
        totalUnits: 0,
        wood: 0,
        stone: 0,
        silver: 0,
        favor: 0,
        population: 0,
        landPopulation: 0,
        seaPopulation: 0,
        transportCapacity: 0,
        transportSpace: 0,
      },
    );

    return {
      ...totals,
      transportCapacity: totals.transportCapacity + this.getBunksCapacityBonus(plan),
    };
  }

  private getTransportShipCount(plan: PlanConfig): number {
    return (
      (plan.troopPlan.unitAmounts['transport_boat'] ?? 0) +
      (plan.troopPlan.unitAmounts['fast_transport_ship'] ?? 0)
    );
  }

  private getBunksCapacityBonus(plan: PlanConfig): number {
    return plan.troopPlan.modifiers.bunks ? this.getTransportShipCount(plan) * 6 : 0;
  }

  private getBuildingLevel(cityPlan: CityConfiguration, buildingId: string): number {
    const definition = cityBuildingPlanDefinitions.find((building) => building.id === buildingId);
    const configuredLevel = cityPlan.buildingLevels[buildingId] ?? 0;

    if (!definition) {
      return configuredLevel;
    }

    return Math.min(
      Math.max(configuredLevel, this.buildingMinLevels[buildingId] ?? 0),
      definition.maxLevel,
    );
  }

  private getBuildingPopulation(buildingId: string, level: number): number {
    const definition = cityBuildingPlanDefinitions.find((building) => building.id === buildingId);
    const population = definition?.populationByLevel[level] ?? 0;

    return Math.sign(population) * Math.round(Math.abs(population));
  }

  private getDisplayedModifierPopulation(
    cityPlan: CityConfiguration,
    modifierId: CityModifierId,
  ): number {
    const modifier = cityModifierDefinitions.find((definition) => definition.id === modifierId);

    if (!cityPlan.modifiers[modifierId]) {
      return 0;
    }

    if (modifierId === 'aphroditeActive') {
      return this.getBuildingLevel(cityPlan, 'farm') * 5;
    }

    return modifier?.populationDelta ?? 0;
  }

  private getSpecialBuildingPopulation(optionId: CitySpecialBuildingOptionId): number {
    const option = citySpecialBuildingOptionDefinitions.find(
      (definition) => definition.id === optionId,
    );

    return option?.populationDelta ?? 0;
  }
  private getUnitSectionLabel(unit: Unit): string {
    if (unit.isMythical) {
      return this.translate('troopsPlanner.mythicalUnits', 'Mythical units');
    }

    return unit.type === 'sea'
      ? this.translate('troopsPlanner.seaUnits', 'Sea units')
      : this.translate('troopsPlanner.landUnits', 'Land units');
  }

  private toCsv(rows: readonly CsvRow[], columns: readonly string[]): string {
    return [columns, ...rows.map((row) => columns.map((column) => row[column] ?? ''))]
      .map((row) => row.map((value) => this.escapeCsvValue(value)).join(';'))
      .join('\r\n');
  }

  private escapeCsvValue(value: string | number): string {
    const stringValue = String(value);

    if (!/[;"\r\n]/.test(stringValue)) {
      return stringValue;
    }

    return '"' + stringValue.replace(/"/g, '""') + '"';
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

  private getReadableExportFileName(
    planName: string,
    exportedAt: Date,
    extension: 'csv' | 'txt',
  ): string {
    return (
      'grepo-hub_' +
      this.sanitizeFileName(planName) +
      '_' +
      this.formatFileDate(exportedAt) +
      '.' +
      extension
    );
  }

  private sanitizeFileName(value: string): string {
    const sanitizedValue = value
      .trim()
      .replace(/[^a-z0-9._-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return sanitizedValue || 'grepo-plan';
  }

  private formatFileDate(value: Date): string {
    return (
      value.getFullYear() +
      '-' +
      this.pad(value.getMonth() + 1) +
      '-' +
      this.pad(value.getDate()) +
      '_' +
      this.pad(value.getHours()) +
      this.pad(value.getMinutes())
    );
  }

  private formatDisplayDate(value: Date): string {
    return (
      value.getFullYear() +
      '-' +
      this.pad(value.getMonth() + 1) +
      '-' +
      this.pad(value.getDate()) +
      ' ' +
      this.pad(value.getHours()) +
      ':' +
      this.pad(value.getMinutes())
    );
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private formatSigned(value: number): string {
    return value > 0 ? '+' + this.formatNumber(value) : this.formatNumber(value);
  }

  private formatNumber(value: number): string {
    return value.toLocaleString();
  }

  private formatBoolean(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  private translate(key: string, fallback: string): string {
    return this.translationService.translate(key, fallback);
  }

  private toTitleCase(value: string): string {
    return value
      .split(/[_\s-]+/)
      .filter((part) => part.length > 0)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
