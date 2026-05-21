import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

export type PlannerMode = 'city' | 'troops';

type PlannerModeOption = {
  readonly id: PlannerMode;
  readonly labelKey: string;
  readonly fallback: string;
  readonly icon: string;
};

@Component({
  selector: 'app-planner-mode-switch',
  imports: [TranslatePipe],
  templateUrl: './planner-mode-switch.html',
  styleUrl: './planner-mode-switch.scss',
})
export class PlannerModeSwitch {
  readonly activeMode = input.required<PlannerMode>();
  readonly modeSelected = output<PlannerMode>();

  protected readonly ariaLabelKey = 'plannerV2.mode.ariaLabel';
  protected readonly ariaLabelFallback = 'Planner mode';
  protected readonly options: readonly PlannerModeOption[] = [
    { id: 'city', labelKey: 'plannerV2.mode.city', fallback: 'City Setup', icon: '▣' },
    { id: 'troops', labelKey: 'plannerV2.mode.troops', fallback: 'Troop Setup', icon: '⚔' },
  ];

  protected selectMode(mode: PlannerMode): void {
    this.modeSelected.emit(mode);
  }
}
