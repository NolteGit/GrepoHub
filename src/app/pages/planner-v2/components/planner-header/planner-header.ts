import { Component, computed, input, output } from '@angular/core';

import { PlanConfig } from '../../../../models/plan-config.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhButton } from '../../../../shared/ui/gh-button/gh-button';
import {
  GhSelectField,
  type GhSelectOption,
} from '../../../../shared/ui/gh-select-field/gh-select-field';

export type PlannerHeaderActionId = 'new' | 'import' | 'export' | 'delete';

type HeaderAction = {
  readonly id: PlannerHeaderActionId;
  readonly labelKey: string;
  readonly fallback: string;
  readonly icon: string;
  readonly variant?: 'primary';
  readonly disabled?: boolean;
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
  readonly canDeletePlan = input(true);
  readonly planSelected = output<string>();
  readonly actionSelected = output<PlannerHeaderActionId>();

  protected readonly subtitleKey = 'plannerV2.header.subtitle';
  protected readonly subtitleFallback =
    'Plan your city and troops together. Optimize for power, efficiency, and victory.';
  protected readonly planLabelKey = 'plannerV2.header.planLabel';
  protected readonly planLabelFallback = 'Plan';
  protected readonly planOptions = computed<readonly GhSelectOption[]>(() =>
    this.plans().map((plan) => ({ value: plan.id, label: plan.name })),
  );
  protected readonly actions = computed<readonly HeaderAction[]>(() => [
    {
      id: 'new',
      labelKey: 'plannerV2.header.newPlan',
      fallback: 'New plan',
      icon: '+',
      variant: 'primary',
    },
    { id: 'import', labelKey: 'plannerV2.header.import', fallback: 'Import', icon: '⇧' },
    { id: 'export', labelKey: 'plannerV2.header.export', fallback: 'Export', icon: '⇩' },
    {
      id: 'delete',
      labelKey: 'plannerV2.header.delete',
      fallback: 'Delete',
      icon: '×',
      disabled: !this.canDeletePlan(),
    },
  ]);
}
