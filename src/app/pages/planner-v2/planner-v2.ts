import { Component, computed, inject, signal } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { PlanConfigService } from '../../services/plan-config.service';

import { PlannerHeader } from './components/planner-header/planner-header';
import {
  PlannerMode,
  PlannerModeSwitch,
} from './components/planner-mode-switch/planner-mode-switch';
import { PlannerSummarySidebar } from './components/planner-summary-sidebar/planner-summary-sidebar';
import { PlannerToolbox } from './components/planner-toolbox/planner-toolbox';

type TranslatableText = {
  readonly labelKey: string;
  readonly fallback: string;
};

type BuildingTilePlaceholder = TranslatableText & {
  readonly icon: string;
  readonly level: number;
  readonly statLabelKey: string;
  readonly statFallback: string;
  readonly statValue: string;
};

type UnitTilePlaceholder = TranslatableText & {
  readonly icon: string;
  readonly amount: string;
  readonly attack: number;
  readonly population: number;
  readonly time: string;
};

type SetupBarTab = TranslatableText & {
  readonly shortLabelKey: string;
  readonly shortFallback: string;
  readonly icon: string;
};

type SetupContextItem = TranslatableText & {
  readonly icon: string;
  readonly value: string;
};

type CityModifierToggle = SetupBarTab & {
  readonly active: boolean;
};

type BottomSummaryStat = TranslatableText & {
  readonly value: string;
  readonly icon: string;
};

const buildingPlaceholders: readonly BuildingTilePlaceholder[] = [
  {
    labelKey: 'building.senate',
    fallback: 'Senate',
    icon: '▥',
    level: 9,
    statLabelKey: 'plannerV2.stat.population',
    statFallback: 'Population',
    statValue: '27',
  },
  {
    labelKey: 'building.timber_camp',
    fallback: 'Timber Camp',
    icon: '♜',
    level: 1,
    statLabelKey: 'plannerV2.stat.wood',
    statFallback: 'Wood',
    statValue: '1',
  },
  {
    labelKey: 'building.farm',
    fallback: 'Farm',
    icon: '♨',
    level: 1,
    statLabelKey: 'plannerV2.stat.population',
    statFallback: 'Population',
    statValue: '1',
  },
  {
    labelKey: 'building.quarry',
    fallback: 'Quarry',
    icon: '◼',
    level: 1,
    statLabelKey: 'plannerV2.stat.stone',
    statFallback: 'Stone',
    statValue: '1',
  },
  {
    labelKey: 'building.warehouse',
    fallback: 'Warehouse',
    icon: '▤',
    level: 1,
    statLabelKey: 'plannerV2.stat.storage',
    statFallback: 'Storage',
    statValue: '1',
  },
  {
    labelKey: 'building.silver_mine',
    fallback: 'Silver Mine',
    icon: '●',
    level: 1,
    statLabelKey: 'plannerV2.stat.silver',
    statFallback: 'Silver',
    statValue: '1',
  },
  {
    labelKey: 'building.barracks',
    fallback: 'Barracks',
    icon: '⚔',
    level: 1,
    statLabelKey: 'plannerV2.stat.units',
    statFallback: 'Units',
    statValue: '1',
  },
  {
    labelKey: 'building.temple',
    fallback: 'Temple',
    icon: '♛',
    level: 1,
    statLabelKey: 'plannerV2.stat.favor',
    statFallback: 'Favor',
    statValue: '1',
  },
  {
    labelKey: 'building.marketplace',
    fallback: 'Marketplace',
    icon: '◎',
    level: 1,
    statLabelKey: 'plannerV2.stat.trade',
    statFallback: 'Trade',
    statValue: '1',
  },
  {
    labelKey: 'building.harbour',
    fallback: 'Harbour',
    icon: '⚓',
    level: 0,
    statLabelKey: 'plannerV2.stat.ships',
    statFallback: 'Ships',
    statValue: '0',
  },
  {
    labelKey: 'building.academy',
    fallback: 'Academy',
    icon: '⚗',
    level: 0,
    statLabelKey: 'plannerV2.stat.research',
    statFallback: 'Research',
    statValue: '0',
  },
  {
    labelKey: 'building.city_wall',
    fallback: 'City Wall',
    icon: '▰',
    level: 0,
    statLabelKey: 'plannerV2.stat.defense',
    statFallback: 'Defense',
    statValue: '0',
  },
];

