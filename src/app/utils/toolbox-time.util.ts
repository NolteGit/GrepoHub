import type { TimePart } from '../models/toolbox.models';

export type TimeParts = [string, string, string];
export type NumericTimeParts = [number, number, number];
export type TimeOffsetFields = {
  offsetHours: string;
  offsetMinutes: string;
  offsetSeconds: string;
};

export function splitTimeParts(value: string): TimeParts {
  const [hours = '00', minutes = '00', seconds = '00'] = value.split(':');

  return [hours, minutes, seconds].map((part) => part.padStart(2, '0')) as TimeParts;
}

export function timePartIndex(part: TimePart): 0 | 1 | 2 {
  return part === 'hours' ? 0 : part === 'minutes' ? 1 : 2;
}

export function timePartMax(part: TimePart): number {
  return part === 'hours' ? 23 : 59;
}

export function clampClockPart(value: string, part: TimePart): string {
  return padClockValue(clampNumber(parseInteger(value), 0, timePartMax(part)));
}

export function parseTimeToSeconds(value: string): number {
  const [hours, minutes, seconds] = splitTimeParts(value);

  return normalizeDaySeconds(
    parseInteger(hours) * 3600 + parseInteger(minutes) * 60 + parseInteger(seconds),
  );
}

export function normalizeDaySeconds(value: number): number {
  const daySeconds = 24 * 60 * 60;

  return ((Math.round(value) % daySeconds) + daySeconds) % daySeconds;
}

export function normalizePositiveDelaySeconds(value: number): number {
  return value <= 0 ? value + 24 * 60 * 60 : value;
}

export function formatTimeFromSeconds(value: number): string {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  return joinTimeParts(hours, minutes, seconds);
}

export function padClockValue(value: number): string {
  return String(value).padStart(2, '0');
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function parseInteger(value: string): number {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
}

export function formatDurationMs(totalMs: number, includeMilliseconds = false): string {
  const safeMs = Math.max(0, Math.floor(totalMs));
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const base = joinTimeParts(hours, minutes, seconds);

  if (!includeMilliseconds) {
    return base;
  }

  return `${base}.${String(safeMs % 1000).padStart(3, '0')}`;
}

export function formatDateTimeValue(date: Date): string {
  return joinTimeParts(date.getHours(), date.getMinutes(), date.getSeconds());
}

export function getCurrentTimeValue(): string {
  return formatDateTimeValue(new Date());
}

export function normalizeAlarmTimeValue(value: string): string {
  const [hours, minutes, seconds] = splitTimeParts(value);

  return joinTimeParts(
    clampNumber(parseInteger(hours), 0, 23),
    clampNumber(parseInteger(minutes), 0, 59),
    clampNumber(parseInteger(seconds), 0, 59),
  );
}

export function digitsFromTimeString(value: string): string {
  return splitTimeParts(value).join('').replace(/\D/g, '').slice(-6).padStart(6, '0');
}

export function digitsFromSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.min(99, Math.floor(safeSeconds / 3600));
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return `${padClockValue(hours)}${padClockValue(minutes)}${padClockValue(seconds)}`;
}

export function parseTimeInputDigits(digits: string, maxHours: number): NumericTimeParts {
  const normalizedDigits = digits.replace(/\D/g, '').slice(-6).padStart(6, '0');

  return [
    clampNumber(parseInteger(normalizedDigits.slice(0, 2)), 0, maxHours),
    clampNumber(parseInteger(normalizedDigits.slice(2, 4)), 0, 59),
    clampNumber(parseInteger(normalizedDigits.slice(4, 6)), 0, 59),
  ];
}

export function joinTimeParts(hours: number, minutes: number, seconds: number): string {
  return [hours, minutes, seconds].map((part) => padClockValue(part)).join(':');
}

export function timeOffsetFieldsFromSeconds(totalSeconds: number): TimeOffsetFields {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.min(99, Math.floor(safeSeconds / 3600));
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return {
    offsetHours: String(hours),
    offsetMinutes: String(minutes),
    offsetSeconds: String(seconds),
  };
}
