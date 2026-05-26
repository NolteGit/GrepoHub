import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

export type PlannerMode = 'city' | 'troops';

export type PlannerDetailsToggle = {
  readonly mode: PlannerMode;
  readonly visible: boolean;
};

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
})
export class PlannerModeSwitch {
  readonly activeMode = input.required<PlannerMode>();
  readonly cityDetailsVisible = input(false);
  readonly troopDetailsVisible = input(false);
  readonly modeSelected = output<PlannerMode>();
  readonly detailsToggled = output<PlannerDetailsToggle>();

  protected readonly ariaLabelKey = 'plannerV2.mode.ariaLabel';
  protected readonly ariaLabelFallback = 'Planner mode';
  protected readonly options: readonly PlannerModeOption[] = [
    { id: 'city', labelKey: 'plannerV2.mode.city', fallback: 'City Setup', icon: '▣' },
    { id: 'troops', labelKey: 'plannerV2.mode.troops', fallback: 'Troop Setup', icon: '⚔' },
  ];

  protected selectMode(mode: PlannerMode): void {
    this.modeSelected.emit(mode);
  }

  protected detailsVisibleForMode(mode: PlannerMode): boolean {
    return mode === 'city' ? this.cityDetailsVisible() : this.troopDetailsVisible();
  }

  protected toggleDetails(mode: PlannerMode, event: Event): void {
    event.stopPropagation();
    this.detailsToggled.emit({ mode, visible: !this.detailsVisibleForMode(mode) });
  }
}
