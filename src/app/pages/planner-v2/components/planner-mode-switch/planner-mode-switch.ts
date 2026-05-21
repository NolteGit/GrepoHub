import { Component, input, output } from '@angular/core';

export type PlannerMode = 'city' | 'troops';

type PlannerModeOption = {
  readonly id: PlannerMode;
  readonly title: string;
  readonly icon: string;
};

@Component({
  selector: 'app-planner-mode-switch',
  templateUrl: './planner-mode-switch.html',
  styleUrl: './planner-mode-switch.scss',
})
export class PlannerModeSwitch {
  readonly activeMode = input.required<PlannerMode>();
  readonly modeSelected = output<PlannerMode>();

  protected readonly ariaLabel = 'Planner mode';
  protected readonly options: readonly PlannerModeOption[] = [
    { id: 'city', title: 'City Setup', icon: '▣' },
    { id: 'troops', title: 'Troop Setup', icon: '⚔' },
  ];

  protected selectMode(mode: PlannerMode): void {
    this.modeSelected.emit(mode);
  }
}
