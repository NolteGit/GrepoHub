import { Component, computed, inject, signal } from '@angular/core';

import {
  cityBuildingPlanDefinitions,
  citySpecialBuildingSlotDefinitions,
} from '../../data/city-planner-presets';
import { getBuildingImagePath } from '../../data/asset-paths';
import type {
  CityModifierId,
  CitySpecialBuildingOptionId,
  CitySpecialBuildingSlotId,
} from '../../models/city-configuration.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { calculateCityPlannerPopulation } from '../../services/city-planner-population';
import { PlanConfigService } from '../../services/plan-config.service';

import { PlannerBottomSummary } from './components/planner-bottom-summary/planner-bottom-summary';
import { PlannerCitySetup } from './components/planner-city-setup/planner-city-setup';
import { PlannerHeader } from './components/planner-header/planner-header';
import {
  PlannerMode,
  PlannerModeSwitch,
} from './components/planner-mode-switch/planner-mode-switch';
import { PlannerSummarySidebar } from './components/planner-summary-sidebar/planner-summary-sidebar';
import { PlannerToolbox } from './components/planner-toolbox/planner-toolbox';
import { PlannerTroopSetup } from './components/planner-troop-setup/planner-troop-setup';
import type {
  BottomSummaryStat,
  BuildingTileStat,
  BuildingTileView,
  CityModifierToggle,
  CityModifierToggleId,
  GodOption,
  SetupContextItem,
  SidebarPopulationStats,
  SidebarPreviewStat,
  SpecialBuildingOptionView,
  SpecialBuildingSlotView,
  TroopCategory,
  TroopCategoryTab,
  UnitTilePlaceholder,
} from './planner-v2.models';

const cityBuildingOrder = [
  'senate',
  'timber_camp',
  'farm',
  'quarry',
  'warehouse',
  'silver_mine',
  'barracks',
  'temple',
  'marketplace',
  'harbour',
  'academy',
  'city_wall',
  'cave',
] as const;

const buildingFallbacks: Record<string, string> = {
  academy: 'Academy',
  barracks: 'Barracks',
  cave: 'Cave',
  city_wall: 'City Wall',
  farm: 'Farm',
  harbour: 'Harbour',
  marketplace: 'Marketplace',
  quarry: 'Quarry',
  senate: 'Senate',
  silver_mine: 'Silver Mine',
  temple: 'Temple',
  timber_camp: 'Timber Camp',
  divine_statue: 'Divine Statue',
  lighthouse: 'Lighthouse',
  library: 'Library',
  merchants_shop: "Merchants' Shop",
  oracle: 'Oracle',
  theatre: 'Theatre',
  thermal_baths: 'Thermal Baths',
  tower: 'Tower',
  warehouse: 'Warehouse',
};

const buildingFallbackIcons: Record<string, string> = {
  academy: '⚗',
  barracks: '⚔',
  cave: '●',
  city_wall: '▰',
  farm: '♨',
  harbour: '⚓',
  marketplace: '◎',
  quarry: '◼',
  senate: '▥',
  silver_mine: '●',
  temple: '♛',
  timber_camp: '♜',
  warehouse: '▤',
};

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

const troopCategories: readonly TroopCategoryTab[] = [
  {
    id: 'land',
    labelKey: 'plannerV2.troop.landUnits',
    fallback: 'Land Units',
    shortLabelKey: 'plannerV2.troop.landUnitsShort',
    shortFallback: 'Land',
    icon: '⚔',
  },
  {
    id: 'sea',
    labelKey: 'plannerV2.troop.seaUnits',
    fallback: 'Sea Units',
    shortLabelKey: 'plannerV2.troop.seaUnitsShort',
    shortFallback: 'Sea',
    icon: '⚓',
  },
  {
    id: 'mythical',
    labelKey: 'plannerV2.troop.mythicalUnits',
    fallback: 'Mythical Units',
    shortLabelKey: 'plannerV2.troop.mythicalUnitsShort',
    shortFallback: 'Mythical',
    icon: '♛',
  },
];

const gods: readonly GodOption[] = [
  { value: 'zeus', labelKey: 'god.zeus', fallback: 'Zeus' },
  { value: 'poseidon', labelKey: 'god.poseidon', fallback: 'Poseidon' },
  { value: 'hera', labelKey: 'god.hera', fallback: 'Hera' },
  { value: 'athena', labelKey: 'god.athena', fallback: 'Athena' },
  { value: 'hades', labelKey: 'god.hades', fallback: 'Hades' },
  { value: 'artemis', labelKey: 'god.artemis', fallback: 'Artemis' },
  { value: 'aphrodite', labelKey: 'god.aphrodite', fallback: 'Aphrodite' },
  { value: 'ares', labelKey: 'god.ares', fallback: 'Ares' },
];

