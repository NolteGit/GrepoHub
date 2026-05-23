import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  cityBuildingPlanDefinitions,
  citySpecialBuildingSlotDefinitions,
} from '../../data/city-planner-presets';
import { getBuildingImagePath, getUnitIconPath } from '../../data/asset-paths';
import type {
  CityConfiguration,
  CitySpecialBuildingOptionId,
  CitySpecialBuildingSlotId,
} from '../../models/city-configuration.model';
import type { TroopConfiguration } from '../../models/troop-configuration.model';
import type { Unit } from '../../models/unit.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { calculateCityPlannerPopulation } from '../../services/city-planner-population';
import { GameDataService } from '../../services/game-data.service';
import { PlanConfigService } from '../../services/plan-config.service';
import { PlanImportExportUiService } from '../../services/plan-import-export-ui.service';
import { TranslationService } from '../../services/translation.service';

import { PlannerCitySetup } from './components/planner-city-setup/planner-city-setup';
import {
  PlannerHeader,
  type PlannerHeaderActionId,
} from './components/planner-header/planner-header';
import {
  PlannerMode,
  PlannerModeSwitch,
} from './components/planner-mode-switch/planner-mode-switch';
import { PlannerSummarySidebar } from './components/planner-summary-sidebar/planner-summary-sidebar';
import {
  PlannerToolbox,
  type PlannerToolboxActionId,
} from './components/planner-toolbox/planner-toolbox';
import { PlannerTroopSetup } from './components/planner-troop-setup/planner-troop-setup';
import { GhButton } from '../../shared/ui/gh-button/gh-button';
import type {
  BuildingTileStat,
  BuildingTileView,
  CityModifierToggle,
  CityModifierToggleId,
  GodOption,
  SetupContextItem,
  SidebarPopulationStats,
  SidebarTroopBattleStats,
  SidebarTroopTransportStats,
  SidebarUsedUnit,
  SpecialBuildingOptionView,
  SpecialBuildingSlotView,
  TroopCategory,
  TroopCategoryTab,
  UnitTileStat,
  UnitTileView,
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

const unitFallbackIcons: Record<string, string> = {
  militia: '◉',
  swordsman: '⚔',
  slinger: '◒',
  archer: '➶',
  hoplite: '◈',
  horseman: '♞',
  chariot: '♘',
  catapult: '⚙',
  divine_envoy: '✦',
  minotaur: '♉',
  manticore: '◆',
  cyclop: '◉',
  hydra: '♒',
  harpy: '⌁',
  medusa: '☍',
  centaur: '♐',
  pegasus: '♞',
  cerberus: '♆',
  erinys: '☄',
  griffin: '♜',
  calydonian_boar: '♘',
  siren: '♪',
  satyr: '♬',
  ladon: '☊',
  spartoi: '♟',
  transport_boat: '⚓',
  bireme: '◁',
  light_ship: '➤',
  fire_ship: '♨',
  fast_transport_ship: '⇥',
  trireme: '△',
  colony_ship: '⚑',
};

const maxUsedUnitPreviewCount = 5;

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

const getBuildingMaxLevel = (buildingId: string): number => {
  return getBuildingDefinition(buildingId)?.maxLevel ?? 40;
};

const normalizeNonNegativeInteger = (value: number): number => {
  return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
};

const clampBuildingLevel = (buildingId: string, level: number): number => {
  return Math.min(getBuildingMaxLevel(buildingId), normalizeNonNegativeInteger(level));
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

const clampPercentage = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const formatUnitFallback = (unitId: string): string =>
  unitId
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const isVisibleForTroopCategory = (
  unit: Unit,
  category: TroopCategory,
  selectedGod: string,
): boolean => {
  if (category === 'land') {
    return unit.type === 'land' && !unit.isMythical;
  }

  if (category === 'sea') {
    return unit.type === 'sea' && !unit.isMythical;
  }

  return unit.isMythical && (unit.god === selectedGod || unit.god === 'all');
};

const createUnitTileStats = (unit: Unit): readonly UnitTileStat[] => {
  const attackValue = unit.type === 'sea' ? unit.attackSea : unit.attack;
  const defenseValue =
    unit.type === 'sea'
      ? String(unit.defenseSea)
      : `${unit.defenseBlunt}/${unit.defenseSharp}/${unit.defenseDistance}`;
  const stats: UnitTileStat[] = [
    {
      labelKey: unit.type === 'sea' ? 'plannerV2.stat.navalAttack' : 'plannerV2.stat.attackShort',
      fallback: unit.type === 'sea' ? 'Naval attack' : 'attack',
      value: formatNumber(attackValue),
      tone: attackValue > 0 ? 'gold' : 'muted',
    },
    {
      labelKey: unit.type === 'sea' ? 'plannerV2.stat.defenseShort' : 'plannerV2.stat.defense',
      fallback: unit.type === 'sea' ? 'def' : 'Defense',
      value: defenseValue,
      tone: defenseValue === '0' ? 'muted' : 'default',
    },
    {
      labelKey: 'plannerV2.stat.populationShort',
      fallback: 'pop',
      value: formatNumber(unit.cost.population),
      tone: unit.cost.population > 0 ? 'default' : 'muted',
    },
  ];

  if (unit.cost.favor > 0) {
    stats.push({
      labelKey: 'plannerV2.stat.favorShort',
      fallback: 'favor',
      value: formatNumber(unit.cost.favor),
      tone: 'gold',
    });
  }

  if (unit.transportCapacity > 0) {
    stats.push({
      labelKey: 'plannerV2.stat.capacity',
      fallback: 'Capacity',
      value: formatNumber(unit.transportCapacity),
      tone: 'gold',
    });
  }

  return stats;
};

type CityPopulationSummary = ReturnType<typeof calculateCityPlannerPopulation>;

type CityPlannerSummary = {
  readonly population: CityPopulationSummary;
  readonly populationCapacity: number;
  readonly usedPopulation: number;
  readonly freePopulation: number;
  readonly freeBhp: number;
  readonly buildingLevels: number;
  readonly activeBuildingCount: number;
  readonly activeModifierCount: number;
  readonly selectedSpecialBuildingCount: number;
  readonly modifierPopulationBonus: number;
  readonly specialBuildingPopulationEffect: number;
};

type TroopPlannerSummary = {
  readonly totalUnits: number;
  readonly usedPopulation: number;
  readonly landPopulation: number;
  readonly seaPopulation: number;
  readonly totalAttack: number;
  readonly totalDefense: number;
  readonly attackBlunt: number;
  readonly attackSharp: number;
  readonly attackDistance: number;
  readonly attackSea: number;
  readonly defenseBlunt: number;
  readonly defenseSharp: number;
  readonly defenseDistance: number;
  readonly defenseSea: number;
  readonly transportCapacity: number;
  readonly transportSpace: number;
  readonly transportBalance: number;
  readonly transportUsagePercent: number;
  readonly usedUnitTypes: number;
  readonly wood: number;
  readonly stone: number;
  readonly silver: number;
  readonly favor: number;
  readonly transportShipCount: number;
  readonly bunksBonus: number;
};

type PlannerNotice = {
  readonly tone: 'success' | 'error';
  readonly titleKey: string;
  readonly titleFallback: string;
  readonly detailLines: readonly string[];
};

@Component({
  selector: 'app-planner-v2',
  imports: [
    TranslatePipe,
    PlannerToolbox,
    PlannerHeader,
    PlannerModeSwitch,
    PlannerCitySetup,
    PlannerTroopSetup,
    PlannerSummarySidebar,
    GhButton,
  ],
  providers: [PlanImportExportUiService],
  templateUrl: './planner-v2.html',
})
export class PlannerV2 {
  private readonly planConfigService = inject(PlanConfigService);
  private readonly gameDataService = inject(GameDataService);
  private readonly planImportExportUiService = inject(PlanImportExportUiService);
  private readonly translationService = inject(TranslationService);

  protected readonly plans = this.planConfigService.plans;
  protected readonly activePlan = this.planConfigService.activePlan;
  protected readonly canDeleteActivePlan = this.planConfigService.canDeleteActivePlan;
  private readonly localPlanNotice = signal<PlannerNotice | null>(null);
  protected readonly activeCityPlan = computed(() => this.activePlan().cityPlan);
  protected readonly activeTroopPlan = computed(() => this.activePlan().troopPlan);
  protected readonly buildingLevels = computed(() => this.activeCityPlan().buildingLevels);
  protected readonly unitAmounts = computed(() => this.activeTroopPlan().unitAmounts);
  protected readonly unitDefinitions = toSignal(this.gameDataService.getUnitDefinitions(), {
    initialValue: [] as Unit[],
  });
  protected readonly activeMode = signal<PlannerMode>('city');
  protected readonly selectedTroopCategory = signal<TroopCategory>('land');
  protected readonly selectedGod = signal('zeus');
  protected readonly troopCategories = troopCategories;
  protected readonly gods = gods;
  protected readonly planNotice = computed<PlannerNotice | null>(() => {
    const importDialog = this.planImportExportUiService.planImportDialog();

    if (importDialog) {
      return {
        tone: importDialog.isError ? 'error' : 'success',
        titleKey: importDialog.isError
          ? 'planConfig.importDialog.errorTitle'
          : 'planConfig.importDialog.successTitle',
        titleFallback: importDialog.isError ? 'Import failed' : 'Import complete',
        detailLines: importDialog.detailLines,
      };
    }

    return this.localPlanNotice();
  });

  protected readonly cityPopulation = computed(() =>
    calculateCityPlannerPopulation(this.activeCityPlan()),
  );
  protected readonly citySummary = computed<CityPlannerSummary>(() => {
    const cityPlan = this.activeCityPlan();
    const buildingLevels = this.buildingLevels();
    const population = this.cityPopulation();
    const activeBuildingCount = cityBuildingOrder.filter((buildingId) => {
      return (buildingLevels[buildingId] ?? 0) > 0;
    }).length;
    const enabledModifierCount = Object.values(cityPlan.modifiers).filter(Boolean).length;
    const hasLandExpansion = (buildingLevels['land_expansion'] ?? 0) > 0;
    const selectedSpecialBuildingCount = Object.values(cityPlan.specialBuildings).filter(
      (optionId) => optionId !== 'none',
    ).length;
    const modifierPopulationBonus =
      population.breakdown.aphroditeCapacity + population.breakdown.fixedModifierCapacity;
    const specialBuildingPopulationEffect =
      population.breakdown.specialBuildingCapacity -
      population.breakdown.specialBuildingUsedPopulation;

    return {
      population,
      populationCapacity: population.populationCapacity,
      usedPopulation: population.usedPopulation,
      freePopulation: population.freePopulation,
      freeBhp: population.freePopulation,
      buildingLevels: cityBuildingOrder.reduce((sum, buildingId) => {
        return sum + (buildingLevels[buildingId] ?? 0);
      }, 0),
      activeBuildingCount,
      activeModifierCount: enabledModifierCount + (hasLandExpansion ? 1 : 0),
      selectedSpecialBuildingCount,
      modifierPopulationBonus,
      specialBuildingPopulationEffect,
    };
  });
  protected readonly cityBuildings = computed<readonly BuildingTileView[]>(() => {
    const buildingLevels = this.buildingLevels();

    return cityBuildingOrder.map((buildingId) => {
      const definition = getBuildingDefinition(buildingId);
      const level = buildingLevels[buildingId] ?? 0;
      const maxLevel = getBuildingMaxLevel(buildingId);
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
  protected readonly cityHeroBuilding = computed<BuildingTileView | null>(() => {
    return this.cityBuildings().find((building) => building.id === 'senate') ?? null;
  });
  protected readonly cityGridBuildings = computed<readonly BuildingTileView[]>(() => {
    return this.cityBuildings().filter((building) => building.id !== 'senate');
  });
  protected readonly cityModifiers = computed<readonly CityModifierToggle[]>(() => {
    const cityPlan = this.activeCityPlan();
    const buildingLevels = this.buildingLevels();

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
        active: (buildingLevels['land_expansion'] ?? 0) > 0,
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
    const cityPlan = this.activeCityPlan();

    return citySpecialBuildingSlotDefinitions.map((slot, index) => ({
      id: slot.id,
      labelKey: index === 0 ? 'plannerV2.specialBuilding1' : 'plannerV2.specialBuilding2',
      fallback: index === 0 ? 'Special Building 1' : 'Special Building 2',
      value: cityPlan.specialBuildings[slot.id],
      options: slot.optionIds.map((optionId) => this.createSpecialBuildingOption(optionId)),
    }));
  });
  protected readonly troopContextLeft = computed<readonly SetupContextItem[]>(() => {
    const buildingLevels = this.buildingLevels();

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
      value: String(this.buildingLevels()['temple'] ?? 0),
    },
  ]);
  protected readonly visibleUnits = computed<readonly UnitTileView[]>(() => {
    const unitAmounts = this.unitAmounts();
    const category = this.selectedTroopCategory();
    const selectedGod = this.selectedGod();

    return this.unitDefinitions()
      .filter((unit) => isVisibleForTroopCategory(unit, category, selectedGod))
      .map((unit) => ({
        id: unit.id,
        labelKey: unit.nameKey,
        fallback: formatUnitFallback(unit.id),
        imagePath: getUnitIconPath(unit.id),
        icon: unitFallbackIcons[unit.id] ?? '⚔',
        amount: unitAmounts[unit.id] ?? 0,
        stats: createUnitTileStats(unit),
      }));
  });
  protected readonly troopSummary = computed<TroopPlannerSummary>(() => {
    const troopPlan = this.activeTroopPlan();
    const unitAmounts = this.unitAmounts();

    const totals = this.unitDefinitions().reduce(
      (sum, unit) => {
        const amount = unitAmounts[unit.id] ?? 0;

        if (amount <= 0) {
          return sum;
        }

        const landAttack = unit.type === 'sea' ? 0 : unit.attack * amount;
        const navalAttack = unit.attackSea * amount;
        const bluntDefense = unit.defenseBlunt * amount;
        const sharpDefense = unit.defenseSharp * amount;
        const distanceDefense = unit.defenseDistance * amount;
        const navalDefense = unit.defenseSea * amount;
        const unitPopulation = unit.cost.population * amount;
        const transportCapacity = unit.transportCapacity * amount;
        const transportSpace = unit.transportSpace * amount;

        return {
          totalUnits: sum.totalUnits + amount,
          usedPopulation: sum.usedPopulation + unitPopulation,
          landPopulation: sum.landPopulation + (unit.type === 'land' ? unitPopulation : 0),
          seaPopulation: sum.seaPopulation + (unit.type === 'sea' ? unitPopulation : 0),
          totalAttack: sum.totalAttack + landAttack + navalAttack,
          totalDefense:
            sum.totalDefense + bluntDefense + sharpDefense + distanceDefense + navalDefense,
          attackBlunt: sum.attackBlunt + (unit.attackType === 'blunt' ? landAttack : 0),
          attackSharp: sum.attackSharp + (unit.attackType === 'sharp' ? landAttack : 0),
          attackDistance: sum.attackDistance + (unit.attackType === 'distance' ? landAttack : 0),
          attackSea: sum.attackSea + navalAttack,
          defenseBlunt: sum.defenseBlunt + bluntDefense,
          defenseSharp: sum.defenseSharp + sharpDefense,
          defenseDistance: sum.defenseDistance + distanceDefense,
          defenseSea: sum.defenseSea + navalDefense,
          transportCapacity: sum.transportCapacity + transportCapacity,
          transportSpace: sum.transportSpace + transportSpace,
          usedUnitTypes: sum.usedUnitTypes + 1,
          wood: sum.wood + amount * unit.cost.wood,
          stone: sum.stone + amount * unit.cost.stone,
          silver: sum.silver + amount * unit.cost.silver,
          favor: sum.favor + amount * unit.cost.favor,
          transportShipCount:
            sum.transportShipCount +
            (unit.id === 'transport_boat' || unit.id === 'fast_transport_ship' ? amount : 0),
        };
      },
      {
        totalUnits: 0,
        usedPopulation: 0,
        landPopulation: 0,
        seaPopulation: 0,
        totalAttack: 0,
        totalDefense: 0,
        attackBlunt: 0,
        attackSharp: 0,
        attackDistance: 0,
        attackSea: 0,
        defenseBlunt: 0,
        defenseSharp: 0,
        defenseDistance: 0,
        defenseSea: 0,
        transportCapacity: 0,
        transportSpace: 0,
        usedUnitTypes: 0,
        wood: 0,
        stone: 0,
        silver: 0,
        favor: 0,
        transportShipCount: 0,
      },
    );
    const bunksBonus = troopPlan.modifiers.bunks ? totals.transportShipCount * 6 : 0;
    const transportCapacity = totals.transportCapacity + bunksBonus;
    const transportBalance = transportCapacity - totals.transportSpace;

    return {
      ...totals,
      bunksBonus,
      transportCapacity,
      transportBalance,
      transportUsagePercent:
        transportCapacity > 0
          ? clampPercentage((totals.transportSpace / transportCapacity) * 100)
          : 0,
    };
  });
  protected readonly topUsedUnits = computed<readonly SidebarUsedUnit[]>(() => {
    const unitAmounts = this.unitAmounts();
    const usedUnits = this.unitDefinitions()
      .map((unit) => ({
        labelKey: unit.nameKey,
        fallback: formatUnitFallback(unit.id),
        imagePath: getUnitIconPath(unit.id),
        icon: unitFallbackIcons[unit.id] ?? '⚔',
        amount: unitAmounts[unit.id] ?? 0,
        bhp: (unitAmounts[unit.id] ?? 0) * unit.cost.population,
      }))
      .filter((unit) => unit.amount > 0)
      .sort(
        (left, right) =>
          right.bhp - left.bhp ||
          right.amount - left.amount ||
          left.fallback.localeCompare(right.fallback),
      )
      .slice(0, maxUsedUnitPreviewCount);

    if (usedUnits.length === 0) {
      return [];
    }

    const highestBhp = Math.max(...usedUnits.map((unit) => unit.bhp), 1);

    return usedUnits.map((unit) => ({
      ...unit,
      displayAmount: formatNumber(unit.amount),
      displayBhp: formatNumber(unit.bhp),
      sharePercent: clampPercentage((unit.bhp / highestBhp) * 100),
    }));
  });
  protected readonly troopBattleStats = computed<SidebarTroopBattleStats>(() => {
    const summary = this.troopSummary();

    return {
      attackBlunt: summary.attackBlunt,
      attackSharp: summary.attackSharp,
      attackDistance: summary.attackDistance,
      attackSea: summary.attackSea,
      defenseBlunt: summary.defenseBlunt,
      defenseSharp: summary.defenseSharp,
      defenseDistance: summary.defenseDistance,
      defenseSea: summary.defenseSea,
    };
  });
  protected readonly troopTransportStats = computed<SidebarTroopTransportStats>(() => {
    const summary = this.troopSummary();

    return {
      transportCapacity: summary.transportCapacity,
      transportSpace: summary.transportSpace,
      transportBalance: summary.transportBalance,
      transportUsagePercent: summary.transportUsagePercent,
      bunksBonus: summary.bunksBonus,
    };
  });
  protected readonly sidebarPopulation = computed<SidebarPopulationStats>(() => {
    const citySummary = this.citySummary();
    const troopSummary = this.troopSummary();

    return {
      activePlanName: this.activePlan().name,
      populationCapacity: citySummary.populationCapacity,
      usedPopulation: citySummary.usedPopulation,
      troopPopulation: troopSummary.usedPopulation,
      freePopulation: citySummary.freePopulation,
      freePopulationAfterTroops: citySummary.freePopulation - troopSummary.usedPopulation,
      freeBhp: citySummary.freeBhp,
      usedBuildingLevels: citySummary.buildingLevels,
      activeBuildingCount: citySummary.activeBuildingCount,
      activeModifierCount: citySummary.activeModifierCount,
      selectedSpecialBuildingCount: citySummary.selectedSpecialBuildingCount,
    };
  });

  protected handlePlanAction(
    actionId: PlannerHeaderActionId,
    planImportInput: HTMLInputElement,
  ): void {
    if (actionId === 'new') {
      this.createNewPlanFromPrompt();
      return;
    }

    if (actionId === 'import') {
      planImportInput.click();
      return;
    }

    if (actionId === 'export') {
      this.planImportExportUiService.exportActivePlanAsJson();
      return;
    }

    this.deleteActivePlanWithConfirmation();
  }

  protected handleToolboxAction(
    actionId: PlannerToolboxActionId,
    planImportInput: HTMLInputElement,
  ): void {
    if (actionId === 'city') {
      this.selectMode('city');
      return;
    }

    if (actionId === 'troops') {
      this.selectMode('troops');
      return;
    }

    if (actionId === 'language') {
      this.translationService.toggleLanguage();
      return;
    }

    this.handlePlanAction(actionId, planImportInput);
  }

  protected async importPlanFromFile(event: Event): Promise<void> {
    this.localPlanNotice.set(null);
    await this.planImportExportUiService.importPlanFromJsonFile(event);
  }

  protected closePlanNotice(): void {
    this.localPlanNotice.set(null);
    this.planImportExportUiService.closePlanImportDialog();
  }

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

  protected updateUnitAmount(unitId: string, amount: number): void {
    this.updateTroopPlan((troopPlan) => ({
      unitAmounts: {
        ...troopPlan.unitAmounts,
        [unitId]: normalizeNonNegativeInteger(amount),
      },
    }));
  }

  protected updateBuildingLevel(buildingId: string, level: number): void {
    this.updateCityPlan((cityPlan) => ({
      buildingLevels: {
        ...cityPlan.buildingLevels,
        [buildingId]: clampBuildingLevel(buildingId, level),
      },
    }));
  }

  protected toggleCityModifier(modifierId: CityModifierToggleId): void {
    if (modifierId === 'landExpansion') {
      this.updateBuildingLevel(
        'land_expansion',
        (this.buildingLevels()['land_expansion'] ?? 0) > 0
          ? 0
          : getBuildingMaxLevel('land_expansion'),
      );
      return;
    }

    this.updateCityPlan((cityPlan) => ({
      modifiers: {
        ...cityPlan.modifiers,
        [modifierId]: !cityPlan.modifiers[modifierId],
      },
    }));
  }

  protected selectSpecialBuilding(slotId: string, optionId: string): void {
    this.updateCityPlan((cityPlan) => ({
      specialBuildings: {
        ...cityPlan.specialBuildings,
        [slotId as CitySpecialBuildingSlotId]: optionId as CitySpecialBuildingOptionId,
      },
    }));
  }

  private updateCityPlan(
    createPartialCityPlan: (cityPlan: CityConfiguration) => Partial<CityConfiguration>,
  ): void {
    this.planConfigService.updateActiveCityPlan(createPartialCityPlan(this.activeCityPlan()));
  }

  private updateTroopPlan(
    createPartialTroopPlan: (troopPlan: TroopConfiguration) => Partial<TroopConfiguration>,
  ): void {
    this.planConfigService.updateActiveTroopPlan(createPartialTroopPlan(this.activeTroopPlan()));
  }

  private createNewPlanFromPrompt(): void {
    this.planImportExportUiService.closePlanImportDialog();
    const defaultName = this.translationService.translate(
      'plannerV2.planControls.defaultPlanName',
      'New Plan',
    );
    const message = this.translationService.translate(
      'plannerV2.planControls.newPrompt',
      'Enter a name for the new empty plan.',
    );
    const requestedName = window.prompt(message, defaultName);

    if (requestedName === null) {
      return;
    }

    const createdPlan = this.planConfigService.createNewPlan(requestedName);

    this.localPlanNotice.set({
      tone: 'success',
      titleKey: 'plannerV2.planControls.createdTitle',
      titleFallback: 'Plan created',
      detailLines: [
        this.translationService.translate(
          'plannerV2.planControls.createdDetail',
          'Now editing: {name}.',
          { name: createdPlan.name },
        ),
      ],
    });
  }

  private deleteActivePlanWithConfirmation(): void {
    this.planImportExportUiService.closePlanImportDialog();

    if (!this.canDeleteActivePlan()) {
      this.localPlanNotice.set({
        tone: 'error',
        titleKey: 'planConfig.deleteDialog.errorTitle',
        titleFallback: 'Plan not deleted',
        detailLines: [
          this.translationService.translate(
            'planConfig.deleteDialog.lastPlanDetail',
            'At least one plan is required. Create or import another plan before deleting this one.',
          ),
        ],
      });
      return;
    }

    const confirmed = window.confirm(
      this.translationService.translate(
        'plannerV2.planControls.deleteConfirm',
        'Delete "{name}" from this browser? Export it first if you want a backup.',
        { name: this.activePlan().name },
      ),
    );

    if (!confirmed) {
      return;
    }

    const result = this.planConfigService.deleteActivePlan();

    if (!result) {
      this.localPlanNotice.set({
        tone: 'error',
        titleKey: 'planConfig.deleteDialog.errorTitle',
        titleFallback: 'Plan not deleted',
        detailLines: [
          this.translationService.translate(
            'planConfig.deleteDialog.lastPlanDetail',
            'At least one plan is required. Create or import another plan before deleting this one.',
          ),
        ],
      });
      return;
    }

    this.localPlanNotice.set({
      tone: 'success',
      titleKey: 'planConfig.deleteDialog.successTitle',
      titleFallback: 'Plan deleted',
      detailLines: [
        this.translationService.translate(
          'planConfig.deleteDialog.deletedDetail',
          '{name} deleted.',
          { name: result.deletedPlanName },
        ),
        this.translationService.translate(
          'planConfig.deleteDialog.selectedDetail',
          'Now selected: {name}.',
          { name: result.selectedPlanName },
        ),
      ],
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
