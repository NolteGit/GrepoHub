import { Component, computed, input, output } from '@angular/core';

import { PlanConfig } from '../../../../models/plan-config.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhButton } from '../../../../shared/ui/gh-button/gh-button';
import {
  GhSelectField,
  type GhSelectOption,
} from '../../../../shared/ui/gh-select-field/gh-select-field';

type HeaderAction = {
  readonly labelKey: string;
  readonly fallback: string;
  readonly icon: string;
  readonly variant?: 'primary';
};

@Component({
  selector: 'app-planner-header',
  imports: [TranslatePipe, GhButton, GhSelectField],
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
  protected readonly planOptions = computed<readonly GhSelectOption[]>(() =>
    this.plans().map((plan) => ({ value: plan.id, label: plan.name })),
  );
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
}
