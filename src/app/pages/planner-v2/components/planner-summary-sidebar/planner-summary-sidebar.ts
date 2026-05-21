import { Component, computed, input } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

import { PlannerMode } from '../planner-mode-switch/planner-mode-switch';

type SidebarStat = {
  readonly label: string;
  readonly value: string;
};

type PreviewStat = {
  readonly label: string;
  readonly value: string;
};

@Component({
  selector: 'app-planner-summary-sidebar',
  imports: [TranslatePipe],
  templateUrl: './planner-summary-sidebar.html',
  styleUrl: './planner-summary-sidebar.scss',
})
export class PlannerSummarySidebar {
  readonly activeMode = input.required<PlannerMode>();
  readonly activePlanName = input.required<string>();
  readonly buildingCount = input.required<number>();
  readonly usedUnitCount = input.required<number>();

  protected readonly populationTitle = 'Shared Population Summary';
  protected readonly infoLabel = 'More information';
  protected readonly capacityLabel = 'Current / Max Capacity';
  protected readonly usedUnitsPreview: readonly PreviewStat[] = [
    { label: 'Swordsman', value: '7,420' },
    { label: 'Archer', value: '5,210' },
    { label: 'Hoplite', value: '3,860' },
    { label: 'Catapult', value: '2,150' },
    { label: 'Horseman', value: '1,980' },
  ];
  protected readonly contextTitle = computed(() =>
    this.activeMode() === 'city' ? 'Most Used Units' : 'Boat Carrying Capacity',
  );
  protected readonly populationStats = computed<readonly SidebarStat[]>(() => [
    { label: 'Active plan', value: this.activePlanName() },
    { label: 'Building entries', value: String(this.buildingCount()) },
    { label: 'Used units', value: String(this.usedUnitCount()) },
    { label: 'Free BHP', value: '0' },
  ]);
}