const getBuildingDefinition = (buildingId: string) => {
  return cityBuildingPlanDefinitions.find((building) => building.id === buildingId);
};

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

const formatSignedNumber = (value: number): string => {
  if (value > 0) {
    return `+${formatNumber(value)}`;
  }

  return formatNumber(value);
};

const formatPopulationDelta = (value: number): string => {
  if (value === 0) {
    return '0';
  }

  return formatSignedNumber(value);
};

const formatRatio = (current: number, maximum: number): string => `${current}/${maximum}`;

@Component({
  selector: 'app-planner-v2',
  imports: [
    TranslatePipe,
    PlannerToolbox,
    PlannerHeader,
    PlannerModeSwitch,
    PlannerCitySetup,
    PlannerTroopSetup,
    PlannerBottomSummary,
    PlannerSummarySidebar,
  ],
  templateUrl: './planner-v2.html',
})
export class PlannerV2 {
  private readonly planConfigService = inject(PlanConfigService);

  protected readonly plans = this.planConfigService.plans;
  protected readonly activePlan = this.planConfigService.activePlan;
  protected readonly activeMode = signal<PlannerMode>('city');
  protected readonly selectedTroopCategory = signal<TroopCategory>('land');
  protected readonly selectedGod = signal('zeus');
  protected readonly unitPlaceholders = unitPlaceholders;
  protected readonly troopCategories = troopCategories;
  protected readonly gods = gods;
  protected readonly cityPopulation = computed(() =>
    calculateCityPlannerPopulation(this.activePlan().cityPlan),
  );
  protected readonly cityBuildingLevels = computed(() =>
    cityBuildingOrder.reduce((sum, buildingId) => {
      return sum + (this.activePlan().cityPlan.buildingLevels[buildingId] ?? 0);
    }, 0),
  );
  protected readonly activeBuildingCount = computed(
    () =>
      cityBuildingOrder.filter((buildingId) => {
        return (this.activePlan().cityPlan.buildingLevels[buildingId] ?? 0) > 0;
      }).length,
  );
  protected readonly activeModifierCount = computed(() => {
    const cityPlan = this.activePlan().cityPlan;
    const enabledModifierCount = Object.values(cityPlan.modifiers).filter(Boolean).length;
    const hasLandExpansion = (cityPlan.buildingLevels['land_expansion'] ?? 0) > 0;

    return enabledModifierCount + (hasLandExpansion ? 1 : 0);
  });
  protected readonly selectedSpecialBuildingCount = computed(
    () =>
      Object.values(this.activePlan().cityPlan.specialBuildings).filter((optionId) => {
        return optionId !== 'none';
      }).length,
  );
  protected readonly cityModifierPopulationBonus = computed(() => {
    const population = this.cityPopulation().breakdown;

    return population.aphroditeCapacity + population.fixedModifierCapacity;
  });
  protected readonly citySpecialBuildingPopulationEffect = computed(() => {
    const population = this.cityPopulation().breakdown;

    return population.specialBuildingCapacity - population.specialBuildingUsedPopulation;
  });
  protected readonly cityBuildings = computed<readonly BuildingTileView[]>(() => {
    const cityPlan = this.activePlan().cityPlan;

    return cityBuildingOrder.map((buildingId) => {
      const definition = getBuildingDefinition(buildingId);
      const level = cityPlan.buildingLevels[buildingId] ?? 0;
      const maxLevel = definition?.maxLevel ?? 40;
      const population = level > 0 ? (definition?.populationByLevel[level] ?? 0) : 0;
      const stats: readonly BuildingTileStat[] = [
        {
          labelKey: 'plannerV2.stat.populationEffect',
          fallback: 'Pop. effect',
          value: formatPopulationDelta(population),
          tone: population === 0 ? 'muted' : 'gold',
        },
        {
          labelKey: 'plannerV2.stat.levelCap',
          fallback: 'Level cap',
          value: formatRatio(level, maxLevel),
          tone: 'muted',
        },
      ];

      return {
        id: buildingId,
        labelKey: `building.${buildingId}`,
        fallback: buildingFallbacks[buildingId] ?? buildingId,
        icon: buildingFallbackIcons[buildingId] ?? '▥',
        imagePath: getBuildingImagePath(buildingId),
        level,
        maxLevel,
        stats,
      };
    });
  });
  protected readonly cityContextLeft = computed<readonly SetupContextItem[]>(() => [
    {
      labelKey: 'plannerV2.context.populationCapacity',
      fallback: 'Population cap',
      icon: '♟',
      value: formatNumber(this.cityPopulation().populationCapacity),
    },
    {
      labelKey: 'plannerV2.context.freeBhp',
      fallback: 'Free BHP',
      icon: '◇',
      value: formatNumber(this.cityPopulation().freePopulation),
    },
  ]);
  protected readonly cityContextRight = computed<readonly SetupContextItem[]>(() => [
    {
      labelKey: 'plannerV2.context.specialSlots',
      fallback: 'Special slots',
      icon: '★',
      value: formatRatio(this.selectedSpecialBuildingCount(), 2),
    },
    {
      labelKey: 'plannerV2.context.buildingLevels',
      fallback: 'Building levels',
      icon: '▥',
      value: formatNumber(this.cityBuildingLevels()),
    },
  ]);
  protected readonly cityModifiers = computed<readonly CityModifierToggle[]>(() => {
    const cityPlan = this.activePlan().cityPlan;

    return [
      {
        id: 'aphroditeActive',
        labelKey: 'plannerV2.modifier.aphrodite',
        fallback: 'Aphrodite',
        shortLabelKey: 'plannerV2.modifier.aphroditeShort',
        shortFallback: 'Aphro',
        icon: '♡',
        active: cityPlan.modifiers.aphroditeActive,
      },
      {
        id: 'landExpansion',
        labelKey: 'plannerV2.modifier.landExpansion',
        fallback: 'Land Expansion',
        shortLabelKey: 'plannerV2.modifier.landExpansionShort',
        shortFallback: 'Land',
        icon: '▦',
        active: (cityPlan.buildingLevels['land_expansion'] ?? 0) > 0,
      },
      {
        id: 'plowResearched',
        labelKey: 'plannerV2.modifier.plow',
        fallback: 'Plow',
        shortLabelKey: 'plannerV2.modifier.plowShort',
        shortFallback: 'Plow',
        icon: '⚱',
        active: cityPlan.modifiers.plowResearched,
      },
    ];
  });
  protected readonly specialSlots = computed<readonly SpecialBuildingSlotView[]>(() => {
    const cityPlan = this.activePlan().cityPlan;

    return citySpecialBuildingSlotDefinitions.map((slot, index) => ({
      id: slot.id,
      labelKey: index === 0 ? 'plannerV2.specialBuilding1' : 'plannerV2.specialBuilding2',
      fallback: index === 0 ? 'Special Building 1' : 'Special Building 2',
      value: cityPlan.specialBuildings[slot.id],
      options: slot.optionIds.map((optionId) => this.createSpecialBuildingOption(optionId)),
    }));
  });
  protected readonly cityPreviewStats = computed<readonly SidebarPreviewStat[]>(() => [
    {
      labelKey: 'plannerV2.summary.activeBuildings',
      fallback: 'Active buildings',
      value: `${this.activeBuildingCount()}/${cityBuildingOrder.length}`,
    },
    {
      labelKey: 'plannerV2.summary.buildingLevels',
      fallback: 'Building levels',
      value: formatNumber(this.cityBuildingLevels()),
    },
    {
      labelKey: 'plannerV2.summary.activeModifiers',
      fallback: 'Active modifiers',
      value: this.activeModifierCount(),
    },
    {
      labelKey: 'plannerV2.summary.specialBuildings',
      fallback: 'Special buildings',
      value: formatRatio(this.selectedSpecialBuildingCount(), 2),
    },
    {
      labelKey: 'plannerV2.summary.modifierPopulationEffect',
      fallback: 'Modifier pop. effect',
      value: formatSignedNumber(this.cityModifierPopulationBonus()),
    },
    {
      labelKey: 'plannerV2.summary.specialPopulationEffect',
      fallback: 'Special pop. effect',
      value: formatSignedNumber(this.citySpecialBuildingPopulationEffect()),
    },
  ]);
  protected readonly troopContextLeft = computed<readonly SetupContextItem[]>(() => {
    const buildingLevels = this.activePlan().cityPlan.buildingLevels;

    return [
      {
        labelKey: 'building.barracks',
        fallback: 'Barracks',
        icon: '⚔',
        value: String(buildingLevels['barracks'] ?? 0),
      },
      {
        labelKey: 'building.harbour',
        fallback: 'Harbour',
        icon: '⚓',
        value: String(buildingLevels['harbour'] ?? 0),
      },
    ];
  });
  protected readonly troopContextRight = computed<readonly SetupContextItem[]>(() => [
    {
      labelKey: 'building.temple',
      fallback: 'Temple',
      icon: '♛',
      value: String(this.activePlan().cityPlan.buildingLevels['temple'] ?? 0),
    },
  ]);
  protected readonly usedUnitCount = computed(
    () =>
      Object.values(this.activePlan().troopPlan.unitAmounts).filter((amount) => amount > 0).length,
  );
  protected readonly sidebarPopulation = computed<SidebarPopulationStats>(() => ({
    activePlanName: this.activePlan().name,
    populationCapacity: this.cityPopulation().populationCapacity,
    usedPopulation: this.cityPopulation().usedPopulation,
    freePopulation: this.cityPopulation().freePopulation,
    freeBhp: this.cityPopulation().freePopulation,
    usedBuildingLevels: this.cityBuildingLevels(),
    activeBuildingCount: this.activeBuildingCount(),
    activeModifierCount: this.activeModifierCount(),
    selectedSpecialBuildingCount: this.selectedSpecialBuildingCount(),
  }));
  protected readonly bottomSummaryStats = computed<readonly BottomSummaryStat[]>(() =>
    this.activeMode() === 'city'
      ? [
          {
            labelKey: 'plannerV2.bottom.totalPopulation',
            fallback: 'Total Population',
            value: formatNumber(this.cityPopulation().populationCapacity),
            icon: '♟',
          },
          {
            labelKey: 'plannerV2.bottom.usedPopulation',
            fallback: 'Used Population',
            value: formatNumber(this.cityPopulation().usedPopulation),
            icon: '◉',
          },
          {
            labelKey: 'plannerV2.bottom.freeBhp',
            fallback: 'Free BHP',
            value: formatNumber(this.cityPopulation().freePopulation),
            icon: '◇',
          },
          {
            labelKey: 'plannerV2.bottom.buildingLevels',
            fallback: 'Building Levels',
            value: formatNumber(this.cityBuildingLevels()),
            icon: '▥',
          },
          {
            labelKey: 'plannerV2.bottom.activeModifiers',
            fallback: 'Active Modifiers',
            value: String(this.activeModifierCount()),
            icon: '✦',
          },
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

  protected selectTroopCategory(category: TroopCategory): void {
    this.selectedTroopCategory.set(category);
  }

  protected selectGod(god: string): void {
    this.selectedGod.set(god);
  }

  protected updateBuildingLevel(buildingId: string, level: number): void {
    const cityPlan = this.activePlan().cityPlan;

    this.planConfigService.updateActiveCityPlan({
      buildingLevels: {
        ...cityPlan.buildingLevels,
        [buildingId]: level,
      },
    });
  }

  protected toggleCityModifier(modifierId: CityModifierToggleId): void {
    const cityPlan = this.activePlan().cityPlan;

    if (modifierId === 'landExpansion') {
      this.updateBuildingLevel(
        'land_expansion',
        (cityPlan.buildingLevels['land_expansion'] ?? 0) > 0 ? 0 : 6,
      );
      return;
    }

    this.planConfigService.updateActiveCityPlan({
      modifiers: {
        ...cityPlan.modifiers,
        [modifierId]: !cityPlan.modifiers[modifierId],
      },
    });
  }

  protected selectSpecialBuilding(slotId: string, optionId: string): void {
    const cityPlan = this.activePlan().cityPlan;

    this.planConfigService.updateActiveCityPlan({
      specialBuildings: {
        ...cityPlan.specialBuildings,
        [slotId as CitySpecialBuildingSlotId]: optionId as CitySpecialBuildingOptionId,
      },
    });
  }

  private createSpecialBuildingOption(
    optionId: CitySpecialBuildingOptionId,
  ): SpecialBuildingOptionView {
    return optionId === 'none'
      ? {
          value: optionId,
          labelKey: 'plannerV2.none',
          fallback: 'None',
        }
      : {
          value: optionId,
          labelKey: `building.${optionId}`,
          fallback: buildingFallbacks[optionId] ?? optionId,
        };
  }
}
