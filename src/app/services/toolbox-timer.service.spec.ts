import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ToolboxTimerService } from './toolbox-timer.service';

describe('ToolboxTimerService', () => {
  it('creates an empty timer state without any UI component', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ToolboxTimerService);

    expect(service.overviewItems()).toEqual([]);
    expect(service.countdownRunning()).toBe(false);
    expect(service.stopwatchRunning()).toBe(false);
  });

  it('stores a manual stopwatch elapsed value independently from UI components', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ToolboxTimerService);

    service.setStopwatchElapsedMs(12_000);

    expect(service.currentMainStopwatchElapsedMs()).toBe(12_000);
  });
});
