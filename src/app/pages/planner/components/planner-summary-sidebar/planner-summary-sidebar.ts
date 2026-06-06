import { Component, HostListener, computed, input, output, signal } from '@angular/core';

import {
  academyResearchLevelGroups,
  type AcademyResearchId,
} from '../../../../data/academy-research-presets';
import { getAcademyResearchIconPath, getBattleIconPath } from '../../../../data/asset-paths';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { calculateAcademyResearchPlan } from '../../../../services/academy-research-calculator';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';

import type {
  SidebarPopulationStats,
  SidebarTroopBattleStats,
  SidebarUsedUnit,
  TranslatableText,
} from '../../planner.models';

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

type ResearchTile = TranslatableText & {
  readonly id: AcademyResearchId;
  readonly cost: number;
  readonly requiredAcademyLevel: number;
  readonly icon: string;
  readonly iconPath: string;
  readonly selected: boolean;
  readonly unlocked: boolean;
};

type ResearchLevelGroupView = {
  readonly requiredAcademyLevel: number;
  readonly levelLabel: string;
  readonly researches: readonly ResearchTile[];
};

type ResearchStatCard = TranslatableText & {
  readonly id: string;
  readonly value: string;
  readonly tone: 'default' | 'success' | 'warning' | 'danger';
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
const freeColor = '#3fa36b';
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
  imports: [TranslatePipe, GhPanel],
  templateUrl: './planner-summary-sidebar.html',
})
export class PlannerSummarySidebar {
  readonly population = input.required<SidebarPopulationStats>();
  readonly compact = input(false);
  readonly topUsedUnits = input.required<readonly SidebarUsedUnit[]>();
  readonly troopBattleStats = input.required<SidebarTroopBattleStats>();
  readonly academyLevel = input(0);
  readonly libraryBuilt = input(false);
  readonly libraryBuiltChanged = output<boolean>();

  protected readonly researchDialogOpen = signal(false);
  protected readonly selectedResearchIds = signal<readonly AcademyResearchId[]>([]);
  protected readonly researchLibraryBuilt = signal(false);
  protected readonly effectiveResearchLibraryBuilt = computed(() =>
    this.researchDialogOpen() ? this.researchLibraryBuilt() : this.libraryBuilt(),
  );

  protected readonly populationTitleKey = 'plannerV2.summary.populationTitle';
  protected readonly populationTitleFallback = 'Population Overview';
  protected readonly battleTitleKey = 'plannerV2.summary.context.battleStats';
  protected readonly battleTitleFallback = 'Troop Stats';
  protected readonly topUnitsTitleKey = 'plannerV2.summary.context.mostUsedUnits';
  protected readonly topUnitsTitleFallback = 'Most Used Units';
  protected readonly researchOpenButtonKey = 'academyResearch.openButton';
  protected readonly researchOpenButtonFallback = 'Research';
  protected readonly researchOpenAriaKey = 'academyResearch.openAria';
  protected readonly researchOpenAriaFallback = 'Open academy research calculator';
  protected readonly researchCalculation = computed(() =>
    calculateAcademyResearchPlan({
      academyLevel: this.academyLevel(),
      selectedResearchIds: this.selectedResearchIds(),
      libraryBuilt: this.effectiveResearchLibraryBuilt(),
    }),
  );
  protected readonly researchGroups = computed<readonly ResearchLevelGroupView[]>(() =>
    academyResearchLevelGroups.map((group) => ({
      requiredAcademyLevel: group.requiredAcademyLevel,
      levelLabel: group.requiredAcademyLevel.toString(),
      researches: group.researches.map((research) => ({
        id: research.id,
        labelKey: research.nameKey,
        fallback: research.fallbackName,
        cost: research.cost,
        requiredAcademyLevel: research.requiredAcademyLevel,
        icon: research.icon,
        iconPath: getAcademyResearchIconPath(research.id),
        selected: this.selectedResearchIds().includes(research.id),
        unlocked: this.academyLevel() >= research.requiredAcademyLevel,
      })),
    })),
  );
  protected readonly researchStatCards = computed<readonly ResearchStatCard[]>(() => {
    const calculation = this.researchCalculation();

    return [
      {
        id: 'available',
        labelKey: 'academyResearch.availablePoints',
        fallback: 'Available points',
        value: calculation.availablePoints.toString(),
        tone: 'default',
      },
      {
        id: 'cost',
        labelKey: 'academyResearch.selectedCost',
        fallback: 'Selected cost',
        value: calculation.selectedCost.toString(),
        tone: calculation.isWithinMaximumPoints ? 'default' : 'danger',
      },
      {
        id: 'remaining',
        labelKey:
          calculation.remainingPoints >= 0
            ? 'academyResearch.remainingPoints'
            : 'academyResearch.missingPoints',
        fallback: calculation.remainingPoints >= 0 ? 'Remaining points' : 'Missing points',
        value: Math.abs(calculation.remainingPoints).toString(),
        tone: calculation.remainingPoints >= 0 ? 'success' : 'danger',
      },
      {
        id: 'required',
        labelKey: 'academyResearch.requiredLevel',
        fallback: 'Required level',
        value: calculation.requiredAcademyLevel.toString(),
        tone: calculation.missingUnlockLevels > 0 ? 'warning' : 'default',
      },
    ];
  });
  protected readonly researchStatusKey = computed(() => {
    const calculation = this.researchCalculation();

    if (!calculation.isWithinMaximumPoints) {
      return 'academyResearch.tooExpensive';
    }

    if (!calculation.isCurrentAcademyLevelEnough) {
      return 'academyResearch.needsMoreAcademy';
    }

    return 'academyResearch.currentLevelEnough';
  });
  protected readonly researchStatusFallback = computed(() => {
    const calculation = this.researchCalculation();

    if (!calculation.isWithinMaximumPoints) {
      return 'This selection needs more points than the academy can provide.';
    }

    if (!calculation.isCurrentAcademyLevelEnough) {
      return 'The current academy level is not enough for this selection yet.';
    }

    return 'The current academy level can support this selection.';
  });
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

  protected openResearchDialog(): void {
    this.researchLibraryBuilt.set(this.libraryBuilt());
    this.researchDialogOpen.set(true);
  }

  protected closeResearchDialog(): void {
    this.researchDialogOpen.set(false);
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected handleDocumentEscape(event: Event): void {
    if (!this.researchDialogOpen()) {
      return;
    }

    event.preventDefault();
    this.closeResearchDialog();
  }

  protected toggleResearchLibrary(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.researchLibraryBuilt.set(input.checked);
    this.libraryBuiltChanged.emit(input.checked);
  }

  protected toggleResearch(researchId: AcademyResearchId): void {
    this.selectedResearchIds.update((ids) =>
      ids.includes(researchId) ? ids.filter((id) => id !== researchId) : [...ids, researchId],
    );
  }

  protected clearResearchSelection(): void {
    this.selectedResearchIds.set([]);
  }

  protected researchCardColor(tone: ResearchStatCard['tone']): string {
    if (tone === 'success') {
      return '#3fa36b';
    }

    if (tone === 'warning') {
      return 'var(--gh-gold)';
    }

    if (tone === 'danger') {
      return '#cf453e';
    }

    return 'var(--gh-text)';
  }

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
