import { computed, Injectable, signal } from '@angular/core';

import type {
  ActiveTimerItem,
  QueuedAlarm,
  QueuedCountdown,
  QueuedStopwatch,
} from '../models/toolbox.models';
import { formatDurationMs } from '../utils/toolbox-time.util';

@Injectable({ providedIn: 'root' })
export class ToolboxTimerService {
  readonly countdownRemainingMs = signal<number | null>(null);
  readonly countdownRunning = signal(false);
  readonly stopwatchElapsedMs = signal(0);
  readonly stopwatchRunning = signal(false);
  readonly queuedCountdowns = signal<QueuedCountdown[]>([]);
  readonly queuedStopwatches = signal<QueuedStopwatch[]>([]);
  readonly queuedAlarms = signal<QueuedAlarm[]>([]);
  readonly stopwatchTick = signal(0);
  readonly queueDisplayTick = signal(0);
  readonly freshQueueItemIds = signal<string[]>([]);
  readonly overviewItems = computed<ActiveTimerItem[]>(() => {
    this.queueDisplayTick();

    return [
      ...this.queuedCountdowns().map((countdown) => this.queuedCountdownItem(countdown)),
      ...this.queuedAlarms().map((alarm) => this.queuedAlarmItem(alarm)),
      ...this.queuedStopwatches().map((stopwatch) => this.queuedStopwatchItem(stopwatch)),
    ];
  });

  private countdownIntervalId: number | null = null;
  private countdownDeadline = 0;
  private stopwatchIntervalId: number | null = null;
  private stopwatchStartedAt = 0;
  private lastQueueDisplaySecond = 0;
  private readonly alarmTimeoutIds = new Map<string, number>();

  toggleCountdown(durationMs: number): void {
    if (this.countdownRunning()) {
      this.pauseCountdown();
      return;
    }

    this.startCountdown(durationMs);
  }

  startCountdown(durationMs: number): void {
    if (this.countdownRunning()) {
      return;
    }

    const startingMs = this.countdownRemainingMs() || durationMs;

    if (startingMs <= 0) {
      return;
    }

    this.countdownDeadline = Date.now() + startingMs;
    this.countdownRemainingMs.set(startingMs);
    this.countdownRunning.set(true);
    this.startCountdownInterval();
  }

  pauseCountdown(): void {
    this.clearCountdownInterval();
    this.countdownRunning.set(false);
  }

  resetCountdown(): void {
    this.clearCountdownInterval();
    this.countdownRunning.set(false);
    this.countdownRemainingMs.set(null);
  }

  clearCountdownRemainingIfIdle(): void {
    if (!this.countdownRunning()) {
      this.countdownRemainingMs.set(null);
    }
  }

  addCountdownToQueue(durationMs: number, label: string): boolean {
    const remainingMs = this.countdownRemainingMs() ?? durationMs;

    if (remainingMs <= 0) {
      return false;
    }

    const id = `countdown-${Date.now()}`;
    const running = this.countdownRunning();

    this.queuedCountdowns.update((items) => [
      ...items,
      {
        id,
        label,
        remainingMs,
        deadline: running ? Date.now() + remainingMs : 0,
        running,
      },
    ]);

    this.resetCountdown();
    this.markQueueItemFresh(id);
    this.syncStopwatchInterval();

    return true;
  }

  toggleStopwatch(): void {
    if (this.stopwatchRunning()) {
      this.pauseStopwatch();
      return;
    }

    this.startStopwatch();
  }

  startStopwatch(): void {
    if (this.stopwatchRunning()) {
      return;
    }

    this.stopwatchStartedAt = Date.now() - this.stopwatchElapsedMs();
    this.stopwatchRunning.set(true);
    this.syncStopwatchInterval();
  }

  pauseStopwatch(): void {
    if (this.stopwatchRunning()) {
      this.stopwatchElapsedMs.set(this.currentMainStopwatchElapsedMs());
    }

    this.stopwatchRunning.set(false);
    this.syncStopwatchInterval();
  }

  resetStopwatch(): void {
    this.stopwatchRunning.set(false);
    this.stopwatchElapsedMs.set(0);
    this.syncStopwatchInterval();
  }

  addStopwatchToQueue(label: string): boolean {
    const elapsedMs = this.currentMainStopwatchElapsedMs();

    if (elapsedMs <= 0) {
      return false;
    }

    const id = `stopwatch-${Date.now()}`;
    const running = this.stopwatchRunning();

    this.queuedStopwatches.update((items) => [
      ...items,
      {
        id,
        label,
        elapsedMs,
        startedAt: Date.now(),
        running,
      },
    ]);

    this.stopwatchRunning.set(false);
    this.stopwatchElapsedMs.set(0);
    this.markQueueItemFresh(id);
    this.syncStopwatchInterval();

    return true;
  }

