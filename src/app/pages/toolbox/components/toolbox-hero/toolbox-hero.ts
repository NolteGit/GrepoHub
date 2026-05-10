import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { TranslationService } from '../../../../services/translation.service';

type ToolboxTimeZoneOption = {
  readonly id: string;
  readonly label: string;
  readonly labelKey: string;
  readonly description: string;
  readonly descriptionKey: string;
  readonly timeZone?: string;
};

const TIME_ZONE_OPTIONS: readonly ToolboxTimeZoneOption[] = [
  {
    id: 'current',
    label: 'Current timezone',
    labelKey: 'toolbox.clock.zone.current.label',
    description: 'Your current browser timezone',
    descriptionKey: 'toolbox.clock.zone.current.description',
  },
  {
    id: 'utc',
    label: 'UTC',
    labelKey: 'toolbox.clock.zone.utc.label',
    description: 'Coordinated Universal Time',
    descriptionKey: 'toolbox.clock.zone.utc.description',
    timeZone: 'UTC',
  },
  {
    id: 'uk',
    label: 'GMT',
    labelKey: 'toolbox.clock.zone.uk.label',
    description: 'United Kingdom',
    descriptionKey: 'toolbox.clock.zone.uk.description',
    timeZone: 'Europe/London',
  },
  {
    id: 'eastern-europe',
    label: 'EET',
    labelKey: 'toolbox.clock.zone.easternEurope.label',
    description: 'Eastern Europe',
    descriptionKey: 'toolbox.clock.zone.easternEurope.description',
    timeZone: 'Europe/Athens',
  },
  {
    id: 'us-east',
    label: 'ET',
    labelKey: 'toolbox.clock.zone.usEast.label',
    description: 'US Eastern Time',
    descriptionKey: 'toolbox.clock.zone.usEast.description',
    timeZone: 'America/New_York',
  },
  {
    id: 'us-west',
    label: 'PT',
    labelKey: 'toolbox.clock.zone.usWest.label',
    description: 'US Pacific Time',
    descriptionKey: 'toolbox.clock.zone.usWest.description',
    timeZone: 'America/Los_Angeles',
  },
  {
    id: 'japan',
    label: 'JST',
    labelKey: 'toolbox.clock.zone.japan.label',
    description: 'Japan Standard Time',
    descriptionKey: 'toolbox.clock.zone.japan.description',
    timeZone: 'Asia/Tokyo',
  },
  {
    id: 'australia-east',
    label: 'AET',
    labelKey: 'toolbox.clock.zone.australiaEast.label',
    description: 'Australia Eastern Time',
    descriptionKey: 'toolbox.clock.zone.australiaEast.description',
    timeZone: 'Australia/Sydney',
  },
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
  private readonly translationService = inject(TranslationService);
  private clockInterval?: ReturnType<typeof setInterval>;

  readonly timeZoneOptions = TIME_ZONE_OPTIONS;
  readonly now = signal(new Date());
  readonly selectedTimeZoneId = signal(TIME_ZONE_OPTIONS[0].id);
  readonly activeTimeZone = computed(() => this.getTimeZoneOption(this.selectedTimeZoneId()));
  readonly currentTime = computed(() =>
    this.formatTime(this.now(), this.activeTimeZone().timeZone),
  );
  readonly currentIsoTime = computed(() => this.now().toISOString());
  readonly timeZoneDescription = computed(() =>
    this.formatTimeZoneDescription(this.activeTimeZone()),
  );

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
    const description = this.translationService.translate(
      option.descriptionKey,
      option.description,
    );

    if (!timeZone) {
      return description;
    }

    return `${label} · ${description}: ${timeZone}`;
  }

  private formatTimeZoneLabel(date: Date, option: ToolboxTimeZoneOption): string {
    if (option.timeZone === 'UTC') {
      return this.translationService.translate(option.labelKey, option.label);
    }

    const timeZone = option.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const knownLabel = timeZone ? this.getKnownTimeZoneLabel(date, timeZone) : null;

    if (knownLabel) {
      return knownLabel;
    }

    if (!timeZone) {
      return this.translationService.translate(option.labelKey, option.label);
    }

    const timeZoneName = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value;

    return timeZoneName && !timeZoneName.startsWith('GMT')
      ? timeZoneName.replace(/\s+/g, '')
      : this.formatOffsetLabel(date, timeZone);
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

    return minutes === 0
      ? `UTC${sign}${hours}`
      : `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
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
