import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';

import { ActiveTimerQueueComponent } from './components/active-timer-queue/active-timer-queue';
import { BattleSimulatorComponent } from './components/battle-simulator/battle-simulator';
import { QuickCalculatorComponent } from './components/quick-calculator/quick-calculator';
import { ReminderWidgetComponent } from './components/reminder-widget/reminder-widget';
import { TimeCalculatorComponent } from './components/time-calculator/time-calculator';
import { ToolboxHeroComponent } from './components/toolbox-hero/toolbox-hero';
import {
  ActiveTimerItem,
  AlarmPart,
  CalculatorButton,
  CalculatorOperator,
  CountdownField,
  QueuedAlarm,
  QueuedCountdown,
  QueuedStopwatch,
  ReminderMode,
  StoredToolboxState,
  TimeInputMode,
  TimeOffsetField,
  TimePart,
  ToolDraft,
  ToolId,
} from './models/toolbox.models';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-toolbox',
  imports: [
    ToolboxHeroComponent,
    QuickCalculatorComponent,
    TimeCalculatorComponent,
    ReminderWidgetComponent,
    ActiveTimerQueueComponent,
    BattleSimulatorComponent,
    TranslatePipe,
  ],
  templateUrl: './toolbox.html',
  styleUrl: './toolbox.scss',
})
export class Toolbox implements OnDestroy {
  showBattleSimulator = false;
  private readonly translationService = inject(TranslationService);
  private readonly storageKey = 'grepo-hub-toolbox-dashboard-state';
  private readonly toolIds: ToolId[] = [
    'quick-calculator',
    'time-calculator',
    'stopwatch',
    'alarm',
    'countdown',
    'battle-simulator',
  ];
  private readonly calculatorKeyboardOperators: Record<string, CalculatorOperator> = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    x: 'multiply',
    '/': 'divide',
    '÷': 'divide',
  };
  private readonly operatorSymbols: Record<CalculatorOperator, string> = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷',
  };

  private countdownIntervalId: number | null = null;
  private countdownDeadline = 0;
  private stopwatchIntervalId: number | null = null;
  private stopwatchStartedAt = 0;
  private readonly alarmTimeoutIds = new Map<string, number>();
  private readonly timeInputDigitBuffers: Record<TimeInputMode, string> = {
    alarm: '225900',
    timer: '000500',
    stopwatch: '000000',
    'time-base': '000000',
    'time-offset': '020000',
  };
  private readonly timeInputReplaceNext: Record<TimeInputMode, boolean> = {
    alarm: true,
    timer: true,
    stopwatch: true,
    'time-base': true,
    'time-offset': true,
  };

  protected readonly battleSimulator = {
    titleKey: 'toolbox.battle.title',
    eyebrowKey: 'toolbox.battle.eyebrow',
  };

  protected readonly calculatorButtons: CalculatorButton[] = [
    { label: 'C', action: 'clear', ariaLabelKey: 'toolbox.calculator.clearAria' },
    { label: '⌫', action: 'backspace', ariaLabelKey: 'toolbox.calculator.backspaceAria' },
    { label: '±', action: 'sign', ariaLabelKey: 'toolbox.calculator.toggleSignAria' },
    { label: '÷', operator: 'divide', className: 'calculator-pad__operator' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '×', operator: 'multiply', className: 'calculator-pad__operator' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '−', operator: 'subtract', className: 'calculator-pad__operator' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '+', operator: 'add', className: 'calculator-pad__operator' },
    { label: '0', value: '0', className: 'calculator-pad__zero' },
    { label: '.', value: '.' },
    { label: '=', action: 'equals', className: 'calculator-pad__equals' },
  ];

  protected readonly reminderModes: { id: ReminderMode; labelKey: string }[] = [
    { id: 'alarm', labelKey: 'toolbox.reminder.mode.alarm' },
    { id: 'timer', labelKey: 'toolbox.reminder.mode.timer' },
    { id: 'stopwatch', labelKey: 'toolbox.reminder.mode.stopwatch' },
  ];

  protected readonly alarmPresets = [
    { time: '07:00:00', label: '07:00' },
    { time: '11:00:00', label: '11:00' },
    { time: '21:59:00', label: '21:59' },
    { time: '23:00:00', label: '23:00' },
  ];
  protected readonly drafts = signal<Record<ToolId, ToolDraft>>(this.loadStoredDrafts());
  protected readonly countdownRemainingMs = signal<number | null>(null);
  protected readonly countdownRunning = signal(false);
  protected readonly stopwatchElapsedMs = signal(0);
  protected readonly stopwatchRunning = signal(false);
  protected readonly queuedCountdowns = signal<QueuedCountdown[]>([]);
  protected readonly queuedStopwatches = signal<QueuedStopwatch[]>([]);
  protected readonly queuedAlarms = signal<QueuedAlarm[]>([]);
  protected readonly stopwatchTick = signal(0);
  protected readonly freshQueueItemIds = signal<string[]>([]);
  protected readonly calculatorKeyboardActive = signal(false);
  protected readonly activeReminderMode = signal<ReminderMode>('timer');

  protected readonly timeBaseDisplay = computed(() => this.draftFor('time-calculator').baseTime);

  protected readonly timeCalculationResult = computed(() => {
    const draft = this.draftFor('time-calculator');
    const resultSeconds = this.normalizeDaySeconds(
      this.parseTimeToSeconds(draft.baseTime) + this.timeOffsetSeconds() * this.timeDirectionSign(),
    );

    return this.formatTimeFromSeconds(resultSeconds);
  });

  protected readonly timeDeltaDisplay = computed(() =>
    this.formatTimeFromSeconds(this.timeOffsetSeconds()),
  );

  protected readonly calculatorPreview = computed(() => {
    const draft = this.draftFor('quick-calculator');

    if (!draft.calculatorPendingOperator || !draft.calculatorStoredValue) {
      return '';
    }

    return `${draft.calculatorStoredValue} ${this.operatorSymbol(draft.calculatorPendingOperator)}`;
  });

  protected readonly countdownDisplay = computed(() =>
    this.formatDurationMs(this.countdownRemainingMs() ?? this.countdownDurationMs()),
  );

  protected readonly countdownStatus = computed(() => {
    const remainingMs = this.countdownRemainingMs();

    if (remainingMs === null) {
      return 'toolbox.status.ready';
    }

    if (remainingMs <= 0) {
      return 'toolbox.status.done';
    }

    return this.countdownRunning() ? 'toolbox.status.running' : 'toolbox.status.paused';
  });

  protected readonly canAddCountdownToQueue = computed(
    () => (this.countdownRemainingMs() ?? this.countdownDurationMs()) > 0,
  );

  protected readonly stopwatchDisplay = computed(() => {
    this.stopwatchTick();

    return this.formatDurationMs(this.currentMainStopwatchElapsedMs(), true);
  });

  protected readonly canAddStopwatchToQueue = computed(() => {
    this.stopwatchTick();

    return this.currentMainStopwatchElapsedMs() > 0;
  });

  protected readonly stopwatchStatus = computed(() => {
    this.stopwatchTick();

    if (this.stopwatchRunning()) {
      return 'toolbox.status.running';
    }

    return this.currentMainStopwatchElapsedMs() > 0
      ? 'toolbox.status.paused'
      : 'toolbox.status.ready';
  });

  protected readonly alarmStatus = computed(() => {
    if (this.queuedAlarms().some((alarm) => alarm.triggered)) {
      return 'toolbox.status.reached';
    }

    return this.queuedAlarms().some((alarm) => alarm.running)
      ? 'toolbox.status.armed'
      : 'toolbox.status.ready';
  });

  protected readonly activeTimerItems = computed<ActiveTimerItem[]>(() => {
    this.stopwatchTick();

    return [
      ...this.queuedCountdowns().map((countdown) => this.queuedCountdownItem(countdown)),
      ...this.queuedAlarms().map((alarm) => this.queuedAlarmItem(alarm)),
      ...this.queuedStopwatches().map((stopwatch) => this.queuedStopwatchItem(stopwatch)),
    ];
  });

  ngOnDestroy(): void {
    this.clearCountdownInterval();
    this.clearStopwatchInterval();
    this.clearAlarmTimeouts();
  }

  @HostListener('document:pointerdown', ['$event'])
  protected handleDocumentPointerDown(event: PointerEvent): void {
    this.calculatorKeyboardActive.set(this.isCalculatorTarget(event.target));
  }

  @HostListener('document:focusin', ['$event'])
  protected handleDocumentFocusIn(event: FocusEvent): void {
    if (this.isCalculatorTarget(event.target)) {
      this.activateCalculatorKeyboard();
      return;
    }

    if (this.isEditableTarget(event.target)) {
      this.calculatorKeyboardActive.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  protected handleCalculatorKeyboard(event: KeyboardEvent): void {
    if (!this.calculatorKeyboardActive() || this.isEditableTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();
    const operator = this.calculatorKeyboardOperators[key];

    if (/^[0-9]$/.test(key)) {
      this.runHandledKeyboardEvent(event, () => this.appendCalculatorValue(key));
      return;
    }

    if (key === '.' || key === ',') {
      this.runHandledKeyboardEvent(event, () => this.appendCalculatorValue('.'));
      return;
    }

    if (operator) {
      this.runHandledKeyboardEvent(event, () => this.setCalculatorOperator(operator));
      return;
    }

    if (key === 'enter' || key === '=') {
      this.runHandledKeyboardEvent(event, () => this.calculateCalculatorResult());
      return;
    }

    if (key === 'backspace') {
      this.runHandledKeyboardEvent(event, () => this.backspaceCalculator());
      return;
    }

    if (key === 'escape') {
      this.runHandledKeyboardEvent(event, () => this.clearCalculator());
    }
  }

  protected draftFor(toolId: ToolId): ToolDraft {
    return this.drafts()[toolId];
  }

  protected setReminderMode(mode: ReminderMode): void {
    this.activeReminderMode.set(mode);
  }

  protected updateDraft(toolId: ToolId, field: keyof ToolDraft, event: Event): void {
    this.setDraftField(toolId, field, this.readControlValue(event) as ToolDraft[typeof field]);

    if (toolId === 'countdown' && this.isCountdownField(field) && !this.countdownRunning()) {
      this.countdownRemainingMs.set(null);
    }
  }

  protected resetDraft(toolId: ToolId): void {
    this.drafts.update((drafts) => ({
      ...drafts,
      [toolId]: this.createDefaultDraft(),
    }));

    if (toolId === 'countdown') {
      this.resetCountdown();
      this.queuedCountdowns.set([]);
      this.syncStopwatchInterval();
    }

    if (toolId === 'stopwatch') {
      this.resetStopwatch();
      this.queuedStopwatches.set([]);
      this.syncStopwatchInterval();
    }

    if (toolId === 'alarm') {
      this.clearAlarm();
    }

    this.saveState();
  }

  protected useCurrentTime(toolId: ToolId): void {
    this.setDraftField(toolId, 'baseTime', this.getCurrentTimeValue());
  }

  protected toggleTimeDirection(): void {
    const nextDirection =
      this.draftFor('time-calculator').timeDirection === 'add' ? 'subtract' : 'add';
    this.setDraftField('time-calculator', 'timeDirection', nextDirection);
  }

  protected resetTimeOffset(): void {
    this.setTimeOffsetFromSeconds(0);
  }

  protected adjustTimeOffsetBySeconds(amount: number): void {
    this.setTimeOffsetFromSeconds(this.timeOffsetSeconds() + amount);
  }

  protected adjustTimeOffset(field: TimeOffsetField, amount: number): void {
    const currentValue = this.parseInteger(this.draftFor('time-calculator')[field]);
    this.setDraftField('time-calculator', field, String(Math.max(0, currentValue + amount)));
  }

  protected countdownPartDisplay(field: CountdownField): string {
    return this.padClockValue(this.parseInteger(this.draftFor('countdown')[field]));
  }

  protected updateCountdownPart(field: CountdownField, event: Event): void {
    this.setCountdownPart(field, this.readControlValue(event));
  }

  protected adjustCountdownPart(field: CountdownField, amount: number): void {
    this.setCountdownPart(
      field,
      String(this.parseInteger(this.draftFor('countdown')[field]) + amount),
    );
  }

  protected alarmTimePart(part: AlarmPart): string {
    const [hours, minutes] = this.splitTimeParts(this.draftFor('alarm').alarmTime);

    return part === 'hours' ? hours : minutes;
  }

  protected updateAlarmPart(part: AlarmPart, event: Event): void {
    const [hours, minutes] = this.splitTimeParts(this.draftFor('alarm').alarmTime);
    const value = this.readControlValue(event);

    this.setAlarmTime(
      `${part === 'hours' ? value : hours}:${part === 'minutes' ? value : minutes}:00`,
    );
  }

  protected setAlarmPreset(time: string): void {
    this.setAlarmTime(time);
  }

  protected setCountdownPreset(totalSeconds: number): void {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));

    this.setDraftFields('countdown', {
      countdownMinutes: String(Math.floor(safeSeconds / 60)),
      countdownSeconds: String(safeSeconds % 60),
    });

    if (!this.countdownRunning()) {
      this.countdownRemainingMs.set(null);
    }
  }

  protected startTimeInputEdit(mode: TimeInputMode, event: FocusEvent): void {
    this.calculatorKeyboardActive.set(false);
    this.timeInputDigitBuffers[mode] = this.timeInputDigitsForMode(mode);
    this.timeInputReplaceNext[mode] = true;

    if (event.target instanceof HTMLInputElement) {
      event.target.select();
    }
  }

  protected finishTimeInputEdit(mode: TimeInputMode): void {
    this.timeInputReplaceNext[mode] = true;
  }

  protected handleTimeInputKeydown(mode: TimeInputMode, event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      this.pushTimeInputDigit(mode, event.key);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.backspaceTimeInput(mode);
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      this.setTimeInputDigits(mode, '000000');
      return;
    }

    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();

      if (event.target instanceof HTMLInputElement) {
        event.target.blur();
      }

      return;
    }

    if (['Tab', 'Shift', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
  }

  protected toggleCountdown(): void {
    if (this.countdownRunning()) {
      this.pauseCountdown();
      return;
    }

    this.startCountdown();
  }

  protected addCountdownToQueue(): void {
    const remainingMs = this.countdownRemainingMs() ?? this.countdownDurationMs();

    if (remainingMs <= 0) {
      return;
    }

    const id = `countdown-${Date.now()}`;
    const running = this.countdownRunning();

    this.queuedCountdowns.update((items) => [
      ...items,
      {
        id,
        label: this.queueLabel(
          this.draftFor('countdown').countdownLabel,
          this.numberedLabel('toolbox.queue.defaultTimer', items.length + 1, 'Timer'),
        ),
        remainingMs,
        deadline: running ? Date.now() + remainingMs : 0,
        running,
      },
    ]);

    this.resetCountdown();
    this.markQueueItemFresh(id);
    this.syncStopwatchInterval();
  }

  protected toggleStopwatch(): void {
    if (this.stopwatchRunning()) {
      this.pauseStopwatch();
      return;
    }

    this.startStopwatch();
  }

  protected activateCalculatorKeyboard(): void {
    this.calculatorKeyboardActive.set(true);
  }

  protected timePart(value: string, part: TimePart): string {
    return this.splitTimeParts(value)[this.timePartIndex(part)];
  }

  protected updateTimePart(toolId: ToolId, field: 'baseTime', part: TimePart, event: Event): void {
    const parts = this.splitTimeParts(this.draftFor(toolId)[field]);
    parts[this.timePartIndex(part)] = this.clampClockPart(this.readControlValue(event), part);
    this.setDraftField(toolId, field, parts.join(':'));
  }

  protected adjustTimePart(part: TimePart, amount: number): void {
    const parts = this.splitTimeParts(this.draftFor('time-calculator').baseTime);
    const index = this.timePartIndex(part);
    const max = this.timePartMax(part);
    const nextPart = (this.parseInteger(parts[index]) + amount + max + 1) % (max + 1);

    parts[index] = this.padClockValue(nextPart);
    this.setDraftField('time-calculator', 'baseTime', parts.join(':'));
  }

  protected pressCalculatorButton(button: CalculatorButton): void {
    if (button.value) {
      this.appendCalculatorValue(button.value);
      return;
    }

    if (button.operator) {
      this.setCalculatorOperator(button.operator);
      return;
    }

    if (button.action === 'clear') {
      this.clearCalculator();
      return;
    }

    if (button.action === 'backspace') {
      this.backspaceCalculator();
      return;
    }

    if (button.action === 'sign') {
      this.toggleCalculatorSign();
      return;
    }

    if (button.action === 'equals') {
      this.calculateCalculatorResult();
    }
  }

  protected appendCalculatorValue(value: string): void {
    const draft = this.draftFor('quick-calculator');

    if (value === '.' && draft.calculatorDisplay.includes('.')) {
      return;
    }

    this.setDraftFields('quick-calculator', {
      calculatorDisplay: this.nextCalculatorDisplay(draft, value),
      calculatorWaitingForNext: false,
    });
  }

  protected setCalculatorOperator(operator: CalculatorOperator): void {
    const draft = this.draftFor('quick-calculator');

    if (draft.calculatorPendingOperator && !draft.calculatorWaitingForNext) {
      const resultText = this.formatNumber(
        this.runCalculatorOperation(
          draft.calculatorPendingOperator,
          this.parseNumber(draft.calculatorStoredValue),
          this.parseNumber(draft.calculatorDisplay),
        ),
      );

      this.setDraftFields('quick-calculator', {
        calculatorDisplay: resultText,
        calculatorStoredValue: resultText,
        calculatorPendingOperator: operator,
        calculatorWaitingForNext: true,
      });
      return;
    }

    this.setDraftFields('quick-calculator', {
      calculatorStoredValue: draft.calculatorDisplay,
      calculatorPendingOperator: operator,
      calculatorWaitingForNext: true,
    });
  }

  protected calculateCalculatorResult(): void {
    const draft = this.draftFor('quick-calculator');

    if (!draft.calculatorPendingOperator || !draft.calculatorStoredValue) {
      return;
    }

    const resultText = this.formatNumber(
      this.runCalculatorOperation(
        draft.calculatorPendingOperator,
        this.parseNumber(draft.calculatorStoredValue),
        this.parseNumber(draft.calculatorDisplay),
      ),
    );
    const expression = `${draft.calculatorStoredValue} ${this.operatorSymbol(
      draft.calculatorPendingOperator,
    )} ${draft.calculatorDisplay} = ${resultText}`;

    this.setDraftFields('quick-calculator', {
      calculatorDisplay: resultText,
      calculatorStoredValue: '',
      calculatorPendingOperator: null,
      calculatorWaitingForNext: true,
      calculatorHistory: [expression, ...draft.calculatorHistory].slice(0, 3),
    });
  }

  protected backspaceCalculator(): void {
    const draft = this.draftFor('quick-calculator');

    if (draft.calculatorWaitingForNext) {
      this.setDraftFields('quick-calculator', {
        calculatorDisplay: '0',
        calculatorWaitingForNext: false,
      });
      return;
    }

    const nextValue =
      draft.calculatorDisplay.length > 1 ? draft.calculatorDisplay.slice(0, -1) : '0';
    this.setDraftField(
      'quick-calculator',
      'calculatorDisplay',
      nextValue === '-' ? '0' : nextValue,
    );
  }

  protected clearCalculator(): void {
    this.setDraftFields('quick-calculator', {
      calculatorDisplay: '0',
      calculatorStoredValue: '',
      calculatorPendingOperator: null,
      calculatorWaitingForNext: false,
    });
  }

  protected toggleCalculatorSign(): void {
    const draft = this.draftFor('quick-calculator');
    const nextValue = draft.calculatorDisplay.startsWith('-')
      ? draft.calculatorDisplay.slice(1) || '0'
      : draft.calculatorDisplay === '0'
        ? '0'
        : `-${draft.calculatorDisplay}`;

    this.setDraftFields('quick-calculator', {
      calculatorDisplay: nextValue,
      calculatorWaitingForNext: false,
    });
  }

  protected startCountdown(): void {
    if (this.countdownRunning()) {
      return;
    }

    const startingMs = this.countdownRemainingMs() || this.countdownDurationMs();

    if (startingMs <= 0) {
      return;
    }

    this.countdownDeadline = Date.now() + startingMs;
    this.countdownRemainingMs.set(startingMs);
    this.countdownRunning.set(true);
    this.startCountdownInterval();
  }

  protected pauseCountdown(): void {
    this.clearCountdownInterval();
    this.countdownRunning.set(false);
  }

  protected resetCountdown(): void {
    this.clearCountdownInterval();
    this.countdownRunning.set(false);
    this.countdownRemainingMs.set(null);
  }

  protected startStopwatch(): void {
    if (this.stopwatchRunning()) {
      return;
    }

    this.stopwatchStartedAt = Date.now() - this.stopwatchElapsedMs();
    this.stopwatchRunning.set(true);
    this.syncStopwatchInterval();
  }

  protected pauseStopwatch(): void {
    if (this.stopwatchRunning()) {
      this.stopwatchElapsedMs.set(this.currentMainStopwatchElapsedMs());
    }

    this.stopwatchRunning.set(false);
    this.syncStopwatchInterval();
  }

  protected resetStopwatch(): void {
    this.stopwatchRunning.set(false);
    this.stopwatchElapsedMs.set(0);
    this.syncStopwatchInterval();
  }

  protected addStopwatchToQueue(): void {
    const elapsedMs = this.currentMainStopwatchElapsedMs();

    if (elapsedMs <= 0) {
      return;
    }

    const id = `stopwatch-${Date.now()}`;
    const running = this.stopwatchRunning();

    this.queuedStopwatches.update((items) => [
      ...items,
      {
        id,
        label: this.queueLabel(
          this.draftFor('stopwatch').stopwatchLabel,
          this.numberedLabel('toolbox.queue.defaultStopwatch', items.length + 1, 'Stopwatch'),
        ),
        elapsedMs,
        startedAt: Date.now(),
        running,
      },
    ]);

    this.stopwatchRunning.set(false);
    this.stopwatchElapsedMs.set(0);
    this.markQueueItemFresh(id);
    this.syncStopwatchInterval();
  }

  protected toggleQueuedStopwatch(itemId: string): void {
    this.queuedStopwatches.update((items) =>
      items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return item.running
          ? { ...item, elapsedMs: this.queuedStopwatchElapsedMs(item), running: false }
          : { ...item, startedAt: Date.now(), running: true };
      }),
    );

    this.syncStopwatchInterval();
  }

  protected toggleQueuedCountdown(itemId: string): void {
    this.queuedCountdowns.update((items) =>
      items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const remainingMs = this.queuedCountdownRemainingMs(item);

        if (remainingMs <= 0) {
          return { ...item, remainingMs: 0, running: false };
        }

        return item.running
          ? { ...item, remainingMs, deadline: 0, running: false }
          : { ...item, deadline: Date.now() + remainingMs, running: true };
      }),
    );

    this.syncStopwatchInterval();
  }

  protected removeActiveItem(item: ActiveTimerItem): void {
    if (item.type === 'countdown-queue') {
      this.queuedCountdowns.update((items) =>
        items.filter((countdown) => countdown.id !== item.id),
      );
      this.syncStopwatchInterval();
      return;
    }

    if (item.type === 'alarm') {
      this.removeQueuedAlarm(item.id);
      return;
    }

    this.queuedStopwatches.update((items) => items.filter((stopwatch) => stopwatch.id !== item.id));
    this.syncStopwatchInterval();
  }

  protected armAlarm(): void {
    const draft = this.draftFor('alarm');
    const id = `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const delaySeconds = this.alarmDelaySeconds(draft.alarmTime);
    const alarm: QueuedAlarm = {
      id,
      label: this.queueLabel(
        draft.alarmLabel,
        this.numberedLabel('toolbox.queue.defaultAlarm', this.queuedAlarms().length + 1, 'Alarm'),
      ),
      time: this.normalizeAlarmTimeValue(draft.alarmTime),
      deadline: Date.now() + delaySeconds * 1000,
      running: true,
      triggered: false,
    };

    this.queuedAlarms.update((items) => [...items, alarm]);
    this.scheduleQueuedAlarm(alarm);
    this.markQueueItemFresh(id);
  }

  protected clearAlarm(): void {
    this.clearAlarmTimeouts();
    this.queuedAlarms.set([]);
  }

  protected toggleQueueItem(item: ActiveTimerItem): void {
    if (item.type === 'countdown-queue') {
      this.toggleQueuedCountdown(item.id);
      return;
    }

    if (item.type === 'stopwatch-queue') {
      this.toggleQueuedStopwatch(item.id);
    }
  }

  private queuedCountdownItem(countdown: QueuedCountdown): ActiveTimerItem {
    const remainingMs = this.queuedCountdownRemainingMs(countdown);

    return {
      id: countdown.id,
      type: 'countdown-queue',
      label: countdown.label,
      value: this.formatDurationMs(remainingMs),
      stateKey:
        remainingMs <= 0
          ? 'toolbox.status.finished'
          : countdown.running
            ? 'toolbox.status.running'
            : 'toolbox.status.paused',
      tone: remainingMs <= 0 ? 'done' : countdown.running ? 'running' : 'paused',
      running: countdown.running && remainingMs > 0,
    };
  }

  private queuedStopwatchItem(stopwatch: QueuedStopwatch): ActiveTimerItem {
    return {
      id: stopwatch.id,
      type: 'stopwatch-queue',
      label: stopwatch.label,
      value: this.formatDurationMs(this.queuedStopwatchElapsedMs(stopwatch), true),
      stateKey: stopwatch.running ? 'toolbox.status.running' : 'toolbox.status.paused',
      tone: stopwatch.running ? 'running' : 'paused',
      running: stopwatch.running,
    };
  }

  private queuedAlarmItem(alarm: QueuedAlarm): ActiveTimerItem {
    return {
      id: alarm.id,
      type: 'alarm',
      label: alarm.label,
      value: alarm.time,
      stateKey: alarm.triggered ? 'toolbox.status.reached' : 'toolbox.status.armed',
      tone: alarm.triggered ? 'done' : 'armed',
      running: alarm.running,
    };
  }

  private queueLabel(value: string, fallback: string): string {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : fallback;
  }

  private numberedLabel(key: string, count: number, fallback: string): string {
    return `${this.translationService.translate(key, fallback)} ${count}`;
  }

  private setCountdownPart(field: CountdownField, value: string): void {
    const maxValue = field === 'countdownMinutes' ? 999 : 59;
    const nextValue = Math.min(this.parseInteger(value), maxValue);

    this.setDraftField('countdown', field, String(nextValue));

    if (!this.countdownRunning()) {
      this.countdownRemainingMs.set(null);
    }
  }

  private setAlarmTime(value: string): void {
    this.setDraftField('alarm', 'alarmTime', this.normalizeAlarmTimeValue(value));
  }

  private alarmDelaySeconds(time: string): number {
    const targetSeconds = this.parseTimeToSeconds(time);
    const now = new Date();
    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    return this.normalizePositiveDelaySeconds(targetSeconds - nowSeconds);
  }

  private scheduleQueuedAlarm(alarm: QueuedAlarm): void {
    this.clearAlarmTimeout(alarm.id);

    const timeoutId = window.setTimeout(
      () => {
        this.queuedAlarms.update((items) =>
          items.map((item) =>
            item.id === alarm.id ? { ...item, running: false, triggered: true } : item,
          ),
        );
        this.alarmTimeoutIds.delete(alarm.id);
        this.markQueueItemFresh(alarm.id);
      },
      Math.max(0, alarm.deadline - Date.now()),
    );

    this.alarmTimeoutIds.set(alarm.id, timeoutId);
  }

  private removeQueuedAlarm(itemId: string): void {
    this.clearAlarmTimeout(itemId);
    this.queuedAlarms.update((items) => items.filter((alarm) => alarm.id !== itemId));
  }

  private setDraftField<T extends keyof ToolDraft>(
    toolId: ToolId,
    field: T,
    value: ToolDraft[T],
  ): void {
    this.setDraftFields(toolId, { [field]: value } as Partial<ToolDraft>);
  }

  private setDraftFields(toolId: ToolId, changes: Partial<ToolDraft>): void {
    this.drafts.update((drafts) => ({
      ...drafts,
      [toolId]: {
        ...drafts[toolId],
        ...changes,
      },
    }));

    this.saveState();
  }

  private loadStoredDrafts(): Record<ToolId, ToolDraft> {
    const defaults = this.createDefaultDrafts();
    const storedDrafts = this.readStoredState()?.drafts;

    if (!storedDrafts || typeof storedDrafts !== 'object') {
      return defaults;
    }

    const hydratedDrafts = this.toolIds.reduce<Record<ToolId, ToolDraft>>(
      (drafts, toolId) => {
        const storedDraft = storedDrafts[toolId];

        drafts[toolId] = {
          ...defaults[toolId],
          ...(storedDraft && typeof storedDraft === 'object' ? storedDraft : {}),
        };

        drafts[toolId].calculatorHistory = Array.isArray(drafts[toolId].calculatorHistory)
          ? drafts[toolId].calculatorHistory.slice(0, 3)
          : [];

        return drafts;
      },
      {} as Record<ToolId, ToolDraft>,
    );

    hydratedDrafts['time-calculator'] = {
      ...hydratedDrafts['time-calculator'],
      baseTime: this.getCurrentTimeValue(),
    };

    return hydratedDrafts;
  }

  private readStoredState(): StoredToolboxState | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const storedValue = localStorage.getItem(this.storageKey);

    if (!storedValue) {
      return null;
    }

    try {
      return JSON.parse(storedValue) as StoredToolboxState;
    } catch {
      return null;
    }
  }

  private saveState(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify({ drafts: this.drafts() }));
  }

  private createDefaultDrafts(): Record<ToolId, ToolDraft> {
    return this.toolIds.reduce<Record<ToolId, ToolDraft>>(
      (drafts, toolId) => {
        drafts[toolId] = this.createDefaultDraft();

        return drafts;
      },
      {} as Record<ToolId, ToolDraft>,
    );
  }

  private createDefaultDraft(): ToolDraft {
    return {
      baseTime: this.getCurrentTimeValue(),
      offsetHours: '0',
      offsetMinutes: '0',
      offsetSeconds: '0',
      timeDirection: 'add',
      calculatorDisplay: '0',
      calculatorStoredValue: '',
      calculatorPendingOperator: null,
      calculatorWaitingForNext: false,
      calculatorHistory: [],
      attackerPreset: 'Attacker army',
      defenderPreset: 'Defender army',
      countdownMinutes: '5',
      countdownSeconds: '0',
      countdownLabel: 'Timer',
      stopwatchLabel: 'Stopwatch',
      alarmTime: '22:59:00',
      alarmLabel: 'Incoming reminder',
    };
  }

  private getCurrentTimeValue(): string {
    return this.formatDateTimeValue(new Date());
  }

  private getTimeOffsetValue(offsetMinutes: number): string {
    return this.formatDateTimeValue(new Date(Date.now() + offsetMinutes * 60 * 1000));
  }

  private formatDateTimeValue(date: Date): string {
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((part) => this.padClockValue(part))
      .join(':');
  }

  private normalizeAlarmTimeValue(value: string): string {
    const [hours, minutes, seconds] = this.splitTimeParts(value);

    return [
      this.clampNumber(this.parseInteger(hours), 0, 23),
      this.clampNumber(this.parseInteger(minutes), 0, 59),
      this.clampNumber(this.parseInteger(seconds), 0, 59),
    ]
      .map((part) => this.padClockValue(part))
      .join(':');
  }

  private readControlValue(event: Event): string {
    const target = event.target;

    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      return target.value;
    }

    return '';
  }

  private countdownDurationMs(): number {
    const draft = this.draftFor('countdown');

    return (
      (this.parseInteger(draft.countdownMinutes) * 60 + this.parseInteger(draft.countdownSeconds)) *
      1000
    );
  }

  private startCountdownInterval(): void {
    this.clearCountdownInterval();
    this.countdownIntervalId = window.setInterval(() => {
      const remainingMs = Math.max(0, this.countdownDeadline - Date.now());
      this.countdownRemainingMs.set(remainingMs);

      if (remainingMs <= 0) {
        this.pauseCountdown();
      }
    }, 200);
  }

  private clearCountdownInterval(): void {
    if (this.countdownIntervalId !== null) {
      window.clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
  }

  private syncStopwatchInterval(): void {
    this.settleQueuedCountdowns();

    const hasRunningTimer =
      this.stopwatchRunning() ||
      this.queuedStopwatches().some((stopwatch) => stopwatch.running) ||
      this.queuedCountdowns().some((countdown) => countdown.running);

    if (hasRunningTimer && this.stopwatchIntervalId === null) {
      this.stopwatchIntervalId = window.setInterval(() => {
        if (this.stopwatchRunning()) {
          this.stopwatchElapsedMs.set(this.currentMainStopwatchElapsedMs());
        }

        this.settleQueuedCountdowns();
        this.stopwatchTick.update((tick) => tick + 1);

        const stillRunning =
          this.stopwatchRunning() ||
          this.queuedStopwatches().some((stopwatch) => stopwatch.running) ||
          this.queuedCountdowns().some((countdown) => countdown.running);

        if (!stillRunning) {
          this.clearStopwatchInterval();
        }
      }, 33);
    }

    if (!hasRunningTimer) {
      this.clearStopwatchInterval();
    }
  }

  private settleQueuedCountdowns(): void {
    const now = Date.now();
    const runningCountdowns = this.queuedCountdowns();

    if (!runningCountdowns.some((countdown) => countdown.running && countdown.deadline <= now)) {
      return;
    }

    this.queuedCountdowns.update((items) =>
      items.map((item) =>
        item.running && item.deadline <= now ? { ...item, remainingMs: 0, running: false } : item,
      ),
    );
  }

  private clearStopwatchInterval(): void {
    if (this.stopwatchIntervalId !== null) {
      window.clearInterval(this.stopwatchIntervalId);
      this.stopwatchIntervalId = null;
    }
  }

  private clearAlarmTimeout(itemId: string): void {
    const timeoutId = this.alarmTimeoutIds.get(itemId);

    if (timeoutId === undefined) {
      return;
    }

    window.clearTimeout(timeoutId);
    this.alarmTimeoutIds.delete(itemId);
  }

  private clearAlarmTimeouts(): void {
    this.alarmTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    this.alarmTimeoutIds.clear();
  }

  private currentMainStopwatchElapsedMs(): number {
    return this.stopwatchRunning()
      ? Math.max(0, Date.now() - this.stopwatchStartedAt)
      : this.stopwatchElapsedMs();
  }

  private queuedCountdownRemainingMs(countdown: QueuedCountdown): number {
    return countdown.running ? Math.max(0, countdown.deadline - Date.now()) : countdown.remainingMs;
  }

  private queuedStopwatchElapsedMs(stopwatch: QueuedStopwatch): number {
    return stopwatch.running
      ? stopwatch.elapsedMs + Math.max(0, Date.now() - stopwatch.startedAt)
      : stopwatch.elapsedMs;
  }

  private markQueueItemFresh(itemId: string): void {
    this.freshQueueItemIds.update((ids) => (ids.includes(itemId) ? ids : [...ids, itemId]));

    window.setTimeout(() => {
      this.freshQueueItemIds.update((ids) => ids.filter((currentId) => currentId !== itemId));
    }, 1200);
  }

  private isCalculatorTarget(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest('.calculator-card') !== null;
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    );
  }

  private pushTimeInputDigit(mode: TimeInputMode, digit: string): void {
    const nextDigits = this.timeInputReplaceNext[mode]
      ? digit.padStart(6, '0')
      : `${this.timeInputDigitBuffers[mode]}${digit}`.slice(-6);

    this.setTimeInputDigits(mode, nextDigits);
  }

  private backspaceTimeInput(mode: TimeInputMode): void {
    const nextDigits = this.timeInputReplaceNext[mode]
      ? '000000'
      : this.timeInputDigitBuffers[mode].slice(0, -1).padStart(6, '0');

    this.setTimeInputDigits(mode, nextDigits);
  }

  private setTimeInputDigits(mode: TimeInputMode, digits: string): void {
    const normalizedDigits = digits.replace(/\D/g, '').slice(-6).padStart(6, '0');

    this.timeInputDigitBuffers[mode] = normalizedDigits;
    this.timeInputReplaceNext[mode] = false;
    this.applyTimeInputDigits(mode, normalizedDigits);
  }

  private applyTimeInputDigits(mode: TimeInputMode, digits: string): void {
    const maxHours = mode === 'alarm' || mode === 'time-base' ? 23 : 99;
    const [hours, minutes, seconds] = this.parseTimeInputDigits(digits, maxHours);

    if (mode === 'alarm') {
      this.setAlarmTime(this.joinTimeParts(hours, minutes, seconds));
      return;
    }

    if (mode === 'time-base') {
      this.setDraftField(
        'time-calculator',
        'baseTime',
        this.joinTimeParts(hours, minutes, seconds),
      );
      return;
    }

    if (mode === 'time-offset') {
      this.setDraftFields('time-calculator', {
        offsetHours: String(hours),
        offsetMinutes: String(minutes),
        offsetSeconds: String(seconds),
      });
      return;
    }

    if (mode === 'timer') {
      if (this.countdownRunning()) {
        return;
      }

      this.setDraftFields('countdown', {
        countdownMinutes: String(hours * 60 + minutes),
        countdownSeconds: String(seconds),
      });
      this.countdownRemainingMs.set(null);
      return;
    }

    if (this.stopwatchRunning()) {
      return;
    }

    this.stopwatchElapsedMs.set((hours * 3600 + minutes * 60 + seconds) * 1000);
  }

  private timeInputDigitsForMode(mode: TimeInputMode): string {
    if (mode === 'alarm') {
      return this.digitsFromTimeString(this.draftFor('alarm').alarmTime);
    }

    if (mode === 'time-base') {
      return this.digitsFromTimeString(this.draftFor('time-calculator').baseTime);
    }

    if (mode === 'time-offset') {
      return this.digitsFromSeconds(this.timeOffsetSeconds());
    }

    if (mode === 'timer') {
      return this.digitsFromSeconds(
        Math.floor((this.countdownRemainingMs() ?? this.countdownDurationMs()) / 1000),
      );
    }

    return this.digitsFromSeconds(Math.floor(this.currentMainStopwatchElapsedMs() / 1000));
  }

  private digitsFromTimeString(value: string): string {
    return this.splitTimeParts(value).join('').replace(/\D/g, '').slice(-6).padStart(6, '0');
  }

  private digitsFromSeconds(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.min(99, Math.floor(safeSeconds / 3600));
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return `${this.padClockValue(hours)}${this.padClockValue(minutes)}${this.padClockValue(seconds)}`;
  }

  private parseTimeInputDigits(digits: string, maxHours: number): [number, number, number] {
    const normalizedDigits = digits.replace(/\D/g, '').slice(-6).padStart(6, '0');

    return [
      this.clampNumber(this.parseInteger(normalizedDigits.slice(0, 2)), 0, maxHours),
      this.clampNumber(this.parseInteger(normalizedDigits.slice(2, 4)), 0, 59),
      this.clampNumber(this.parseInteger(normalizedDigits.slice(4, 6)), 0, 59),
    ];
  }

  private joinTimeParts(hours: number, minutes: number, seconds: number): string {
    return [hours, minutes, seconds].map((part) => this.padClockValue(part)).join(':');
  }

  private isCountdownField(field: keyof ToolDraft): field is CountdownField {
    return field === 'countdownMinutes' || field === 'countdownSeconds';
  }

  private runHandledKeyboardEvent(event: KeyboardEvent, handler: () => void): void {
    event.preventDefault();
    handler();
  }

  private splitTimeParts(value: string): [string, string, string] {
    const [hours = '00', minutes = '00', seconds = '00'] = value.split(':');

    return [hours, minutes, seconds].map((part) => part.padStart(2, '0')) as [
      string,
      string,
      string,
    ];
  }

  private timePartIndex(part: TimePart): 0 | 1 | 2 {
    return part === 'hours' ? 0 : part === 'minutes' ? 1 : 2;
  }

  private timePartMax(part: TimePart): number {
    return part === 'hours' ? 23 : 59;
  }

  private clampClockPart(value: string, part: TimePart): string {
    return this.padClockValue(
      this.clampNumber(this.parseInteger(value), 0, this.timePartMax(part)),
    );
  }

  private parseTimeToSeconds(value: string): number {
    const [hours, minutes, seconds] = this.splitTimeParts(value);

    return this.normalizeDaySeconds(
      this.parseInteger(hours) * 3600 +
        this.parseInteger(minutes) * 60 +
        this.parseInteger(seconds),
    );
  }

  private timeOffsetSeconds(): number {
    const draft = this.draftFor('time-calculator');

    return (
      this.parseInteger(draft.offsetHours) * 3600 +
      this.parseInteger(draft.offsetMinutes) * 60 +
      this.parseInteger(draft.offsetSeconds)
    );
  }

  private setTimeOffsetFromSeconds(totalSeconds: number): void {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.min(99, Math.floor(safeSeconds / 3600));
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    this.setDraftFields('time-calculator', {
      offsetHours: String(hours),
      offsetMinutes: String(minutes),
      offsetSeconds: String(seconds),
    });
  }

  private timeDirectionSign(): 1 | -1 {
    return this.draftFor('time-calculator').timeDirection === 'subtract' ? -1 : 1;
  }

  private normalizeDaySeconds(value: number): number {
    const daySeconds = 24 * 60 * 60;

    return ((Math.round(value) % daySeconds) + daySeconds) % daySeconds;
  }

  private normalizePositiveDelaySeconds(value: number): number {
    return value <= 0 ? value + 24 * 60 * 60 : value;
  }

  private formatTimeFromSeconds(value: number): string {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    return [hours, minutes, seconds].map((part) => this.padClockValue(part)).join(':');
  }

  private padClockValue(value: number): string {
    return String(value).padStart(2, '0');
  }

  private clampNumber(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private parseInteger(value: string): number {
    const parsedValue = Number.parseInt(value, 10);

    return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
  }

  private parseNumber(value: string): number {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private nextCalculatorDisplay(draft: ToolDraft, value: string): string {
    if (draft.calculatorWaitingForNext) {
      return value === '.' ? '0.' : value;
    }

    if (draft.calculatorDisplay === '0' && value !== '.') {
      return value;
    }

    return `${draft.calculatorDisplay}${value}`;
  }

  private runCalculatorOperation(
    operator: CalculatorOperator,
    left: number,
    right: number,
  ): number {
    if (operator === 'subtract') {
      return left - right;
    }

    if (operator === 'multiply') {
      return left * right;
    }

    if (operator === 'divide') {
      return right === 0 ? 0 : left / right;
    }

    return left + right;
  }

  private operatorSymbol(operator: CalculatorOperator): string {
    return this.operatorSymbols[operator];
  }

  private formatNumber(value: number): string {
    if (!Number.isFinite(value)) {
      return '0';
    }

    return Number.isInteger(value)
      ? String(value)
      : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  }

  private formatDurationMs(totalMs: number, includeMilliseconds = false): string {
    const safeMs = Math.max(0, Math.floor(totalMs));
    const totalSeconds = Math.floor(safeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const base = [hours, minutes, seconds].map((part) => this.padClockValue(part)).join(':');

    if (!includeMilliseconds) {
      return base;
    }

    return `${base}.${String(safeMs % 1000).padStart(3, '0')}`;
  }
}
