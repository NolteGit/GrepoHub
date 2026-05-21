import { Component, input, output } from '@angular/core';

import { PlanConfig } from '../../../../models/plan-config.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

type HeaderAction = {
  readonly labelKey: string;
  readonly fallback: string;
  readonly icon: string;
  readonly variant?: 'primary';
};

@Component({
  selector: 'app-planner-header',
  imports: [TranslatePipe],
  templateUrl: './planner-header.html',
})
export class PlannerHeader {
  readonly title = input.required<string>();
  readonly plans = input.required<readonly PlanConfig[]>();
  readonly activePlanId = input.required<string>();
  readonly planSelected = output<string>();

  protected readonly subtitleKey = 'plannerV2.header.subtitle';
  protected readonly subtitleFallback =
    'Plan your city and troops together. Optimize for power, efficiency, and victory.';
  protected readonly planLabelKey = 'plannerV2.header.planLabel';
  protected readonly planLabelFallback = 'Plan';
  protected readonly actions: readonly HeaderAction[] = [
    {
      labelKey: 'plannerV2.header.newPlan',
      fallback: 'New plan',
      icon: '+',
      variant: 'primary',
    },
    { labelKey: 'plannerV2.header.export', fallback: 'Export', icon: '⇩' },
    { labelKey: 'plannerV2.header.more', fallback: 'More', icon: '⌄' },
  ];

  protected selectPlan(event: Event): void {
    this.planSelected.emit((event.target as HTMLSelectElement).value);
  }
}
