import { Component, computed, input } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhIconButton } from '../../../../shared/ui/gh-icon-button/gh-icon-button';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';
import { GhStatRow } from '../../../../shared/ui/gh-stat-row/gh-stat-row';

import { PlannerMode } from '../planner-mode-switch/planner-mode-switch';

import type {
  SidebarPopulationStats,
  SidebarPreviewStat,
  SidebarTroopTransportStats,
  SidebarUsedUnit,
  TranslatableText,
} from '../../planner-v2.models';

type SidebarStat = TranslatableText & {
  readonly value: string | number;
};

type PopulationBreakdown = {
  readonly capacity: string;
  readonly freeCapacity: string;
};

type PopulationSegment = TranslatableText & {
  readonly id: 'buildings' | 'troops' | 'free';
  readonly rawValue: number;
  readonly value: string;
  readonly color: string;
  readonly valueColor: string;
  readonly strokeDasharray: string;
  readonly strokeDashoffset: number;
};

const buildingsColor = '#f0bf45';
const troopsColor = '#cf453e';
const freeColor = '#236fca';
const donutRadius = 40;
const donutCircumference = 2 * Math.PI * donutRadius;

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

@Component({
  selector: 'app-planner-summary-sidebar',
  imports: [TranslatePipe, GhIconButton, GhPanel, GhStatRow],
  templateUrl: './planner-summary-sidebar.html',
})
export class PlannerSummarySidebar {
  readonly activeMode = input.required<PlannerMode>();
  readonly population = input.required<SidebarPopulationStats>();
  readonly usedUnitCount = input.required<number>();
  readonly cityPreviewStats = input.required<readonly SidebarPreviewStat[]>();
  readonly topUsedUnits = input.required<readonly SidebarUsedUnit[]>();
  readonly troopTransport = input.required<SidebarTroopTransportStats>();

  protected readonly populationTitleKey = 'plannerV2.summary.populationTitle';
  protected readonly populationTitleFallback = 'Shared Population Summary';
  protected readonly infoLabelKey = 'plannerV2.summary.infoLabel';
  protected readonly infoLabelFallback = 'More information';
  protected readonly capacityLabelKey = 'plannerV2.summary.currentMaxCapacity';
  protected readonly capacityLabelFallback = 'Current / Max Capacity';
  protected readonly contextTitle = computed<TranslatableText>(() =>
    this.activeMode() === 'city'
      ? {
          labelKey: 'plannerV2.summary.context.cityPreview',
          fallback: 'City Plan Preview',
        }
      : {
          labelKey: 'plannerV2.summary.context.troopPreview',
          fallback: 'Troop Plan Preview',
        },
  );
  protected readonly populationBreakdown = computed<PopulationBreakdown>(() => ({
    capacity: formatNumber(this.population().populationCapacity),
    freeCapacity: formatNumber(this.population().freePopulationAfterTroops),
  }));
  protected readonly populationSegments = computed<readonly PopulationSegment[]>(() => {
    const values = [
      {
        id: 'buildings' as const,
        labelKey: 'plannerV2.summary.chart.buildings',
        fallback: 'Buildings',
        rawValue: Math.max(0, this.population().usedPopulation),
        color: buildingsColor,
        valueColor: 'var(--gh-text)',
      },
      {
        id: 'troops' as const,
        labelKey: 'plannerV2.summary.chart.troops',
        fallback: 'Troops',
        rawValue: Math.max(0, this.population().troopPopulation),
        color: troopsColor,
        valueColor: 'var(--gh-text)',
      },
      {
        id: 'free' as const,
        labelKey: 'plannerV2.summary.chart.free',
        fallback: 'Free',
        rawValue: Math.max(0, this.population().freePopulationAfterTroops),
        color: freeColor,
        valueColor: 'var(--gh-text)',
      },
    ];
    const total = values.reduce((sum, segment) => sum + segment.rawValue, 0);
    const capacity = Math.max(this.population().populationCapacity, total, 1);
    let offset = 0;

    return values.map((segment) => {
      const length = (segment.rawValue / capacity) * donutCircumference;
      const strokeDasharray = `${length} ${donutCircumference - length}`;
      const strokeDashoffset = -offset;

      offset += length;

      return {
        ...segment,
        value: formatNumber(segment.rawValue),
        valueColor: segment.rawValue > 0 ? segment.valueColor : 'var(--gh-muted)',
        strokeDasharray,
        strokeDashoffset,
      };
    });
  });
  protected readonly transportRows = computed<readonly SidebarStat[]>(() => [
    {
      labelKey: 'plannerV2.summary.transportSpace',
      fallback: 'Transport space',
      value: this.troopTransport().transportSpace,
    },
    {
      labelKey: 'plannerV2.summary.transportCapacity',
      fallback: 'Transport capacity',
      value: this.troopTransport().transportCapacity,
    },
    {
      labelKey: 'plannerV2.summary.transportBalance',
      fallback: 'Transport balance',
      value: this.troopTransport().transportBalance,
    },
    {
      labelKey: 'plannerV2.summary.bunksBonus',
      fallback: 'Bunks bonus',
      value: this.troopTransport().bunksBonus,
    },
  ]);
}
