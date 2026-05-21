import { Component, computed, input } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhIconButton } from '../../../../shared/ui/gh-icon-button/gh-icon-button';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';
import { GhStatRow } from '../../../../shared/ui/gh-stat-row/gh-stat-row';

import { PlannerMode } from '../planner-mode-switch/planner-mode-switch';

import type {
  SidebarPopulationStats,
  SidebarPreviewStat,
  SidebarTroopTransportStats,
  SidebarUsedUnit,
  TranslatableText,
} from '../../planner-v2.models';

type SidebarStat = TranslatableText & {
  readonly value: string | number;
};

@Component({
  selector: 'app-planner-summary-sidebar',
  imports: [TranslatePipe, GhIconButton, GhPanel, GhStatRow],
  templateUrl: './planner-summary-sidebar.html',
})
export class PlannerSummarySidebar {
  readonly activeMode = input.required<PlannerMode>();
  readonly population = input.required<SidebarPopulationStats>();
  readonly usedUnitCount = input.required<number>();
  readonly cityPreviewStats = input.required<readonly SidebarPreviewStat[]>();
  readonly topUsedUnits = input.required<readonly SidebarUsedUnit[]>();
  readonly troopTransport = input.required<SidebarTroopTransportStats>();

  protected readonly populationTitleKey = 'plannerV2.summary.populationTitle';
  protected readonly populationTitleFallback = 'Shared Population Summary';
  protected readonly infoLabelKey = 'plannerV2.summary.infoLabel';
  protected readonly infoLabelFallback = 'More information';
  protected readonly capacityLabelKey = 'plannerV2.summary.currentMaxCapacity';
  protected readonly capacityLabelFallback = 'Current / Max Capacity';
  protected readonly contextTitle = computed<TranslatableText>(() =>
    this.activeMode() === 'city'
      ? {
          labelKey: 'plannerV2.summary.context.cityPreview',
          fallback: 'City Plan Preview',
        }
      : {
          labelKey: 'plannerV2.summary.context.troopPreview',
          fallback: 'Troop Plan Preview',
        },
  );
  protected readonly populationStats = computed<readonly SidebarStat[]>(() => {
    const sharedStats: SidebarStat[] = [
      {
        labelKey: 'plannerV2.summary.activePlan',
        fallback: 'Active plan',
        value: this.population().activePlanName,
      },
      {
        labelKey: 'plannerV2.summary.populationCapacity',
        fallback: 'Population capacity',
        value: this.population().populationCapacity,
      },
    ];

    if (this.activeMode() === 'troops') {
      return [
        ...sharedStats,
        {
          labelKey: 'plannerV2.summary.usedByBuildings',
          fallback: 'Used by buildings',
          value: this.population().usedPopulation,
        },
        {
          labelKey: 'plannerV2.summary.usedByTroops',
          fallback: 'Used by troops',
          value: this.population().troopPopulation,
        },
        {
          labelKey: 'plannerV2.summary.freePopulationAfterTroops',
          fallback: 'Free population',
          value: this.population().freePopulationAfterTroops,
        },
        {
          labelKey: 'plannerV2.summary.usedUnits',
          fallback: 'Used units',
          value: this.usedUnitCount(),
        },
      ];
    }

    return [
      ...sharedStats,
      {
        labelKey: 'plannerV2.summary.usedPopulation',
        fallback: 'Used population',
        value: this.population().usedPopulation,
      },
      {
        labelKey: 'plannerV2.summary.freeBhp',
        fallback: 'Free BHP',
        value: this.population().freeBhp,
      },
      {
        labelKey: 'plannerV2.summary.buildingLevels',
        fallback: 'Building levels',
        value: this.population().usedBuildingLevels,
      },
      {
        labelKey: 'plannerV2.summary.activeModifiers',
        fallback: 'Active modifiers',
        value: this.population().activeModifierCount,
      },
    ];
  });
  protected readonly transportRows = computed<readonly SidebarStat[]>(() => [
    {
      labelKey: 'plannerV2.summary.transportSpace',
      fallback: 'Transport space',
      value: this.troopTransport().transportSpace,
    },
    {
      labelKey: 'plannerV2.summary.transportCapacity',
      fallback: 'Transport capacity',
      value: this.troopTransport().transportCapacity,
    },
    {
      labelKey: 'plannerV2.summary.transportBalance',
      fallback: 'Transport balance',
      value: this.troopTransport().transportBalance,
    },
    {
      labelKey: 'plannerV2.summary.bunksBonus',
      fallback: 'Bunks bonus',
      value: this.troopTransport().bunksBonus,
    },
  ]);
}
