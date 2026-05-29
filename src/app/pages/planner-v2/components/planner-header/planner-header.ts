import { Component, computed, input, output } from '@angular/core';

import { PlanConfig } from '../../../../models/plan-config.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhButton } from '../../../../shared/ui/gh-button/gh-button';
import {
  GhSelectField,
  type GhSelectOption,
} from '../../../../shared/ui/gh-select-field/gh-select-field';

export type PlannerHeaderActionId =
  | 'new'
  | 'rename'
  | 'note'
  | 'import'
  | 'export'
  | 'clear'
  | 'delete';

type HeaderMenuAction = {
  readonly id: PlannerHeaderActionId;
  readonly labelKey: string;
  readonly fallback: string;
  readonly icon: string;
  readonly disabled?: boolean;
  readonly tone?: 'danger';
};

@Component({
  selector: 'app-planner-header',
  imports: [TranslatePipe, GhButton, GhSelectField],
  templateUrl: './planner-header.html',
})
export class PlannerHeader {
  readonly plans = input.required<readonly PlanConfig[]>();
  readonly activePlanId = input.required<string>();
  readonly canDeletePlan = input(true);
  readonly planSelected = output<string>();
  readonly actionSelected = output<PlannerHeaderActionId>();

  protected readonly planLabelKey = 'plannerV2.header.planLabel';
  protected readonly planLabelFallback = 'Plan';
  protected readonly newPlanLabelKey = 'plannerV2.header.newPlan';
  protected readonly newPlanLabelFallback = 'New plan';
  protected readonly importLabelKey = 'plannerV2.header.importPlan';
  protected readonly importLabelFallback = 'Import plan';
  protected readonly exportLabelKey = 'plannerV2.header.export';
  protected readonly exportLabelFallback = 'Export plan';
  protected readonly moreLabelKey = 'plannerV2.header.editPlan';
  protected readonly moreLabelFallback = 'Edit plan';
  protected readonly planOptions = computed<readonly GhSelectOption[]>(() =>
    this.plans().map((plan) => ({ value: plan.id, label: plan.name })),
  );

  protected readonly menuActions = computed<readonly HeaderMenuAction[]>(() => [
    {
      id: 'rename',
      labelKey: 'planConfig.rename',
      fallback: 'Rename',
      icon: 'save',
    },
    {
      id: 'note',
      labelKey: 'planConfig.note',
      fallback: 'Add note',
      icon: 'pencil',
    },
    {
      id: 'clear',
      labelKey: 'planConfig.clear',
      fallback: 'Clear',
      icon: 'eraser',
      tone: 'danger',
    },
    {
      id: 'delete',
      labelKey: 'planConfig.delete',
      fallback: 'Delete',
      icon: 'trash',
      disabled: !this.canDeletePlan(),
      tone: 'danger',
    },
  ]);
}
