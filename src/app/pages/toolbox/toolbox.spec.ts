import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appTestProviders } from '../../testing/app-test-providers';
import { Toolbox } from './toolbox';
import {
  formatNumber,
  nextCalculatorDisplay,
  operatorSymbol,
  parseNumber,
  runCalculatorOperation,
} from './utils/toolbox-calculator.util';
import {
  clampClockPart,
  digitsFromSeconds,
  digitsFromTimeString,
  formatDateTimeValue,
  formatDurationMs,
  formatTimeFromSeconds,
  joinTimeParts,
  normalizeAlarmTimeValue,
  normalizeDaySeconds,
  normalizePositiveDelaySeconds,
  parseInteger,
  parseTimeInputDigits,
  parseTimeToSeconds,
  splitTimeParts,
  timeOffsetFieldsFromSeconds,
} from './utils/toolbox-time.util';
import type { ToolDraft } from './models/toolbox.models';

const calculatorDraft = (changes: Partial<ToolDraft>): ToolDraft => ({
  baseTime: '00:00:00',
  offsetHours: '0',
  offsetMinutes: '0',
  offsetSeconds: '0',
  timeDirection: 'add',
  calculatorDisplay: '0',
  calculatorStoredValue: '',
  calculatorPendingOperator: null,
  calculatorWaitingForNext: false,
  calculatorHistory: [],
  attackerPreset: '',
  defenderPreset: '',
  countdownMinutes: '0',
  countdownSeconds: '0',
  countdownLabel: '',
  stopwatchLabel: '',
  alarmTime: '00:00:00',
  alarmLabel: '',
  ...changes,
});

describe('Toolbox', () => {
  let component: Toolbox;
  let fixture: ComponentFixture<Toolbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toolbox],
      providers: [...appTestProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(Toolbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('toolbox calculator utilities', () => {
  it('runs calculator operations', () => {
    expect(runCalculatorOperation('add', 7, 3)).toBe(10);
    expect(runCalculatorOperation('subtract', 7, 3)).toBe(4);
    expect(runCalculatorOperation('multiply', 7, 3)).toBe(21);
    expect(runCalculatorOperation('divide', 7, 2)).toBe(3.5);
    expect(runCalculatorOperation('divide', 7, 0)).toBe(0);
  });

  it('formats calculator display values', () => {
    expect(formatNumber(12)).toBe('12');
    expect(formatNumber(1 / 3)).toBe('0.3333');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('0');
    expect(parseNumber('12.5')).toBe(12.5);
    expect(parseNumber('not-a-number')).toBe(0);
    expect(operatorSymbol('multiply')).toBe('×');
  });

  it('builds the next calculator display value', () => {
    expect(nextCalculatorDisplay(calculatorDraft({ calculatorDisplay: '0' }), '7')).toBe('7');
    expect(nextCalculatorDisplay(calculatorDraft({ calculatorDisplay: '12' }), '3')).toBe('123');
    expect(nextCalculatorDisplay(calculatorDraft({ calculatorWaitingForNext: true }), '.')).toBe(
      '0.',
    );
  });
});

describe('toolbox time utilities', () => {
  it('parses and normalizes clock values', () => {
    expect(splitTimeParts('7:8')).toEqual(['07', '08', '00']);
    expect(parseTimeToSeconds('23:59:59')).toBe(86399);
    expect(normalizeDaySeconds(86401)).toBe(1);
    expect(normalizeDaySeconds(-1)).toBe(86399);
    expect(normalizePositiveDelaySeconds(0)).toBe(86400);
  });

  it('formats time and duration values', () => {
    expect(formatTimeFromSeconds(3661)).toBe('01:01:01');
    expect(formatDurationMs(3661123)).toBe('01:01:01');
    expect(formatDurationMs(3661123, true)).toBe('01:01:01.123');
    expect(formatDateTimeValue(new Date(2026, 0, 1, 7, 8, 9))).toBe('07:08:09');
  });

  it('clamps and converts time values', () => {
    expect(clampClockPart('99', 'hours')).toBe('23');
    expect(clampClockPart('99', 'minutes')).toBe('59');
    expect(joinTimeParts(1, 2, 3)).toBe('01:02:03');
    expect(normalizeAlarmTimeValue('99:70:80')).toBe('23:59:59');
    expect(digitsFromTimeString('7:08:09')).toBe('070809');
    expect(digitsFromSeconds(3661)).toBe('010101');
    expect(parseTimeInputDigits('997080', 23)).toEqual([23, 59, 59]);
    expect(timeOffsetFieldsFromSeconds(3661)).toEqual({
      offsetHours: '1',
      offsetMinutes: '1',
      offsetSeconds: '1',
    });
  });

  it('parses non-negative integer values', () => {
    expect(parseInteger('12')).toBe(12);
    expect(parseInteger('-5')).toBe(0);
    expect(parseInteger('abc')).toBe(0);
  });
});
