import { Component, computed, inject, input, output } from '@angular/core';

import { PlanConfig } from '../../../../models/plan-config.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { languageOptions, type SupportedLanguage } from '../../../../services/supported-languages';
import { TranslationService } from '../../../../services/translation.service';
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
  private readonly translationService = inject(TranslationService);

  readonly plans = input.required<readonly PlanConfig[]>();
  readonly activePlanId = input.required<string>();
  readonly canDeletePlan = input(true);
  readonly planSelected = output<string>();
  readonly actionSelected = output<PlannerHeaderActionId>();

  protected readonly brandLabelKey = 'plannerV2.header.brand';
  protected readonly brandLabelFallback = 'GrepoPlan';
  protected readonly planLabelKey = 'plannerV2.header.planLabel';
  protected readonly planLabelFallback = 'Plan';
  protected readonly newPlanLabelKey = 'plannerV2.header.newPlan';
  protected readonly newPlanLabelFallback = 'New plan';
  protected readonly exportLabelKey = 'plannerV2.header.export';
  protected readonly exportLabelFallback = 'Export';
  protected readonly moreLabelKey = 'plannerV2.header.more';
  protected readonly moreLabelFallback = 'More';
  protected readonly languageOpenLabelKey = 'language.openMenu';
  protected readonly languageOpenLabelFallback = 'Choose language';
  protected readonly languageMenuLabelKey = 'language.menuAria';
  protected readonly languageMenuLabelFallback = 'Language selection';
  protected readonly languageOptions = languageOptions;
  protected readonly currentLanguage = this.translationService.currentLanguage;
  protected readonly planOptions = computed<readonly GhSelectOption[]>(() =>
    this.plans().map((plan) => ({ value: plan.id, label: plan.name })),
  );

  protected currentLanguageShortLabelKey(): string {
    return (
      this.languageOptions.find((language) => language.code === this.currentLanguage())
        ?.shortLabelKey ?? 'language.englishCode'
    );
  }

  protected currentLanguageShortFallback(): string {
    return this.currentLanguage().toUpperCase();
  }

  protected selectLanguage(language: SupportedLanguage): void {
    this.translationService.setLanguage(language);
  }

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
      fallback: 'Note',
      icon: 'note',
    },
    {
      id: 'import',
      labelKey: 'planConfig.importJson',
      fallback: 'Import JSON',
      icon: 'import',
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
