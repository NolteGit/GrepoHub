export type ToolId =
  | 'time-calculator'
  | 'quick-calculator'
  | 'battle-simulator'
  | 'countdown'
  | 'stopwatch'
  | 'alarm';

export type CalculatorOperator = 'add' | 'subtract' | 'multiply' | 'divide';
export type CalculatorAction = 'clear' | 'backspace' | 'sign' | 'equals';
export type TimeDirection = 'add' | 'subtract';
export type TimePart = 'hours' | 'minutes' | 'seconds';
export type TimeOffsetField = 'offsetHours' | 'offsetMinutes' | 'offsetSeconds';
export type CountdownField = 'countdownMinutes' | 'countdownSeconds';
export type AlarmPart = 'hours' | 'minutes';
export type ReminderMode = 'alarm' | 'timer' | 'stopwatch';
export type TimeInputMode = ReminderMode | 'time-base' | 'time-offset';

export type ToolDraft = {
  baseTime: string;
  offsetHours: string;
  offsetMinutes: string;
  offsetSeconds: string;
  timeDirection: TimeDirection;
  calculatorDisplay: string;
  calculatorStoredValue: string;
  calculatorPendingOperator: CalculatorOperator | null;
  calculatorWaitingForNext: boolean;
  calculatorHistory: string[];
  attackerPreset: string;
  defenderPreset: string;
  countdownMinutes: string;
  countdownSeconds: string;
  countdownLabel: string;
  stopwatchLabel: string;
  alarmTime: string;
  alarmLabel: string;
};

export type CalculatorButton = {
  label: string;
  value?: string;
  operator?: CalculatorOperator;
  action?: CalculatorAction;
  className?: string;
  ariaLabel?: string;
};

export type TimePartControl = {
  part: TimePart;
  label: string;
  max: number;
};

export type TimeOffsetControl = {
  field: TimeOffsetField;
  label: string;
};

export type CountdownPartControl = {
  field: CountdownField;
  label: string;
  maxLength: number;
};

export type QueuedStopwatch = {
  id: string;
  label: string;
  elapsedMs: number;
  startedAt: number;
  running: boolean;
};

export type QueuedCountdown = {
  id: string;
  label: string;
  remainingMs: number;
  deadline: number;
  running: boolean;
};

export type QueuedAlarm = {
  id: string;
  label: string;
  time: string;
  deadline: number;
  running: boolean;
  triggered: boolean;
};

export type ActiveTimerItem = {
  id: string;
  type: 'countdown-queue' | 'stopwatch-queue' | 'alarm';
  label: string;
  value: string;
  state: string;
  tone: 'running' | 'paused' | 'armed' | 'done';
  running: boolean;
};

export type StoredToolboxState = {
  drafts?: Partial<Record<ToolId, Partial<ToolDraft>>>;
};

export type ReminderModeOption = {
  id: ReminderMode;
  label: string;
};

export type AlarmPreset = {
  time: string;
  label: string;
};

export type DraftUpdateEvent = {
  toolId: ToolId;
  field: keyof ToolDraft;
  event: Event;
};

export type TimePartAdjustmentEvent = {
  part: TimePart;
  amount: number;
};

export type TimeOffsetAdjustmentEvent = {
  field: TimeOffsetField;
  amount: number;
};

export type TimePartUpdateEvent = {
  toolId: ToolId;
  field: 'baseTime';
  part: TimePart;
  event: Event;
};

export type TimeInputEditEvent = {
  mode: TimeInputMode;
  event: FocusEvent;
};

export type TimeInputKeydownEvent = {
  mode: TimeInputMode;
  event: KeyboardEvent;
};
