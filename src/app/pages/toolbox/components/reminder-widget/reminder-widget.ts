import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  AlarmPreset,
  DraftUpdateEvent,
  ReminderMode,
  ReminderModeOption,
  TimeInputEditEvent,
  TimeInputKeydownEvent,
  TimeInputMode,
  ToolDraft,
} from '../../models/toolbox.models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

type TimerPreset = {
  seconds: number;
  labelKey: string;
};

@Component({
  selector: 'app-reminder-widget',
  imports: [TranslatePipe],
  templateUrl: './reminder-widget.html',
  styleUrl: './reminder-widget.scss',
})
export class ReminderWidgetComponent {
  @Input() activeMode: ReminderMode = 'timer';
  @Input() reminderModes: ReminderModeOption[] = [];
  @Input() alarmDraft!: ToolDraft;
  @Input() countdownDraft!: ToolDraft;
  @Input() stopwatchDraft!: ToolDraft;
  @Input() alarmStatus = 'toolbox.status.ready';
  @Input() countdownStatus = 'toolbox.status.ready';
  @Input() countdownRunning = false;
  @Input() countdownDisplay = '00:00:00';
  @Input() canAddCountdownToQueue = false;
  @Input() stopwatchRunning = false;
  @Input() stopwatchStatus = 'toolbox.status.ready';
  @Input() stopwatchDisplay = '00:00:00.000';
  @Input() canAddStopwatchToQueue = false;
  @Input() alarmPresets: AlarmPreset[] = [];

  @Output() reminderModeSelected = new EventEmitter<ReminderMode>();
  @Output() timeInputEditStarted = new EventEmitter<TimeInputEditEvent>();
  @Output() timeInputEditFinished = new EventEmitter<TimeInputMode>();
  @Output() timeInputKeydown = new EventEmitter<TimeInputKeydownEvent>();
  @Output() draftUpdated = new EventEmitter<DraftUpdateEvent>();
  @Output() alarmArmed = new EventEmitter<void>();
  @Output() alarmPresetSelected = new EventEmitter<string>();
  @Output() countdownToggled = new EventEmitter<void>();
  @Output() countdownAdded = new EventEmitter<void>();
  @Output() countdownPresetSelected = new EventEmitter<number>();
  @Output() countdownReset = new EventEmitter<void>();
  @Output() stopwatchToggled = new EventEmitter<void>();
  @Output() stopwatchAdded = new EventEmitter<void>();
  @Output() stopwatchReset = new EventEmitter<void>();

  protected readonly timerPresets: TimerPreset[] = [
    { seconds: 60, labelKey: 'toolbox.reminder.preset.oneMinute' },
    { seconds: 5 * 60, labelKey: 'toolbox.reminder.preset.fiveMinutes' },
    { seconds: 10 * 60, labelKey: 'toolbox.reminder.preset.tenMinutes' },
    { seconds: 30 * 60, labelKey: 'toolbox.reminder.preset.thirtyMinutes' },
    { seconds: 60 * 60, labelKey: 'toolbox.reminder.preset.oneHour' },
  ];
}
