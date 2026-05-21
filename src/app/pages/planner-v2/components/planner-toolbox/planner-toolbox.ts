import { Component, computed, OnDestroy, signal } from '@angular/core';

type ToolboxButton = {
  readonly label: string;
  readonly icon: string;
};

type ToolboxQueueItem = {
  readonly label: string;
  readonly time: string;
};

@Component({
  selector: 'app-planner-toolbox',
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
  protected readonly actionTitle = 'Tools';
  protected readonly queueTitle = 'Reminders / Queue';
  protected readonly calculatorTitle = 'Calculator / TimeCalc';
  protected readonly addReminderLabel = 'Add reminder';
  protected readonly footerLinks = ['GitHub', 'Help'];
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
    { label: 'Save', icon: 'S' },
    { label: 'Load', icon: 'L' },
    { label: 'Share', icon: '↑' },
    { label: 'Compare', icon: '◇' },
    { label: 'Import', icon: 'I' },
    { label: 'Copy', icon: 'C' },
    { label: 'Clear', icon: '×' },
    { label: 'Settings', icon: '⚙' },
  ];
  protected readonly queueItems: readonly ToolboxQueueItem[] = [
    { label: 'Farm upgrade', time: '21:45' },
    { label: 'Barracks upgrade', time: '01:12:30' },
    { label: 'Marketplace upgrade', time: '03:30:00' },
  ];

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }
}
