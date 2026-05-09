import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

type ToolboxTimeZoneOption = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly timeZone?: string;
};

const TIME_ZONE_OPTIONS: readonly ToolboxTimeZoneOption[] = [
  { id: 'current', label: 'Current timezone', description: 'Your current browser timezone' },
  { id: 'utc', label: 'UTC', description: 'Coordinated Universal Time', timeZone: 'UTC' },
  { id: 'uk', label: 'GMT', description: 'United Kingdom', timeZone: 'Europe/London' },
  { id: 'eastern-europe', label: 'EET', description: 'Eastern Europe', timeZone: 'Europe/Athens' },
  { id: 'us-east', label: 'ET', description: 'US Eastern Time', timeZone: 'America/New_York' },
  { id: 'us-west', label: 'PT', description: 'US Pacific Time', timeZone: 'America/Los_Angeles' },
  { id: 'japan', label: 'JST', description: 'Japan Standard Time', timeZone: 'Asia/Tokyo' },
  { id: 'australia-east', label: 'AET', description: 'Australia Eastern Time', timeZone: 'Australia/Sydney' },
];

const CENTRAL_EUROPE_TIME_ZONES = new Set([
  'Europe/Amsterdam',
  'Europe/Andorra',
  'Europe/Belgrade',
  'Europe/Berlin',
  'Europe/Bratislava',
  'Europe/Brussels',
  'Europe/Budapest',
  'Europe/Copenhagen',
  'Europe/Gibraltar',
  'Europe/Ljubljana',
  'Europe/Luxembourg',
  'Europe/Madrid',
  'Europe/Malta',
  'Europe/Monaco',
  'Europe/Oslo',
  'Europe/Paris',
  'Europe/Podgorica',
  'Europe/Prague',
  'Europe/Rome',
  'Europe/San_Marino',
  'Europe/Sarajevo',
  'Europe/Skopje',
  'Europe/Stockholm',
  'Europe/Tirane',
  'Europe/Vatican',
  'Europe/Vienna',
  'Europe/Warsaw',
  'Europe/Zagreb',
  'Europe/Zurich',
]);

@Component({
  selector: 'app-toolbox-hero',
  imports: [TranslatePipe],
  templateUrl: './toolbox-hero.html',
  styleUrl: './toolbox-hero.scss',
})
export class ToolboxHeroComponent implements OnInit, OnDestroy {
  private clockInterval?: ReturnType<typeof setInterval>;

  readonly timeZoneOptions = TIME_ZONE_OPTIONS;
  readonly now = signal(new Date());
  readonly selectedTimeZoneId = signal(TIME_ZONE_OPTIONS[0].id);
  readonly activeTimeZone = computed(() => this.getTimeZoneOption(this.selectedTimeZoneId()));
  readonly currentTime = computed(() => this.formatTime(this.now(), this.activeTimeZone().timeZone));
  readonly currentIsoTime = computed(() => this.now().toISOString());
  readonly timeZoneDescription = computed(() => this.formatTimeZoneDescription(this.activeTimeZone()));

  ngOnInit(): void {
    this.clockInterval = setInterval(() => this.now.set(new Date()), 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  selectTimeZone(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nextOption = this.getTimeZoneOption(select.value);

    this.selectedTimeZoneId.set(nextOption.id);
  }

  timeZoneOptionLabel(option: ToolboxTimeZoneOption): string {
    return this.formatTimeZoneLabel(this.now(), option);
  }

  private getTimeZoneOption(id: string): ToolboxTimeZoneOption {
    return TIME_ZONE_OPTIONS.find((option) => option.id === id) ?? TIME_ZONE_OPTIONS[0];
  }

  private formatTime(date: Date, timeZone?: string): string {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone,
    }).format(date);
  }

  private formatTimeZoneDescription(option: ToolboxTimeZoneOption): string {
    const timeZone = option.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const label = this.formatTimeZoneLabel(this.now(), option);

    if (!timeZone) {
      return option.description;
    }

    return `${label} · ${option.description}: ${timeZone}`;
  }

  private formatTimeZoneLabel(date: Date, option: ToolboxTimeZoneOption): string {
    if (option.timeZone === 'UTC') {
      return 'UTC';
    }

    const timeZone = option.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const knownLabel = timeZone ? this.getKnownTimeZoneLabel(date, timeZone) : null;

    if (knownLabel) {
      return knownLabel;
    }

    if (!timeZone) {
      return option.label;
    }

    const timeZoneName = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value;

    return timeZoneName && !timeZoneName.startsWith('GMT') ? timeZoneName.replace(/\s+/g, '') : this.formatOffsetLabel(date, timeZone);
  }

  private getKnownTimeZoneLabel(date: Date, timeZone: string): string | null {
    const offset = this.getTimeZoneOffsetMinutes(date, timeZone);

    if (CENTRAL_EUROPE_TIME_ZONES.has(timeZone)) {
      return offset === 120 ? 'CEST' : 'CET';
    }

    if (timeZone === 'Europe/London') {
      return offset === 60 ? 'BST' : 'GMT';
    }

    if (timeZone === 'Europe/Athens') {
      return offset === 180 ? 'EEST' : 'EET';
    }

    if (timeZone === 'America/New_York') {
      return offset === -240 ? 'EDT' : 'EST';
    }

    if (timeZone === 'America/Los_Angeles') {
      return offset === -420 ? 'PDT' : 'PST';
    }

    if (timeZone === 'Asia/Tokyo') {
      return 'JST';
    }

    if (timeZone === 'Australia/Sydney') {
      return offset === 660 ? 'AEDT' : 'AEST';
    }

    return null;
  }

  private formatOffsetLabel(date: Date, timeZone: string): string {
    const offset = this.getTimeZoneOffsetMinutes(date, timeZone);

    if (offset === null) {
      return 'UTC';
    }

    if (offset === 0) {
      return 'UTC';
    }

    const sign = offset > 0 ? '+' : '-';
    const absoluteOffset = Math.abs(offset);
    const hours = Math.floor(absoluteOffset / 60);
    const minutes = absoluteOffset % 60;

    return minutes === 0 ? `UTC${sign}${hours}` : `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  private getTimeZoneOffsetMinutes(date: Date, timeZone: string): number | null {
    const offsetName = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value;

    if (!offsetName || offsetName === 'GMT') {
      return 0;
    }

    const match = offsetName.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

    if (!match) {
      return null;
    }

    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2]);
    const minutes = Number(match[3] ?? '0');

    return sign * (hours * 60 + minutes);
  }
}