const unitPlaceholders: readonly UnitTilePlaceholder[] = [
  {
    labelKey: 'unit.swordsman',
    fallback: 'Swordsman',
    icon: '⚔',
    amount: '7,420',
    attack: 18,
    population: 1,
    time: '00:30',
  },
  {
    labelKey: 'unit.archer',
    fallback: 'Archer',
    icon: '➶',
    amount: '5,210',
    attack: 24,
    population: 1,
    time: '00:35',
  },
  {
    labelKey: 'unit.hoplite',
    fallback: 'Hoplite',
    icon: '◈',
    amount: '3,860',
    attack: 28,
    population: 1,
    time: '00:45',
  },
  {
    labelKey: 'unit.horseman',
    fallback: 'Horseman',
    icon: '♞',
    amount: '1,980',
    attack: 32,
    population: 2,
    time: '00:50',
  },
  {
    labelKey: 'unit.slinger',
    fallback: 'Slinger',
    icon: '◒',
    amount: '2,450',
    attack: 16,
    population: 1,
    time: '00:25',
  },
  {
    labelKey: 'unit.chariot',
    fallback: 'Chariot',
    icon: '♘',
    amount: '1,150',
    attack: 36,
    population: 2,
    time: '00:55',
  },
  {
    labelKey: 'unit.catapult',
    fallback: 'Catapult',
    icon: '⚙',
    amount: '2,150',
    attack: 120,
    population: 5,
    time: '02:00',
  },
  {
    labelKey: 'unit.militia',
    fallback: 'Militia',
    icon: '◉',
    amount: '4,300',
    attack: 10,
    population: 1,
    time: '00:20',
  },
];

const troopCategories: readonly SetupBarTab[] = [
  {
    labelKey: 'plannerV2.troop.landUnits',
    fallback: 'Land Units',
    shortLabelKey: 'plannerV2.troop.landUnitsShort',
    shortFallback: 'Land',
    icon: '⚔',
  },
  {
    labelKey: 'plannerV2.troop.seaUnits',
    fallback: 'Sea Units',
    shortLabelKey: 'plannerV2.troop.seaUnitsShort',
    shortFallback: 'Sea',
    icon: '⚓',
  },
  {
    labelKey: 'plannerV2.troop.mythicalUnits',
    fallback: 'Mythical Units',
    shortLabelKey: 'plannerV2.troop.mythicalUnitsShort',
    shortFallback: 'Mythical',
    icon: '♛',
  },
];

const troopContextLeft: readonly SetupContextItem[] = [
  { labelKey: 'building.barracks', fallback: 'Barracks', icon: '⚔', value: '25' },
  { labelKey: 'building.harbour', fallback: 'Harbour', icon: '⚓', value: '20' },
];

const troopContextRight: readonly SetupContextItem[] = [
  { labelKey: 'building.temple', fallback: 'Temple', icon: '♛', value: '18' },
];

const cityContextLeft: readonly SetupContextItem[] = [
  { labelKey: 'plannerV2.context.maxBhp', fallback: 'Max BHP', icon: '♟', value: '114' },
  { labelKey: 'plannerV2.context.usedLand', fallback: 'Used Land', icon: '▦', value: '20/20' },
];

const cityContextRight: readonly SetupContextItem[] = [
  {
    labelKey: 'plannerV2.context.specialSlots',
    fallback: 'Special slots',
    icon: '★',
    value: '0/2',
  },
  { labelKey: 'plannerV2.context.buildings', fallback: 'Buildings', icon: '▥', value: '14' },
];

const cityModifiers: readonly CityModifierToggle[] = [
  {
    labelKey: 'plannerV2.modifier.aphrodite',
    fallback: 'Aphrodite',
    shortLabelKey: 'plannerV2.modifier.aphroditeShort',
    shortFallback: 'Aphro',
    icon: '♡',
    active: true,
  },
  {
    labelKey: 'plannerV2.modifier.landExpansion',
    fallback: 'Land Expansion',
    shortLabelKey: 'plannerV2.modifier.landExpansionShort',
    shortFallback: 'Land',
    icon: '▦',
    active: true,
  },
  {
    labelKey: 'plannerV2.modifier.plow',
    fallback: 'Plow',
    shortLabelKey: 'plannerV2.modifier.plowShort',
    shortFallback: 'Plow',
    icon: '⚱',
    active: true,
  },
];

