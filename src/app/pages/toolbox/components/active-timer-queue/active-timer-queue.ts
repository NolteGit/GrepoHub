import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ActiveTimerItem } from '../../models/toolbox.models';

@Component({
  selector: 'app-active-timer-queue',
  templateUrl: './active-timer-queue.html',
  styleUrl: './active-timer-queue.scss',
})
export class ActiveTimerQueueComponent {
  @Input() items: ActiveTimerItem[] = [];
  @Input() freshItemIds: string[] = [];

  @Output() itemRemoved = new EventEmitter<ActiveTimerItem>();
  @Output() itemToggled = new EventEmitter<ActiveTimerItem>();

  protected isQueueItemFresh(itemId: string): boolean {
    return this.freshItemIds.includes(itemId);
  }

  protected queueToggleLabel(item: ActiveTimerItem): string {
    return item.running ? 'Pause' : 'Start';
  }

  protected canToggleQueueItem(item: ActiveTimerItem): boolean {
    return item.type !== 'alarm' && item.tone !== 'done';
  }
}
