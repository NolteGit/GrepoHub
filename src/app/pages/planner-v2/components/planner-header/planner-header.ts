import { Component, input, output } from '@angular/core';

import { PlanConfig } from '../../../../models/plan-config.model';

type HeaderAction = {
  readonly label: string;
  readonly icon: string;
  readonly variant?: 'primary';
};

@Component({
  selector: 'app-planner-header',
  templateUrl: './planner-header.html',
  styleUrl: './planner-header.scss',
})
export class PlannerHeader {
  readonly title = input.required<string>();
  readonly plans = input.required<readonly PlanConfig[]>();
  readonly activePlanId = input.required<string>();
  readonly activePlanName = input.required<string>();
  readonly planSelected = output<string>();

  protected readonly subtitle =
    'Plan your city and troops together. Optimize for power, efficiency, and victory.';
  protected readonly planLabel = 'Plan';
  protected readonly actions: readonly HeaderAction[] = [
    { label: 'New plan', icon: '+', variant: 'primary' },
    { label: 'Export', icon: '⇩' },
    { label: 'More', icon: '⌄' },
  ];

  protected selectPlan(event: Event): void {
    this.planSelected.emit((event.target as HTMLSelectElement).value);
  }
}