const gods: readonly TranslatableText[] = [
  { labelKey: 'god.zeus', fallback: 'Zeus' },
  { labelKey: 'god.poseidon', fallback: 'Poseidon' },
  { labelKey: 'god.hera', fallback: 'Hera' },
  { labelKey: 'god.athena', fallback: 'Athena' },
  { labelKey: 'god.hades', fallback: 'Hades' },
  { labelKey: 'god.artemis', fallback: 'Artemis' },
  { labelKey: 'god.aphrodite', fallback: 'Aphrodite' },
  { labelKey: 'god.ares', fallback: 'Ares' },
];

const specialSlots: readonly TranslatableText[] = [
  { labelKey: 'plannerV2.specialBuilding1', fallback: 'Special Building 1' },
  { labelKey: 'plannerV2.specialBuilding2', fallback: 'Special Building 2' },
];

@Component({
  selector: 'app-planner-v2',
  imports: [TranslatePipe, PlannerToolbox, PlannerHeader, PlannerModeSwitch, PlannerSummarySidebar],
  templateUrl: './planner-v2.html',
})
export class PlannerV2 {
  private readonly planConfigService = inject(PlanConfigService);

  protected readonly plans = this.planConfigService.plans;
  protected readonly activePlan = this.planConfigService.activePlan;
  protected readonly activeMode = signal<PlannerMode>('city');
  protected readonly buildingPlaceholders = buildingPlaceholders;
  protected readonly unitPlaceholders = unitPlaceholders;
  protected readonly troopCategories = troopCategories;
  protected readonly troopContextLeft = troopContextLeft;
  protected readonly troopContextRight = troopContextRight;
  protected readonly cityContextLeft = cityContextLeft;
  protected readonly cityContextRight = cityContextRight;
  protected readonly cityModifiers = cityModifiers;
  protected readonly gods = gods;
  protected readonly specialSlots = specialSlots;
  protected readonly buildingCount = computed(
    () => Object.keys(this.activePlan().cityPlan.buildingLevels).length,
  );
  protected readonly usedUnitCount = computed(
    () =>
      Object.values(this.activePlan().troopPlan.unitAmounts).filter((amount) => amount > 0).length,
  );
  protected readonly bottomSummaryStats = computed<readonly BottomSummaryStat[]>(() =>
    this.activeMode() === 'city'
      ? [
          {
            labelKey: 'plannerV2.bottom.totalPopulation',
            fallback: 'Total Population',
            value: '114',
            icon: '♟',
          },
          {
            labelKey: 'plannerV2.bottom.totalBuildings',
            fallback: 'Total Buildings',
            value: String(this.buildingCount()),
            icon: '▥',
          },
          {
            labelKey: 'plannerV2.bottom.usedLand',
            fallback: 'Used Land',
            value: '20 / 20',
            icon: '▦',
          },
          { labelKey: 'plannerV2.bottom.freeBhp', fallback: 'Free BHP', value: '0', icon: '◇' },
        ]
      : [
          {
            labelKey: 'plannerV2.bottom.totalUnits',
            fallback: 'Total Units',
            value: '28,520',
            icon: '⚔',
          },
          {
            labelKey: 'plannerV2.bottom.usedPopulation',
            fallback: 'Used Population',
            value: '28,520 / 114',
            icon: '♟',
          },
          {
            labelKey: 'plannerV2.bottom.totalAttack',
            fallback: 'Total Attack',
            value: '620,260',
            icon: '⚔',
          },
          {
            labelKey: 'plannerV2.bottom.carryingCapacity',
            fallback: 'Carrying Capacity',
            value: '105,000',
            icon: '⚓',
          },
          {
            labelKey: 'plannerV2.bottom.marchTime',
            fallback: 'March Time',
            value: '01:42:30',
            icon: '◷',
          },
        ],
  );

  protected selectMode(mode: PlannerMode): void {
    this.activeMode.set(mode);
  }

  protected selectPlan(planId: string): void {
    this.planConfigService.selectPlan(planId);
  }
}
