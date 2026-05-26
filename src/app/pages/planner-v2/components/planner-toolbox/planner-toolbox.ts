import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';

import { referenceQuickLinks, type ReferenceQuickLink } from '../../../../data/reference-documents';
import { formatNumber as formatCalculatorNumber } from '../../../../utils/toolbox-calculator.util';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { TranslationService } from '../../../../services/translation.service';
import { ToolboxTimerService } from '../../../../services/toolbox-timer.service';
import { GhButton } from '../../../../shared/ui/gh-button/gh-button';
import { GhIconButton } from '../../../../shared/ui/gh-icon-button/gh-icon-button';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';
import type { ActiveTimerItem } from '../../../../models/toolbox.models';
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

type ToolboxReminderMode = 'alarm' | 'timer' | 'stopwatch';

type ToolboxReminderModeTab = {
  readonly id: ToolboxReminderMode;
  readonly labelKey: string;
  readonly fallback: string;
};

type ToolboxReminderTimerPreset = {
  readonly id: string;
  readonly labelKey: string;
  readonly fallback: string;
  readonly seconds: number;
};

type ToolboxReminderAlarmPreset = {
  readonly time: string;
  readonly label: string;
};

type CalculatorHistoryItem = {
  readonly expression: string;
  readonly result: string;
};

type TimeCalculatorOperation = 'add' | 'subtract';

type TimeCalculatorInputKind = 'base' | 'duration';

type TimeCalculatorUnit = 'hours' | 'minutes' | 'seconds';

type TimeCalculatorParts = {
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
};

