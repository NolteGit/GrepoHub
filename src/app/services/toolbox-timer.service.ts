import { computed, inject, Injectable, signal } from '@angular/core';

import type {
  ActiveTimerItem,
  QueuedAlarm,
  QueuedCountdown,
  QueuedStopwatch,
} from '../models/toolbox.models';
import { formatDurationMs } from '../utils/toolbox-time.util';

import { BrowserStorageService } from './browser-storage.service';

type StoredTimerQueueState = {
  readonly queuedCountdowns?: readonly QueuedCountdown[];
  readonly queuedStopwatches?: readonly QueuedStopwatch[];
  readonly queuedAlarms?: readonly QueuedAlarm[];
};

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
      ...this.queuedCountdowns().map((countdown) => ({
        createdAt: countdown.createdAt ?? 0,
        item: this.queuedCountdownItem(countdown),
      })),
      ...this.queuedAlarms().map((alarm) => ({
        createdAt: alarm.createdAt ?? 0,
        item: this.queuedAlarmItem(alarm),
      })),
      ...this.queuedStopwatches().map((stopwatch) => ({
        createdAt: stopwatch.createdAt ?? 0,
        item: this.queuedStopwatchItem(stopwatch),
      })),
    ]
      .sort((left, right) => {
        const leftRank = left.item.tone === 'done' ? 0 : 1;
        const rightRank = right.item.tone === 'done' ? 0 : 1;

        return leftRank - rightRank || right.createdAt - left.createdAt;
      })
      .map((entry) => entry.item);
  });

  private readonly browserStorage = inject(BrowserStorageService);
  private countdownIntervalId: number | null = null;
  private countdownDeadline = 0;
  private stopwatchIntervalId: number | null = null;
  private stopwatchStartedAt = 0;
  private lastQueueDisplaySecond = 0;
  private readonly alarmTimeoutIds = new Map<string, number>();
  private readonly storageKey = 'grepo-hub.toolbox.timer-queue.v1';
  private readonly persistStateOnUnload = (): void => this.persistState();

  constructor() {
    this.restoreState();

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.persistStateOnUnload);
    }
  }

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

    const id = this.createQueueId('countdown');
    const running = this.countdownRunning();

    this.queuedCountdowns.update((items) => [
      ...items,
      {
        id,
        label,
        createdAt: Date.now(),
        remainingMs,
        deadline: running ? Date.now() + remainingMs : 0,
        running,
      },
    ]);

    this.resetCountdown();
    this.markQueueItemFresh(id);
    this.syncStopwatchInterval();
    this.persistState();

    return true;
  }

  addQueuedCountdown(durationMs: number, label: string, running = true): boolean {
    if (durationMs <= 0) {
      return false;
    }

    const now = Date.now();
    const id = this.createQueueId('countdown');

    this.queuedCountdowns.update((items) => [
      ...items,
      {
        id,
        label,
        createdAt: now,
        remainingMs: durationMs,
        deadline: running ? now + durationMs : 0,
        running,
      },
    ]);

    this.markQueueItemFresh(id);
    this.syncStopwatchInterval();
    this.persistState();

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

    const id = this.createQueueId('stopwatch');
    const running = this.stopwatchRunning();

    this.queuedStopwatches.update((items) => [
      ...items,
      {
        id,
        label,
        createdAt: Date.now(),
        elapsedMs,
        startedAt: Date.now(),
        running,
      },
    ]);

    this.stopwatchRunning.set(false);
    this.stopwatchElapsedMs.set(0);
    this.markQueueItemFresh(id);
    this.syncStopwatchInterval();
    this.persistState();

    return true;
  }

  addQueuedStopwatch(label: string, running = true, elapsedMs = 0): boolean {
    const now = Date.now();
    const id = this.createQueueId('stopwatch');
    const safeElapsedMs = Math.max(0, elapsedMs);

    this.queuedStopwatches.update((items) => [
      ...items,
      {
        id,
        label,
        createdAt: now,
        elapsedMs: safeElapsedMs,
        startedAt: now,
        running,
      },
    ]);

    this.markQueueItemFresh(id);
    this.syncStopwatchInterval();
    this.persistState();

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
    this.persistState();
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
    this.persistState();
  }

  removeQueuedCountdown(itemId: string): void {
    this.queuedCountdowns.update((items) => items.filter((countdown) => countdown.id !== itemId));
    this.syncStopwatchInterval();
    this.persistState();
  }

  removeQueuedStopwatch(itemId: string): void {
    this.queuedStopwatches.update((items) => items.filter((stopwatch) => stopwatch.id !== itemId));
    this.syncStopwatchInterval();
    this.persistState();
  }

  armAlarm(label: string, time: string, deadline: number): void {
    const now = Date.now();
    const id = this.createQueueId('alarm');
    const alarm: QueuedAlarm = {
      id,
      label,
      createdAt: now,
      time,
      deadline,
      running: true,
      triggered: false,
    };

    this.queuedAlarms.update((items) => [...items, alarm]);
    this.scheduleQueuedAlarm(alarm);
    this.markQueueItemFresh(id);
    this.persistState();
  }

  clearAlarm(): void {
    this.clearAlarmTimeouts();
    this.queuedAlarms.set([]);
    this.persistState();
  }

  removeQueuedAlarm(itemId: string): void {
    this.clearAlarmTimeout(itemId);
    this.queuedAlarms.update((items) => items.filter((alarm) => alarm.id !== itemId));
    this.persistState();
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
    this.persistState();
  }

  resetQueuedStopwatches(): void {
    this.queuedStopwatches.set([]);
    this.syncStopwatchInterval();
    this.persistState();
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

    if (alarm.triggered || alarm.deadline <= Date.now()) {
      this.queuedAlarms.update((items) =>
        items.map((item) =>
          item.id === alarm.id ? { ...item, running: false, triggered: true } : item,
        ),
      );
      return;
    }

    const timeoutId = window.setTimeout(
      () => {
        this.queuedAlarms.update((items) =>
          items.map((item) =>
            item.id === alarm.id ? { ...item, running: false, triggered: true } : item,
          ),
        );
        this.alarmTimeoutIds.delete(alarm.id);
        this.markQueueItemFresh(alarm.id);
        this.persistState();
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
    const finishedIds = this.queuedCountdowns()
      .filter((countdown) => countdown.running && countdown.deadline <= now)
      .map((countdown) => countdown.id);

    if (finishedIds.length === 0) {
      return;
    }

    this.queuedCountdowns.update((items) =>
      items.map((item) =>
        finishedIds.includes(item.id) ? { ...item, remainingMs: 0, running: false } : item,
      ),
    );
    finishedIds.forEach((itemId) => this.markQueueItemFresh(itemId));
    this.persistState();
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

  private restoreState(): void {
    const storedState = this.readStoredState();

    if (!storedState) {
      return;
    }

    const now = Date.now();

    this.queuedCountdowns.set(
      [...(storedState.queuedCountdowns ?? [])]
        .filter((countdown) => countdown.id && countdown.label)
        .map((countdown) => {
          const remainingMs = countdown.running
            ? Math.max(0, countdown.deadline - now)
            : Math.max(0, countdown.remainingMs);
          const running = Boolean(countdown.running) && remainingMs > 0;

          return {
            ...countdown,
            createdAt: countdown.createdAt ?? now,
            remainingMs,
            deadline: running ? now + remainingMs : 0,
            running,
          };
        }),
    );

    this.queuedStopwatches.set(
      [...(storedState.queuedStopwatches ?? [])]
        .filter((stopwatch) => stopwatch.id && stopwatch.label)
        .map((stopwatch) => ({
          ...stopwatch,
          createdAt: stopwatch.createdAt ?? now,
          elapsedMs: Math.max(0, stopwatch.elapsedMs),
          startedAt: stopwatch.running ? stopwatch.startedAt || now : 0,
          running: Boolean(stopwatch.running),
        })),
    );

    this.queuedAlarms.set(
      [...(storedState.queuedAlarms ?? [])]
        .filter((alarm) => alarm.id && alarm.label)
        .map((alarm) => {
          const triggered = Boolean(alarm.triggered) || alarm.deadline <= now;

          return {
            ...alarm,
            createdAt: alarm.createdAt ?? now,
            running: !triggered && Boolean(alarm.running),
            triggered,
          };
        }),
    );

    this.queuedAlarms()
      .filter((alarm) => alarm.running)
      .forEach((alarm) => this.scheduleQueuedAlarm(alarm));
    this.syncStopwatchInterval();
  }

  private readStoredState(): StoredTimerQueueState | null {
    const rawState = this.browserStorage.getItem(this.storageKey);

    if (!rawState) {
      return null;
    }

    try {
      const parsedState: unknown = JSON.parse(rawState);

      if (!parsedState || typeof parsedState !== 'object') {
        return null;
      }

      return parsedState as StoredTimerQueueState;
    } catch {
      return null;
    }
  }

  private persistState(): void {
    const now = Date.now();
    const state: StoredTimerQueueState = {
      queuedCountdowns: this.queuedCountdowns().map((countdown) => ({
        ...countdown,
        remainingMs: this.queuedCountdownRemainingMs(countdown),
      })),
      queuedStopwatches: this.queuedStopwatches().map((stopwatch) => ({
        ...stopwatch,
        elapsedMs: this.queuedStopwatchElapsedMs(stopwatch),
        startedAt: stopwatch.running ? now : stopwatch.startedAt,
      })),
      queuedAlarms: this.queuedAlarms(),
    };

    this.browserStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  private createQueueId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