  setStopwatchElapsedMs(elapsedMs: number): void {
    if (this.stopwatchRunning()) {
      return;
    }

    this.stopwatchElapsedMs.set(Math.max(0, elapsedMs));
  }

  toggleQueuedStopwatch(itemId: string): void {
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

  toggleQueuedCountdown(itemId: string): void {
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

  removeQueuedCountdown(itemId: string): void {
    this.queuedCountdowns.update((items) => items.filter((countdown) => countdown.id !== itemId));
    this.syncStopwatchInterval();
  }

  removeQueuedStopwatch(itemId: string): void {
    this.queuedStopwatches.update((items) => items.filter((stopwatch) => stopwatch.id !== itemId));
    this.syncStopwatchInterval();
  }

  armAlarm(label: string, time: string, deadline: number): void {
    const id = `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const alarm: QueuedAlarm = {
      id,
      label,
      time,
      deadline,
      running: true,
      triggered: false,
    };

    this.queuedAlarms.update((items) => [...items, alarm]);
    this.scheduleQueuedAlarm(alarm);
    this.markQueueItemFresh(id);
  }

  clearAlarm(): void {
    this.clearAlarmTimeouts();
    this.queuedAlarms.set([]);
  }

  removeQueuedAlarm(itemId: string): void {
    this.clearAlarmTimeout(itemId);
    this.queuedAlarms.update((items) => items.filter((alarm) => alarm.id !== itemId));
  }

  removeOverviewItem(item: ActiveTimerItem): void {
    if (item.type === 'countdown-queue') {
      this.removeQueuedCountdown(item.id);
      return;
    }

    if (item.type === 'alarm') {
      this.removeQueuedAlarm(item.id);
      return;
    }

    if (item.type === 'stopwatch-queue') {
      this.removeQueuedStopwatch(item.id);
    }
  }

  toggleOverviewItem(item: ActiveTimerItem): void {
    if (item.tone === 'done') {
      return;
    }

    if (item.type === 'countdown-queue') {
      this.toggleQueuedCountdown(item.id);
      return;
    }

    if (item.type === 'stopwatch-queue') {
      this.toggleQueuedStopwatch(item.id);
    }
  }

  resetQueuedCountdowns(): void {
    this.queuedCountdowns.set([]);
    this.syncStopwatchInterval();
  }

  resetQueuedStopwatches(): void {
    this.queuedStopwatches.set([]);
    this.syncStopwatchInterval();
  }

  currentMainStopwatchElapsedMs(): number {
    return this.stopwatchRunning()
      ? Math.max(0, Date.now() - this.stopwatchStartedAt)
      : this.stopwatchElapsedMs();
  }

  queuedCountdownRemainingMs(countdown: QueuedCountdown): number {
    return countdown.running ? Math.max(0, countdown.deadline - Date.now()) : countdown.remainingMs;
  }

  queuedStopwatchElapsedMs(stopwatch: QueuedStopwatch): number {
    return stopwatch.running
      ? stopwatch.elapsedMs + Math.max(0, Date.now() - stopwatch.startedAt)
      : stopwatch.elapsedMs;
  }

  formatQueuedCountdownValue(countdown: QueuedCountdown): string {
    return formatDurationMs(this.queuedCountdownRemainingMs(countdown));
  }

  formatQueuedStopwatchValue(stopwatch: QueuedStopwatch): string {
    return formatDurationMs(this.queuedStopwatchElapsedMs(stopwatch), true);
  }

  private queuedCountdownItem(countdown: QueuedCountdown): ActiveTimerItem {
    const remainingMs = this.queuedCountdownRemainingMs(countdown);

    return {
      id: countdown.id,
      type: 'countdown-queue',
      label: countdown.label,
      value: formatDurationMs(remainingMs),
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
      value: formatDurationMs(this.queuedStopwatchElapsedMs(stopwatch)),
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
    this.updateQueueDisplayTick();

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
        this.updateQueueDisplayTick();

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

  private updateQueueDisplayTick(): void {
    const currentSecond = Math.floor(Date.now() / 1000);

    if (currentSecond === this.lastQueueDisplaySecond) {
      return;
    }

    this.lastQueueDisplaySecond = currentSecond;
    this.queueDisplayTick.update((tick) => tick + 1);
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

  private markQueueItemFresh(itemId: string): void {
    this.freshQueueItemIds.update((ids) => (ids.includes(itemId) ? ids : [...ids, itemId]));

    window.setTimeout(() => {
      this.freshQueueItemIds.update((ids) => ids.filter((currentId) => currentId !== itemId));
    }, 1200);
  }
}
