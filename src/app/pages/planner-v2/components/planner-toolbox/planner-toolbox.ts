import { Component, computed, OnDestroy, signal } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

type ToolboxButton = {
  readonly labelKey: string;
  readonly fallback: string;
  readonly icon: string;
};

type ToolboxQueueItem = {
  readonly labelKey: string;
  readonly fallback: string;
  readonly time: string;
};

@Component({
  selector: 'app-planner-toolbox',
  imports: [TranslatePipe],
  templateUrl: './planner-toolbox.html',
  styleUrl: './planner-toolbox.scss',
})
export class PlannerToolbox implements OnDestroy {
  private readonly now = signal(new Date());
  private readonly intervalId = window.setInterval(() => this.now.set(new Date()), 30_000);

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
  protected readonly footerLinks: readonly ToolboxButton[] = [
    { labelKey: 'plannerV2.toolbox.footer.github', fallback: 'GitHub', icon: '' },
    { labelKey: 'plannerV2.toolbox.footer.help', fallback: 'Help', icon: '' },
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
  protected readonly actionButtons: readonly ToolboxButton[] = [
    { labelKey: 'plannerV2.toolbox.actions.save', fallback: 'Save', icon: 'S' },
    { labelKey: 'plannerV2.toolbox.actions.load', fallback: 'Load', icon: 'L' },
    { labelKey: 'plannerV2.toolbox.actions.share', fallback: 'Share', icon: '↑' },
    { labelKey: 'plannerV2.toolbox.actions.compare', fallback: 'Compare', icon: '◇' },
    { labelKey: 'plannerV2.toolbox.actions.import', fallback: 'Import', icon: 'I' },
    { labelKey: 'plannerV2.toolbox.actions.copy', fallback: 'Copy', icon: 'C' },
    { labelKey: 'plannerV2.toolbox.actions.clear', fallback: 'Clear', icon: '×' },
    { labelKey: 'plannerV2.toolbox.actions.settings', fallback: 'Settings', icon: '⚙' },
  ];
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

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }
}
