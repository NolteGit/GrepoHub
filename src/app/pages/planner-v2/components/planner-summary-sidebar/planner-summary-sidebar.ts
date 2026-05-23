import { Component, computed, input } from '@angular/core';

import { getBattleIconPath } from '../../../../data/asset-paths';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhIconButton } from '../../../../shared/ui/gh-icon-button/gh-icon-button';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';

import type {
  SidebarPopulationStats,
  SidebarTroopBattleStats,
  SidebarUsedUnit,
  TranslatableText,
} from '../../planner-v2.models';

type PopulationBreakdown = {
  readonly capacity: string;
  readonly freeCapacity: string;
};

type DonutSegment = TranslatableText & {
  readonly id: string;
  readonly rawValue: number;
  readonly value: string;
  readonly color: string;
  readonly valueColor: string;
  readonly strokeDasharray: string;
  readonly strokeDashoffset: number;
};

type BattleStatCell = TranslatableText & {
  readonly id: string;
  readonly iconPath: string;
  readonly value: string;
};

type BattleStatRow = {
  readonly id: 'offense' | 'defense';
  readonly labelKey: string;
  readonly fallback: string;
  readonly stats: readonly BattleStatCell[];
};

const buildingsColor = '#f0bf45';
const troopsColor = '#cf453e';
const freeColor = '#236fca';
const donutRadius = 40;
const donutCircumference = 2 * Math.PI * donutRadius;

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

const createDonutSegments = <
  T extends TranslatableText & { id: string; rawValue: number; color: string },
>(
  values: readonly T[],
  capacity: number,
): readonly DonutSegment[] => {
  let offset = 0;

  return values.map((segment) => {
    const length = (segment.rawValue / capacity) * donutCircumference;
    const strokeDasharray = `${length} ${donutCircumference - length}`;
    const strokeDashoffset = -offset;

    offset += length;

    return {
      ...segment,
      value: formatNumber(segment.rawValue),
      valueColor: segment.rawValue > 0 ? 'var(--gh-text)' : 'var(--gh-muted)',
      strokeDasharray,
      strokeDashoffset,
    };
  });
};

@Component({
  selector: 'app-planner-summary-sidebar',
  imports: [TranslatePipe, GhIconButton, GhPanel],
  templateUrl: './planner-summary-sidebar.html',
})
export class PlannerSummarySidebar {
  readonly population = input.required<SidebarPopulationStats>();
  readonly topUsedUnits = input.required<readonly SidebarUsedUnit[]>();
  readonly troopBattleStats = input.required<SidebarTroopBattleStats>();

  protected readonly populationTitleKey = 'plannerV2.summary.populationTitle';
  protected readonly populationTitleFallback = 'Shared Population Summary';
  protected readonly infoLabelKey = 'plannerV2.summary.infoLabel';
  protected readonly infoLabelFallback = 'More information';
  protected readonly battleTitleKey = 'plannerV2.summary.context.battleStats';
  protected readonly battleTitleFallback = 'Battle Stats';
  protected readonly topUnitsTitleKey = 'plannerV2.summary.context.mostUsedUnits';
  protected readonly topUnitsTitleFallback = 'Most Used Units';
  protected readonly populationBreakdown = computed<PopulationBreakdown>(() => ({
    capacity: formatNumber(this.population().populationCapacity),
    freeCapacity: formatNumber(this.population().freePopulationAfterTroops),
  }));
  protected readonly populationSegments = computed<readonly DonutSegment[]>(() => {
    const values = [
      {
        id: 'buildings',
        labelKey: 'plannerV2.summary.chart.buildings',
        fallback: 'Buildings',
        rawValue: Math.max(0, this.population().usedPopulation),
        color: buildingsColor,
      },
      {
        id: 'troops',
        labelKey: 'plannerV2.summary.chart.troops',
        fallback: 'Troops',
        rawValue: Math.max(0, this.population().troopPopulation),
        color: troopsColor,
      },
      {
        id: 'free',
        labelKey: 'plannerV2.summary.chart.free',
        fallback: 'Free',
        rawValue: Math.max(0, this.population().freePopulationAfterTroops),
        color: freeColor,
      },
    ];
    const total = values.reduce((sum, segment) => sum + segment.rawValue, 0);
    const capacity = Math.max(this.population().populationCapacity, total, 1);

    return createDonutSegments(values, capacity);
  });
  protected readonly battleRows = computed<readonly BattleStatRow[]>(() => {
    const stats = this.troopBattleStats();

    return [
      {
        id: 'offense',
        labelKey: 'plannerV2.summary.offenseShort',
        fallback: 'OFF',
        stats: [
          {
            id: 'attackBlunt',
            labelKey: 'plannerV2.summary.attackBlunt',
            fallback: 'Blunt attack',
            iconPath: getBattleIconPath('attackBlunt'),
            value: formatNumber(stats.attackBlunt),
          },
          {
            id: 'attackSharp',
            labelKey: 'plannerV2.summary.attackSharp',
            fallback: 'Sharp attack',
            iconPath: getBattleIconPath('attackSharp'),
            value: formatNumber(stats.attackSharp),
          },
          {
            id: 'attackDistance',
            labelKey: 'plannerV2.summary.attackDistance',
            fallback: 'Distance attack',
            iconPath: getBattleIconPath('attackDistance'),
            value: formatNumber(stats.attackDistance),
          },
          {
            id: 'attackSea',
            labelKey: 'plannerV2.summary.attackSea',
            fallback: 'Naval attack',
            iconPath: getBattleIconPath('attackSea'),
            value: formatNumber(stats.attackSea),
          },
        ],
      },
      {
        id: 'defense',
        labelKey: 'plannerV2.summary.defenseShort',
        fallback: 'DEF',
        stats: [
          {
            id: 'defenseBlunt',
            labelKey: 'plannerV2.summary.defenseBlunt',
            fallback: 'Blunt defense',
            iconPath: getBattleIconPath('defenseBlunt'),
            value: formatNumber(stats.defenseBlunt),
          },
          {
            id: 'defenseSharp',
            labelKey: 'plannerV2.summary.defenseSharp',
            fallback: 'Sharp defense',
            iconPath: getBattleIconPath('defenseSharp'),
            value: formatNumber(stats.defenseSharp),
          },
          {
            id: 'defenseDistance',
            labelKey: 'plannerV2.summary.defenseDistance',
            fallback: 'Distance defense',
            iconPath: getBattleIconPath('defenseDistance'),
            value: formatNumber(stats.defenseDistance),
          },
          {
            id: 'defenseSea',
            labelKey: 'plannerV2.summary.defenseSea',
            fallback: 'Naval defense',
            iconPath: getBattleIconPath('defenseSea'),
            value: formatNumber(stats.defenseSea),
          },
        ],
      },
    ];
  });
}