type TimeCalculatorResult = TimeCalculatorParts & {
  readonly dayOffset: number;
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
  private readonly timerService = inject(ToolboxTimerService);
  private readonly now = signal(new Date());
  private readonly intervalId = window.setInterval(() => this.now.set(new Date()), 30_000);
  private readonly secondsPerDay = 86_400;

  protected readonly calculatorMode = signal<ToolboxCalculatorMode>('calculator');
  private readonly calculatorExpression = signal('');
  private readonly calculatorWasEvaluated = signal(false);
  protected readonly calculatorHistory = signal<readonly CalculatorHistoryItem[]>([]);
  protected readonly timeCalculatorBase = signal<TimeCalculatorParts>(
    this.createCurrentTimeParts(),
  );
  protected readonly timeCalculatorDuration = signal<TimeCalculatorParts>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  protected readonly timeCalculatorOperation = signal<TimeCalculatorOperation>('add');
  protected readonly reminderDialogOpen = signal(false);
  protected readonly reminderMode = signal<ToolboxReminderMode>('timer');
  protected readonly reminderName = signal('');
  protected readonly reminderTimerDuration = signal<TimeCalculatorParts>({
    hours: 0,
    minutes: 5,
    seconds: 0,
  });
  protected readonly reminderAlarmTime = signal<TimeCalculatorParts>(this.createCurrentAlarmParts());

  protected readonly calculatorDisplay = computed(() => this.calculatorExpression() || '0');
  protected readonly calculatorDisplaySize = computed(() =>
    this.calculatorDisplay().length > 12 ? 'text-base' : 'text-lg',
  );
  protected readonly timeCalculatorResult = computed<TimeCalculatorResult>(() => {
    const baseSeconds = this.getTimePartsTotalSeconds(this.timeCalculatorBase());
    const durationSeconds = this.getTimePartsTotalSeconds(this.timeCalculatorDuration());
    const rawResultSeconds =
      this.timeCalculatorOperation() === 'add'
        ? baseSeconds + durationSeconds
        : baseSeconds - durationSeconds;
    const dayOffset = Math.floor(rawResultSeconds / this.secondsPerDay);
    const normalizedSeconds = this.normalizeDaySeconds(rawResultSeconds);

    return {
      ...this.getTimePartsFromSeconds(normalizedSeconds),
      dayOffset,
    };
  });
  protected readonly timeCalculatorOperationSymbol = computed(() =>
    this.timeCalculatorOperation() === 'add' ? '+' : '−',
  );
  protected readonly timeCalculatorDayOffsetKey = computed(() => {
    const dayOffset = this.timeCalculatorResult().dayOffset;

    if (dayOffset > 0) {
      return 'plannerV2.toolbox.timeCalculator.nextDay';
    }

    if (dayOffset < 0) {
      return 'plannerV2.toolbox.timeCalculator.previousDay';
    }

    return 'plannerV2.toolbox.timeCalculator.sameDay';
  });
  protected readonly timeCalculatorDayOffsetFallback = computed(() => {
    const dayOffset = this.timeCalculatorResult().dayOffset;

    if (dayOffset > 0) {
      return dayOffset === 1 ? '+1 day' : `+${dayOffset.toString()} days`;
    }

    if (dayOffset < 0) {
      return dayOffset === -1 ? '-1 day' : `${dayOffset.toString()} days`;
    }

    return 'same day';
  });

  protected readonly queueItems = this.timerService.overviewItems;
  protected readonly reminderTimerDurationDisplay = computed(() =>
    this.formatReminderTimeParts(this.reminderTimerDuration()),
  );
  protected readonly reminderAlarmTimeValue = computed(() => {
    const time = this.reminderAlarmTime();

    return `${this.formatTimeCalculatorPart(time.hours)}:${this.formatTimeCalculatorPart(time.minutes)}`;
  });
  protected readonly reminderDefaultNameKey = computed(() =>
    this.getReminderDefaultNameKey(this.reminderMode()),
  );
  protected readonly reminderDefaultNameFallback = computed(() =>
    this.getReminderDefaultNameFallback(this.reminderMode()),
  );
  protected readonly reminderModeTitleKey = computed(() =>
    this.getReminderModeTitleKey(this.reminderMode()),
  );
  protected readonly reminderModeTitleFallback = computed(() =>
    this.getReminderModeTitleFallback(this.reminderMode()),
  );
  protected readonly reminderPrimaryActionKey = computed(() =>
    this.reminderMode() === 'alarm' ? 'toolbox.reminder.activate' : 'toolbox.queue.start',
  );
  protected readonly reminderPrimaryActionFallback = computed(() =>
    this.reminderMode() === 'alarm' ? 'Activate' : 'Start',
  );
  protected readonly reminderCanSubmit = computed(() =>
    this.reminderMode() === 'timer' ? this.getReminderDurationMs() > 0 : true,
  );

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

  protected readonly reminderModeTabs: readonly ToolboxReminderModeTab[] = [
    {
      id: 'alarm',
      labelKey: 'toolbox.reminder.mode.alarm',
      fallback: 'Alarm',
    },
    {
      id: 'timer',
      labelKey: 'toolbox.reminder.mode.timer',
      fallback: 'Timer',
    },
    {
      id: 'stopwatch',
      labelKey: 'toolbox.reminder.mode.stopwatch',
      fallback: 'Stopwatch',
    },
  ];

  protected readonly reminderTimerPresets: readonly ToolboxReminderTimerPreset[] = [
    {
      id: 'oneMinute',
      labelKey: 'toolbox.reminder.preset.oneMinute',
      fallback: '1 min',
      seconds: 60,
    },
    {
      id: 'fiveMinutes',
      labelKey: 'toolbox.reminder.preset.fiveMinutes',
      fallback: '5 min',
      seconds: 300,
    },
    {
      id: 'tenMinutes',
      labelKey: 'toolbox.reminder.preset.tenMinutes',
      fallback: '10 min',
      seconds: 600,
    },
    {
      id: 'thirtyMinutes',
      labelKey: 'toolbox.reminder.preset.thirtyMinutes',
      fallback: '30 min',
      seconds: 1_800,
    },
    {
      id: 'oneHour',
      labelKey: 'toolbox.reminder.preset.oneHour',
      fallback: '1 hour',
      seconds: 3_600,
    },
  ];

  protected readonly reminderAlarmPresets: readonly ToolboxReminderAlarmPreset[] = [
    { time: '07:00', label: '07:00' },
    { time: '11:00', label: '11:00' },
    { time: '21:59', label: '21:59' },
    { time: '23:00', label: '23:00' },
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

  protected readonly timeCalculatorUnits: readonly TimeCalculatorUnit[] = [
    'hours',
    'minutes',
    'seconds',
  ];
  protected readonly timeCalculatorUnitLabels: Record<TimeCalculatorUnit, string> = {
    hours: 'plannerV2.toolbox.timeCalculator.hours',
    minutes: 'plannerV2.toolbox.timeCalculator.minutes',
    seconds: 'plannerV2.toolbox.timeCalculator.seconds',
  };
  protected readonly timeCalculatorUnitFallbacks: Record<TimeCalculatorUnit, string> = {
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
  };

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


  protected selectAction(action: ToolboxActionButton): void {
    if (action.disabled) {
      return;
    }

    this.actionSelected.emit(action.id);
  }

  @HostListener('document:keydown', ['$event'])
  protected handleCalculatorKeyboard(event: KeyboardEvent): void {
    if (this.reminderDialogOpen()) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeReminderDialog();
      }

      return;
    }

    if (this.calculatorMode() !== 'calculator' || this.isEditableKeyboardTarget(event.target)) {
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.deleteCalculatorLastCharacter();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.clearCalculator();
      return;
    }

    const calculatorKey = this.mapCalculatorKeyboardKey(event.key);

    if (!calculatorKey) {
      return;
    }

    event.preventDefault();
    this.blurFocusedCalculatorButton();
    this.pressCalculatorKey(calculatorKey);
  }

  protected openReminderDialog(): void {
    this.reminderMode.set('timer');
    this.reminderName.set('');
    this.reminderTimerDuration.set({ hours: 0, minutes: 5, seconds: 0 });
    this.reminderAlarmTime.set(this.createCurrentAlarmParts());
    this.reminderDialogOpen.set(true);
  }

  protected closeReminderDialog(): void {
    this.reminderDialogOpen.set(false);
  }

  protected selectReminderMode(mode: ToolboxReminderMode): void {
    this.reminderMode.set(mode);
  }

  protected getReminderModeTitleKey(mode: ToolboxReminderMode): string {
    return (
      this.reminderModeTabs.find((tab) => tab.id === mode)?.labelKey ??
      'toolbox.reminder.mode.timer'
    );
  }

  protected getReminderModeTitleFallback(mode: ToolboxReminderMode): string {
    return this.reminderModeTabs.find((tab) => tab.id === mode)?.fallback ?? 'Timer';
  }

  protected updateReminderName(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.reminderName.set(input.value);
  }

  protected handleReminderTimerInputKeydown(
    unit: TimeCalculatorUnit,
    event: KeyboardEvent,
  ): void {
    const input = event.target as HTMLInputElement;

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const buffer = input.dataset['timeCalculatorBuffer'] ?? '';
      const nextBuffer = `${buffer}${event.key}`.slice(-2);

      input.dataset['timeCalculatorBuffer'] = nextBuffer;
      this.setReminderDurationPart(unit, Number.parseInt(nextBuffer, 10));
      window.setTimeout(() => input.select());
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      input.dataset['timeCalculatorBuffer'] = '';
      this.setReminderDurationPart(unit, 0);
      window.setTimeout(() => input.select());
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      input.dataset['timeCalculatorBuffer'] = '';
      const delta = event.key === 'ArrowUp' ? 1 : -1;

      this.setReminderDurationPart(unit, this.reminderTimerDuration()[unit] + delta);
      window.setTimeout(() => input.select());
    }
  }

  protected updateReminderTimerPart(unit: TimeCalculatorUnit, event: Event): void {
    const input = event.target as HTMLInputElement;

    input.dataset['timeCalculatorBuffer'] = '';
    this.setReminderDurationPart(unit, this.parseTimeCalculatorInput(input.value));
  }

  protected updateReminderAlarmTime(event: Event): void {
    const input = event.target as HTMLInputElement;
    const [hours = '0', minutes = '0'] = input.value.split(':');

    this.reminderAlarmTime.set({
      hours: Math.max(0, Math.min(23, this.parseTimeCalculatorInput(hours))),
      minutes: Math.max(0, Math.min(59, this.parseTimeCalculatorInput(minutes))),
      seconds: 0,
    });
  }

  protected setReminderTimerPreset(seconds: number): void {
    this.reminderTimerDuration.set(this.getTimePartsFromSeconds(seconds));
  }

  protected resetReminderTimer(): void {
    this.reminderTimerDuration.set({ hours: 0, minutes: 5, seconds: 0 });
  }

  protected setReminderAlarmPreset(time: string): void {
    const [hours = '0', minutes = '0'] = time.split(':');

    this.reminderAlarmTime.set({
      hours: Math.max(0, Math.min(23, this.parseTimeCalculatorInput(hours))),
      minutes: Math.max(0, Math.min(59, this.parseTimeCalculatorInput(minutes))),
      seconds: 0,
    });
  }

  protected setReminderAlarmNow(): void {
    this.reminderAlarmTime.set(this.createCurrentAlarmParts());
  }

  protected submitReminder(): void {
    if (!this.reminderCanSubmit()) {
      return;
    }

    const label = this.getReminderLabel();

    if (this.reminderMode() === 'timer') {
      this.timerService.addQueuedCountdown(this.getReminderDurationMs(), label);
      this.closeReminderDialog();
      return;
    }

    if (this.reminderMode() === 'alarm') {
      this.timerService.armAlarm(
        label,
        this.reminderAlarmTimeValue(),
        this.getNextAlarmDeadline(this.reminderAlarmTime()),
      );
      this.closeReminderDialog();
      return;
    }

    this.timerService.addQueuedStopwatch(label);
    this.closeReminderDialog();
  }

  protected toggleQueueItem(item: ActiveTimerItem): void {
    this.timerService.toggleOverviewItem(item);
  }

  protected removeQueueItem(item: ActiveTimerItem): void {
    this.timerService.removeOverviewItem(item);
  }

  protected queueStateFallback(tone: ActiveTimerItem['tone']): string {
    if (tone === 'running') {
      return 'Running';
    }

    if (tone === 'paused') {
      return 'Paused';
    }

    if (tone === 'armed') {
      return 'Armed';
    }

    return 'Done';
  }

  protected pressCalculatorKey(key: string): void {
    if (key === 'C') {
      this.clearCalculator();
      return;
    }

    if (key === '=') {
      this.resolveCalculator();
      return;
    }

    if (key === '(' || key === ')') {
      this.enterCalculatorParenthesis(key);
      return;
    }

    if (this.isCalculatorOperator(key)) {
      this.enterCalculatorOperator(key);
      return;
    }

    this.enterCalculatorValue(key);
  }

  protected selectCalculatorMode(mode: ToolboxCalculatorMode): void {
    this.calculatorMode.set(mode);
  }

  protected setTimeCalculatorNow(): void {
    this.timeCalculatorBase.set(this.createCurrentTimeParts());
  }

  protected toggleTimeCalculatorOperation(): void {
    this.timeCalculatorOperation.update((operation) => (operation === 'add' ? 'subtract' : 'add'));
  }

  protected resetTimeCalculatorDuration(): void {
    this.timeCalculatorDuration.set({ hours: 0, minutes: 0, seconds: 0 });
  }

  protected selectTimeCalculatorInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    input.dataset['timeCalculatorBuffer'] = '';
    window.setTimeout(() => input.select());
  }

  protected handleTimeCalculatorInputKeydown(
    kind: TimeCalculatorInputKind,
    unit: TimeCalculatorUnit,
    event: KeyboardEvent,
  ): void {
    const input = event.target as HTMLInputElement;

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const buffer = input.dataset['timeCalculatorBuffer'] ?? '';
      const nextBuffer = `${buffer}${event.key}`.slice(-2);

      input.dataset['timeCalculatorBuffer'] = nextBuffer;
      this.setTimeCalculatorPart(kind, unit, Number.parseInt(nextBuffer, 10));
      window.setTimeout(() => input.select());
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      input.dataset['timeCalculatorBuffer'] = '';
      this.setTimeCalculatorPart(kind, unit, 0);
      window.setTimeout(() => input.select());
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      input.dataset['timeCalculatorBuffer'] = '';
      const currentParts =
        kind === 'base' ? this.timeCalculatorBase() : this.timeCalculatorDuration();
      const delta = event.key === 'ArrowUp' ? 1 : -1;

      this.setTimeCalculatorPart(kind, unit, currentParts[unit] + delta);
      window.setTimeout(() => input.select());
    }
  }

  protected updateTimeCalculatorPart(
    kind: TimeCalculatorInputKind,
    unit: TimeCalculatorUnit,
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;

    input.dataset['timeCalculatorBuffer'] = '';
    this.setTimeCalculatorPart(kind, unit, this.parseTimeCalculatorInput(input.value));
  }

  protected formatTimeCalculatorPart(value: number): string {
    return value.toString().padStart(2, '0');
  }

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }

  private createCurrentAlarmParts(): TimeCalculatorParts {
    const current = new Date();

    return {
      hours: current.getHours(),
      minutes: current.getMinutes(),
      seconds: 0,
    };
  }

  private getReminderDurationMs(): number {
    return this.getTimePartsTotalSeconds(this.reminderTimerDuration()) * 1000;
  }

  private getReminderLabel(): string {
    const label = this.reminderName().trim();

    return label || this.getTranslatedReminderDefaultName(this.reminderMode());
  }

  private getTranslatedReminderDefaultName(mode: ToolboxReminderMode): string {
    return this.translationService.translate(
      this.getReminderDefaultNameKey(mode),
      this.getReminderDefaultNameFallback(mode),
    );
  }

  private getReminderDefaultNameKey(mode: ToolboxReminderMode): string {
    if (mode === 'alarm') {
      return 'toolbox.queue.defaultAlarm';
    }

    if (mode === 'stopwatch') {
      return 'toolbox.queue.defaultStopwatch';
    }

    return 'toolbox.queue.defaultTimer';
  }

  private getReminderDefaultNameFallback(mode: ToolboxReminderMode): string {
    if (mode === 'alarm') {
      return 'Alarm';
    }

    if (mode === 'stopwatch') {
      return 'Stopwatch';
    }

    return 'Timer';
  }

  private formatReminderTimeParts(parts: TimeCalculatorParts): string {
    return `${this.formatTimeCalculatorPart(parts.hours)}:${this.formatTimeCalculatorPart(
      parts.minutes,
    )}:${this.formatTimeCalculatorPart(parts.seconds)}`;
  }

  private setReminderDurationPart(unit: TimeCalculatorUnit, value: number): void {
    const maximum = unit === 'hours' ? 99 : 59;
    const nextValue = Math.max(0, Math.min(maximum, value));

    this.reminderTimerDuration.update((parts) => ({
      ...parts,
      [unit]: nextValue,
    }));
  }

  private getNextAlarmDeadline(parts: TimeCalculatorParts): number {
    const now = new Date();
    const deadline = new Date(now);

    deadline.setHours(parts.hours, parts.minutes, 0, 0);

    if (deadline.getTime() <= now.getTime()) {
      deadline.setDate(deadline.getDate() + 1);
    }

    return deadline.getTime();
  }

  private createCurrentTimeParts(): TimeCalculatorParts {
    const current = new Date();

    return {
      hours: current.getHours(),
      minutes: current.getMinutes(),
      seconds: current.getSeconds(),
    };
  }

  private parseTimeCalculatorInput(value: string): number {
    const parsedValue = Number.parseInt(value.replace(/\D/g, ''), 10);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private setTimeCalculatorPart(
    kind: TimeCalculatorInputKind,
    unit: TimeCalculatorUnit,
    value: number,
  ): void {
    const maximum = this.getTimeCalculatorMaximum(kind, unit);
    const nextValue = Math.max(0, Math.min(maximum, value));
    const targetSignal = kind === 'base' ? this.timeCalculatorBase : this.timeCalculatorDuration;

    targetSignal.update((parts) => ({
      ...parts,
      [unit]: nextValue,
    }));
  }

  private getTimeCalculatorMaximum(
    kind: TimeCalculatorInputKind,
    unit: TimeCalculatorUnit,
  ): number {
    if (unit !== 'hours') {
      return 59;
    }

    return kind === 'base' ? 23 : 99;
  }

  private getTimePartsTotalSeconds(parts: TimeCalculatorParts): number {
    return parts.hours * 3_600 + parts.minutes * 60 + parts.seconds;
  }

  private getTimePartsFromSeconds(totalSeconds: number): TimeCalculatorParts {
    const hours = Math.floor(totalSeconds / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  }

  private normalizeDaySeconds(totalSeconds: number): number {
    return ((totalSeconds % this.secondsPerDay) + this.secondsPerDay) % this.secondsPerDay;
  }

  private mapCalculatorKeyboardKey(key: string): string | null {
    if (/^\d$/.test(key)) {
      return key;
    }

    if (key === '.' || key === ',') {
      return '.';
    }

    if (key === '+') {
      return '+';
    }

    if (key === '-' || key === '−') {
      return '−';
    }

    if (key === '*') {
      return '×';
    }

    if (key === '/') {
      return '÷';
    }

    if (key === '(' || key === ')') {
      return key;
    }

    if (key === '=' || key === 'Enter') {
      return '=';
    }

    return null;
  }

  private isEditableKeyboardTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const tagName = target.tagName.toLowerCase();

    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable ||
      target.closest('[contenteditable="true"]') !== null
    );
  }

  private blurFocusedCalculatorButton(): void {
    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement && activeElement.closest('app-gh-button')) {
      activeElement.blur();
    }
  }

  private clearCalculator(): void {
    this.calculatorExpression.set('');
    this.calculatorWasEvaluated.set(false);
  }

  private deleteCalculatorLastCharacter(): void {
    if (this.calculatorWasEvaluated()) {
      this.clearCalculator();
      return;
    }

    const expression = this.calculatorExpression();

    if (!expression) {
      return;
    }

    const trimmedExpression = expression.trimEnd();

    if (this.endsWithOperator(trimmedExpression)) {
      this.calculatorExpression.set(trimmedExpression.slice(0, -1).trimEnd());
      return;
    }

    this.calculatorExpression.set(trimmedExpression.slice(0, -1));
  }

  private addCalculatorHistory(expression: string, result: string): void {
    this.calculatorHistory.update((history) => [{ expression, result }, ...history].slice(0, 2));
  }

  private enterCalculatorValue(value: string): void {
    const expression = this.calculatorWasEvaluated() ? '' : this.calculatorExpression();
    const lastNumber = this.getLastNumberSegment(expression);

    if (value === '.' && lastNumber.includes('.')) {
      return;
    }

    if (
      value === '.' &&
      (!lastNumber || this.endsWithOperator(expression) || expression.endsWith('('))
    ) {
      this.calculatorExpression.set(`${expression}0.`);
      this.calculatorWasEvaluated.set(false);
      return;
    }

    if (lastNumber === '0' && value !== '.' && !expression.endsWith('.')) {
      this.calculatorExpression.set(`${expression.slice(0, -1)}${value}`);
      this.calculatorWasEvaluated.set(false);
      return;
    }

    if (expression.endsWith(')')) {
      this.calculatorExpression.set(`${expression} × ${value}`);
      this.calculatorWasEvaluated.set(false);
      return;
    }

    this.calculatorExpression.set(`${expression}${value}`);
    this.calculatorWasEvaluated.set(false);
  }

  private enterCalculatorOperator(operator: string): void {
    const expression = this.calculatorExpression();

    if (!expression) {
      if (operator === '−') {
        this.calculatorExpression.set('-');
      }
      return;
    }

    if (expression === '-') {
      return;
    }

    if (this.endsWithOperator(expression)) {
      this.calculatorExpression.set(`${expression.trimEnd().slice(0, -1)}${operator} `);
      this.calculatorWasEvaluated.set(false);
      return;
    }

    if (expression.endsWith('(')) {
      if (operator === '−') {
        this.calculatorExpression.set(`${expression}-`);
      }
      return;
    }

    this.calculatorExpression.set(`${expression} ${operator} `);
    this.calculatorWasEvaluated.set(false);
  }

  private enterCalculatorParenthesis(parenthesis: string): void {
    const expression = this.calculatorWasEvaluated() ? '' : this.calculatorExpression();

    if (parenthesis === '(') {
      if (!expression || this.endsWithOperator(expression) || expression.endsWith('(')) {
        this.calculatorExpression.set(`${expression}(`);
      } else {
        this.calculatorExpression.set(`${expression} × (`);
      }
      this.calculatorWasEvaluated.set(false);
      return;
    }

    if (
      this.getOpenParenthesisCount(expression) <= 0 ||
      this.endsWithOperator(expression) ||
      expression.endsWith('(')
    ) {
      return;
    }

    this.calculatorExpression.set(`${expression})`);
    this.calculatorWasEvaluated.set(false);
  }

  private resolveCalculator(): void {
    const expression = this.calculatorExpression();

    if (!expression || this.endsWithOperator(expression) || expression.endsWith('(')) {
      return;
    }

    const result = this.evaluateCalculatorExpression(expression);

    if (result === null) {
      this.calculatorExpression.set('0');
      this.calculatorWasEvaluated.set(true);
      return;
    }

    const formattedResult = formatCalculatorNumber(result);

    this.addCalculatorHistory(expression, formattedResult);
    this.calculatorExpression.set(formattedResult);
    this.calculatorWasEvaluated.set(true);
  }

  private evaluateCalculatorExpression(expression: string): number | null {
    const tokens = this.tokenizeCalculatorExpression(expression);
    let index = 0;

    const parseExpression = (): number | null => {
      let value = parseTerm();

      while (value !== null && (tokens[index] === '+' || tokens[index] === '−')) {
        const operator = tokens[index];
        index += 1;
        const right = parseTerm();

        if (right === null) {
          return null;
        }

        value = operator === '+' ? value + right : value - right;
      }

      return value;
    };

    const parseTerm = (): number | null => {
      let value = parseFactor();

      while (value !== null && (tokens[index] === '×' || tokens[index] === '÷')) {
        const operator = tokens[index];
        index += 1;
        const right = parseFactor();

        if (right === null) {
          return null;
        }

        value = operator === '×' ? value * right : right === 0 ? 0 : value / right;
      }

      return value;
    };

    const parseFactor = (): number | null => {
      const token = tokens[index];

      if (!token) {
        return null;
      }

      if (token === '(') {
        index += 1;
        const value = parseExpression();

        if (tokens[index] !== ')') {
          return null;
        }

        index += 1;
        return value;
      }

      const value = Number(token);

      if (!Number.isFinite(value)) {
        return null;
      }

      index += 1;
      return value;
    };

    const result = parseExpression();

    return result !== null && index === tokens.length ? result : null;
  }

  private tokenizeCalculatorExpression(expression: string): readonly string[] {
    const tokens: string[] = [];
    const compactExpression = expression.replace(/\s+/g, '').replace(/-/g, '−');
    let index = 0;

    while (index < compactExpression.length) {
      const character = compactExpression[index];
      const previousToken = tokens[tokens.length - 1];
      const isUnaryMinus =
        character === '−' &&
        (!previousToken || previousToken === '(' || this.isCalculatorOperator(previousToken));

      if (/[0-9.]/.test(character) || isUnaryMinus) {
        let numberText = isUnaryMinus ? '-' : '';
        index += isUnaryMinus ? 1 : 0;

        while (index < compactExpression.length && /[0-9.]/.test(compactExpression[index])) {
          numberText += compactExpression[index];
          index += 1;
        }

        tokens.push(numberText);
        continue;
      }

      if (this.isCalculatorOperator(character) || character === '(' || character === ')') {
        tokens.push(character);
      }

      index += 1;
    }

    return tokens;
  }

  private getLastNumberSegment(expression: string): string {
    return expression.match(/-?\d*\.?\d*$/)?.[0] ?? '';
  }

  private endsWithOperator(expression: string): boolean {
    return this.isCalculatorOperator(expression.trimEnd().slice(-1));
  }

  private isCalculatorOperator(value: string): boolean {
    return value === '+' || value === '−' || value === '×' || value === '÷';
  }

  private getOpenParenthesisCount(expression: string): number {
    return [...expression].reduce((balance, character) => {
      if (character === '(') {
        return balance + 1;
      }

      if (character === ')') {
        return balance - 1;
      }

      return balance;
    }, 0);
  }

  private getQuickLinkHref(link: ReferenceQuickLink, language: string): string {
    if (language === 'de' && link.urlDe) {
      return link.urlDe;
    }

    return link.urlEn ?? link.url ?? link.urlDe ?? '#';
  }
}
