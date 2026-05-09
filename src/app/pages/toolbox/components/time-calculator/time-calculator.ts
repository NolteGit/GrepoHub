import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  DraftUpdateEvent,
  TimeInputEditEvent,
  TimeInputKeydownEvent,
  TimeInputMode,
  TimeOffsetAdjustmentEvent,
  TimeOffsetControl,
  TimePart,
  TimePartAdjustmentEvent,
  TimePartControl,
  TimePartUpdateEvent,
  ToolDraft,
  ToolId,
} from '../../models/toolbox.models';

@Component({
  selector: 'app-time-calculator',
  templateUrl: './time-calculator.html',
  styleUrl: './time-calculator.scss',
})
export class TimeCalculatorComponent {
  @Input() draft!: ToolDraft;
  @Input() baseDisplay = '';
  @Input() deltaDisplay = '';
  @Input() result = '';
  @Input() timePartControls: TimePartControl[] = [];
  @Input() timeOffsetControls: TimeOffsetControl[] = [];

  @Output() currentTimeRequested = new EventEmitter<ToolId>();
  @Output() timeOffsetReset = new EventEmitter<void>();
  @Output() timeOffsetAdjustedBySeconds = new EventEmitter<number>();
  @Output() directionToggled = new EventEmitter<void>();
  @Output() timePartAdjusted = new EventEmitter<TimePartAdjustmentEvent>();
  @Output() timePartUpdated = new EventEmitter<TimePartUpdateEvent>();
  @Output() timeOffsetAdjusted = new EventEmitter<TimeOffsetAdjustmentEvent>();
  @Output() draftUpdated = new EventEmitter<DraftUpdateEvent>();
  @Output() timeInputEditStarted = new EventEmitter<TimeInputEditEvent>();
  @Output() timeInputEditFinished = new EventEmitter<TimeInputMode>();
  @Output() timeInputKeydown = new EventEmitter<TimeInputKeydownEvent>();

  protected timePart(value: string, part: TimePart): string {
    const [hours = '00', minutes = '00', seconds = '00'] = value.replace(/^[+−-]/, '').split(':');

    return part === 'hours' ? hours : part === 'minutes' ? minutes : seconds;
  }
}
