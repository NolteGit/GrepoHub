import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToolboxTimerService } from '../../pages/toolbox/services/toolbox-timer.service';
import { appTestProviders } from '../../testing/app-test-providers';
import { AppShell } from './app-shell';

describe('AppShell timer queue indicator', () => {
  let fixture: ComponentFixture<AppShell>;
  let service: ToolboxTimerService;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [...appTestProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShell);
    service = TestBed.inject(ToolboxTimerService);
    fixture.detectChanges();
  });

  afterEach(() => {
    service.clearAlarm();
    service.resetCountdown();
    service.resetStopwatch();
    service.resetQueuedCountdowns();
    service.resetQueuedStopwatches();
    fixture.destroy();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('keeps the navbar timer indicator hidden while the queue is empty', () => {
    expect(timerButton()).toBeNull();
  });

  it('shows active queued timers in the navbar dropdown', () => {
    service.startCountdown(5_000);
    service.addCountdownToQueue(5_000, 'Harbor upgrade');
    fixture.detectChanges();

    const button = timerButton();

    expect(button).not.toBeNull();
    expect(button?.querySelector('.app-shell__timer-badge')?.textContent?.trim()).toBe('1');
    expect(button?.classList.contains('app-shell__timer-action--done')).toBe(false);

    button?.click();
    fixture.detectChanges();

    const menu = timerMenu();

    expect(menu?.textContent).toContain('Harbor upgrade');
    expect(menu?.textContent).toContain('00:00:05');
  });

  it('prioritizes finished timer notifications and removes them from the dropdown', () => {
    service.startCountdown(1_000);
    service.addCountdownToQueue(1_000, 'Senate upgrade');

    vi.advanceTimersByTime(1_100);
    fixture.detectChanges();

    const button = timerButton();
    const badge = button?.querySelector('.app-shell__timer-badge');

    expect(button?.classList.contains('app-shell__timer-action--done')).toBe(true);
    expect(badge?.classList.contains('app-shell__timer-badge--done')).toBe(true);
    expect(badge?.textContent?.trim()).toBe('1');

    button?.click();
    fixture.detectChanges();

    expect(timerMenu()?.textContent).toContain('Senate upgrade');
    expect(timerMenu()?.querySelector('[data-tone="done"]')).not.toBeNull();

    const removeButton = timerMenu()?.querySelector<HTMLButtonElement>(
      '.app-shell__timer-item-remove',
    );
    removeButton?.click();
    fixture.detectChanges();

    expect(timerButton()).toBeNull();
  });

  it('opens language choices from the navbar language dropdown', () => {
    const button = languageButton();

    expect(button).not.toBeNull();
    expect(button?.textContent?.trim()).toContain('EN');
    expect(languageMenu()).toBeNull();

    button?.click();
    fixture.detectChanges();

    const menu = languageMenu();
    const options = languageOptions();

    expect(menu).not.toBeNull();
    expect(menu?.textContent).toContain('English');
    expect(menu?.textContent).toContain('German');
    expect(menu?.textContent).toContain('French');
    expect(menu?.textContent).toContain('Dutch');
    expect(menu?.textContent).toContain('Italian');
    expect(options).toHaveLength(5);
    expect(options[0]?.getAttribute('aria-checked')).toBe('true');
    expect(options[1]?.getAttribute('aria-checked')).toBe('false');
    expect(options[2]?.getAttribute('aria-checked')).toBe('false');
    expect(options[3]?.getAttribute('aria-checked')).toBe('false');
    expect(options[4]?.getAttribute('aria-checked')).toBe('false');

    options[4]?.click();
    fixture.detectChanges();

    expect(languageMenu()).toBeNull();
    expect(languageButton()?.textContent?.trim()).toContain('IT');
  });

  function timerButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.app-shell__timer-action');
  }

  function timerMenu(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.app-shell__timer-menu');
  }

  function languageButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.app-shell__language-action');
  }

  function languageMenu(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.app-shell__language-menu');
  }

  function languageOptions(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.app-shell__language-option'));
  }
});
