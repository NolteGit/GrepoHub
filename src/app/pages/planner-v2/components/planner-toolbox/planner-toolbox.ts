import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';

import { referenceQuickLinks, type ReferenceQuickLink } from '../../../../data/reference-documents';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { TranslationService } from '../../../../services/translation.service';
import { GhButton } from '../../../../shared/ui/gh-button/gh-button';
import { GhIconButton } from '../../../../shared/ui/gh-icon-button/gh-icon-button';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';
import type { PlannerHeaderActionId } from '../planner-header/planner-header';
import type { PlannerMode } from '../planner-mode-switch/planner-mode-switch';

export type PlannerToolboxActionId = PlannerHeaderActionId | 'city' | 'troops' | 'language';

type ToolboxActionButton = {
  readonly id: PlannerToolboxActionId;
  readonly labelKey: string;
  readonly fallback: string;
  readonly icon: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
};

type ToolboxCalculatorMode = 'calculator' | 'time';

type ToolboxCalculatorTab = {
  readonly id: ToolboxCalculatorMode;
  readonly labelKey: string;
  readonly fallback: string;
};

type ToolboxQueueItem = {
  readonly labelKey: string;
  readonly fallback: string;
  readonly time: string;
};

type ToolboxQuickLink = ReferenceQuickLink & {
  readonly href: string;
};

@Component({
  selector: 'app-planner-toolbox',
  imports: [TranslatePipe, GhButton, GhIconButton, GhPanel],
  templateUrl: './planner-toolbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerToolbox implements OnDestroy {
  readonly activeMode = input.required<PlannerMode>();
  readonly canDeletePlan = input(true);
  readonly actionSelected = output<PlannerToolboxActionId>();

  protected readonly createdByName = 'Noltenius';
  protected readonly createdByHref = 'https://github.com/Noltenius';
  protected readonly githubHref = 'https://github.com/Noltenius/GrepoHub';

  private readonly translationService = inject(TranslationService);
  private readonly now = signal(new Date());
  private readonly intervalId = window.setInterval(() => this.now.set(new Date()), 30_000);

  protected readonly calculatorMode = signal<ToolboxCalculatorMode>('calculator');

  protected readonly clockTime = computed(() =>
    new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(this.now()),
  );

  protected readonly clockDate = computed(() =>
    new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    }).format(this.now()),
  );

  protected readonly brandInitial = 'G';
  protected readonly actionTitleKey = 'plannerV2.toolbox.tools';
  protected readonly actionTitleFallback = 'Tools';
  protected readonly queueTitleKey = 'plannerV2.toolbox.queue';
  protected readonly queueTitleFallback = 'Reminders / Queue';
  protected readonly calculatorTitleKey = 'plannerV2.toolbox.calculator';
  protected readonly calculatorTitleFallback = 'Calculator / TimeCalc';
  protected readonly addReminderLabelKey = 'plannerV2.toolbox.addReminder';
  protected readonly addReminderLabelFallback = 'Add reminder';
  protected readonly quickLinksAriaKey = 'references.quickLinksAria';
  protected readonly quickLinksAriaFallback = 'Important quick links';

  protected readonly calculatorTabs: readonly ToolboxCalculatorTab[] = [
    {
      id: 'calculator',
      labelKey: 'plannerV2.toolbox.calculator.tab.calculator',
      fallback: 'Calculator',
    },
    {
      id: 'time',
      labelKey: 'plannerV2.toolbox.calculator.tab.time',
      fallback: 'TimeCalc',
    },
  ];

  protected readonly calculatorKeys = [
    'C',
    '(',
    ')',
    '÷',
    '7',
    '8',
    '9',
    '×',
    '4',
    '5',
    '6',
    '−',
    '1',
    '2',
    '3',
    '+',
    '0',
    '.',
    '=',
  ];

  protected readonly actionButtons = computed<readonly ToolboxActionButton[]>(() => [
    {
      id: 'new',
      labelKey: 'plannerV2.header.newPlan',
      fallback: 'New plan',
      icon: '+',
    },
    {
      id: 'import',
      labelKey: 'plannerV2.header.import',
      fallback: 'Import',
      icon: '⇧',
    },
    {
      id: 'export',
      labelKey: 'plannerV2.header.export',
      fallback: 'Export',
      icon: '⇩',
    },
    {
      id: 'delete',
      labelKey: 'plannerV2.header.delete',
      fallback: 'Delete',
      icon: '×',
      disabled: !this.canDeletePlan(),
    },
    {
      id: 'city',
      labelKey: 'plannerV2.mode.city',
      fallback: 'City Setup',
      icon: '▥',
      active: this.activeMode() === 'city',
    },
    {
      id: 'troops',
      labelKey: 'plannerV2.mode.troops',
      fallback: 'Troop Setup',
      icon: '⚔',
      active: this.activeMode() === 'troops',
    },
    {
      id: 'language',
      labelKey: 'plannerV2.toolbox.actions.language',
      fallback: 'Language',
      icon: '🌐',
    },
  ]);

  protected readonly quickLinks = computed<readonly ToolboxQuickLink[]>(() => {
    const language = this.translationService.currentLanguage();

    return referenceQuickLinks.map((link) => ({
      ...link,
      href: this.getQuickLinkHref(link, language),
    }));
  });

  protected readonly queueItems: readonly ToolboxQueueItem[] = [
    {
      labelKey: 'plannerV2.toolbox.demoQueue.farmUpgrade',
      fallback: 'Farm upgrade',
      time: '21:45',
    },
    {
      labelKey: 'plannerV2.toolbox.demoQueue.barracksUpgrade',
      fallback: 'Barracks upgrade',
      time: '01:12:30',
    },
    {
      labelKey: 'plannerV2.toolbox.demoQueue.marketplaceUpgrade',
      fallback: 'Marketplace upgrade',
      time: '03:30:00',
    },
  ];

  protected selectAction(action: ToolboxActionButton): void {
    if (action.disabled) {
      return;
    }

    this.actionSelected.emit(action.id);
  }

  protected selectCalculatorMode(mode: ToolboxCalculatorMode): void {
    this.calculatorMode.set(mode);
  }

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }

  private getQuickLinkHref(link: ReferenceQuickLink, language: string): string {
    if (language === 'de' && link.urlDe) {
      return link.urlDe;
    }

    return link.urlEn ?? link.url ?? link.urlDe ?? '#';
  }
}
