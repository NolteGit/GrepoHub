import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ActiveTimerItem } from '../../models/toolbox.models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-active-timer-queue',
  imports: [TranslatePipe],
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

  protected queueToggleLabelKey(item: ActiveTimerItem): string {
    return item.running ? 'toolbox.queue.pause' : 'toolbox.queue.start';
  }

  protected canToggleQueueItem(item: ActiveTimerItem): boolean {
    return item.type !== 'alarm' && item.tone !== 'done';
  }
}
