import { Component, computed, input } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhIconButton } from '../../../../shared/ui/gh-icon-button/gh-icon-button';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';
import { GhStatRow } from '../../../../shared/ui/gh-stat-row/gh-stat-row';

import { PlannerMode } from '../planner-mode-switch/planner-mode-switch';

type TranslatableText = {
  readonly labelKey: string;
  readonly fallback: string;
};

type SidebarStat = TranslatableText & {
  readonly value: string;
};

type PreviewStat = TranslatableText & {
  readonly value: string;
};

@Component({
  selector: 'app-planner-summary-sidebar',
  imports: [TranslatePipe, GhIconButton, GhPanel, GhStatRow],
  templateUrl: './planner-summary-sidebar.html',
})
export class PlannerSummarySidebar {
  readonly activeMode = input.required<PlannerMode>();
  readonly activePlanName = input.required<string>();
  readonly buildingCount = input.required<number>();
  readonly usedUnitCount = input.required<number>();

  protected readonly populationTitleKey = 'plannerV2.summary.populationTitle';
  protected readonly populationTitleFallback = 'Shared Population Summary';
  protected readonly infoLabelKey = 'plannerV2.summary.infoLabel';
  protected readonly infoLabelFallback = 'More information';
  protected readonly capacityLabelKey = 'plannerV2.summary.currentMaxCapacity';
  protected readonly capacityLabelFallback = 'Current / Max Capacity';
  protected readonly usedUnitsPreview: readonly PreviewStat[] = [
    { labelKey: 'unit.swordsman', fallback: 'Swordsman', value: '7,420' },
    { labelKey: 'unit.archer', fallback: 'Archer', value: '5,210' },
    { labelKey: 'unit.hoplite', fallback: 'Hoplite', value: '3,860' },
    { labelKey: 'unit.catapult', fallback: 'Catapult', value: '2,150' },
    { labelKey: 'unit.horseman', fallback: 'Horseman', value: '1,980' },
  ];
  protected readonly contextTitle = computed<TranslatableText>(() =>
    this.activeMode() === 'city'
      ? {
          labelKey: 'plannerV2.summary.context.mostUsedUnits',
          fallback: 'Most Used Units',
        }
      : {
          labelKey: 'plannerV2.summary.context.boatCapacity',
          fallback: 'Boat Carrying Capacity',
        },
  );
  protected readonly populationStats = computed<readonly SidebarStat[]>(() => [
    {
      labelKey: 'plannerV2.summary.activePlan',
      fallback: 'Active plan',
      value: this.activePlanName(),
    },
    {
      labelKey: 'plannerV2.summary.buildingEntries',
      fallback: 'Building entries',
      value: String(this.buildingCount()),
    },
    {
      labelKey: 'plannerV2.summary.usedUnits',
      fallback: 'Used units',
      value: String(this.usedUnitCount()),
    },
    { labelKey: 'plannerV2.summary.freeBhp', fallback: 'Free BHP', value: '0' },
  ]);
}
