import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appTestProviders } from '../../../testing/app-test-providers';
import { Toolbox } from '../toolbox';
import { ToolboxTimerService } from './toolbox-timer.service';

describe('ToolboxTimerService', () => {
  let service: ToolboxTimerService;
  let fixture: ComponentFixture<Toolbox> | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toolbox],
      providers: [...appTestProviders],
    }).compileComponents();

    service = TestBed.inject(ToolboxTimerService);
    fixture = TestBed.createComponent(Toolbox);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    service.clearAlarm();
    service.resetCountdown();
    service.resetStopwatch();
    service.resetQueuedCountdowns();
    service.resetQueuedStopwatches();
    fixture?.destroy();
    fixture = null;
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('keeps queued countdowns running after the toolbox component is destroyed', () => {
    service.startCountdown(5_000);
    service.addCountdownToQueue(5_000, 'Harbor lock');

    expect(service.queuedCountdowns()).toHaveLength(1);
    expect(service.queuedCountdowns()[0].running).toBe(true);

    fixture?.destroy();
    fixture = null;
    vi.advanceTimersByTime(5_100);

    const [countdown] = service.queuedCountdowns();
    expect(countdown.running).toBe(false);
    expect(service.queuedCountdownRemainingMs(countdown)).toBe(0);
  });

  it('keeps queued alarms armed after the toolbox component is destroyed', () => {
    service.armAlarm('Night attack', '12:00:01', Date.now() + 1_000);

    expect(service.queuedAlarms()).toHaveLength(1);
    expect(service.queuedAlarms()[0].running).toBe(true);

    fixture?.destroy();
    fixture = null;
    vi.advanceTimersByTime(1_100);

    expect(service.queuedAlarms()[0]).toEqual(
      expect.objectContaining({
        running: false,
        triggered: true,
      }),
    );
  });

  it('keeps queued stopwatches accumulating after the toolbox component is destroyed', () => {
    service.startStopwatch();
    vi.advanceTimersByTime(2_000);
    service.addStopwatchToQueue('Build window');

    const [stopwatch] = service.queuedStopwatches();
    expect(stopwatch.running).toBe(true);
    expect(service.queuedStopwatchElapsedMs(stopwatch)).toBe(2_000);

    fixture?.destroy();
    fixture = null;
    vi.advanceTimersByTime(3_000);

    expect(service.queuedStopwatchElapsedMs(service.queuedStopwatches()[0])).toBe(5_000);
  });
});
