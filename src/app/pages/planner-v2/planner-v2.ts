import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  cityBuildingPlanDefinitions,
  citySpecialBuildingSlotDefinitions,
} from '../../data/city-planner-presets';
import {
  getBattleIconPath,
  getBuildingImagePath,
  getResourceIconPath,
  getUnitIconPath,
} from '../../data/asset-paths';
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
  SetupContextItem,
  SidebarPopulationStats,
  SidebarTroopBattleStats,
  SidebarTroopTransportStats,
  SidebarUsedUnit,
  SpecialBuildingOptionView,
  TilePopulationBadge,
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

const unitSpeedById: Record<string, number> = {
  militia: 0,
  swordsman: 8,
  slinger: 14,
  archer: 12,
  hoplite: 6,
  horseman: 22,
  chariot: 18,
  catapult: 2,
  divine_envoy: 16,
  minotaur: 10,
  manticore: 22,
  cyclop: 8,
  hydra: 8,
  harpy: 28,
  medusa: 6,
  centaur: 18,
  pegasus: 35,
  cerberus: 4,
  erinys: 10,
  griffin: 18,
  calydonian_boar: 16,
  siren: 22,
  satyr: 136,
  ladon: 40,
  spartoi: 16,
  transport_boat: 8,
  bireme: 15,
  light_ship: 15,
  fire_ship: 5,
  fast_transport_ship: 15,
  trireme: 15,
  colony_ship: 3,
};

type BuildingEffectChip = {
  readonly icon?: string;
  readonly iconPath?: string;
  readonly labelKey: string;
  readonly fallback: string;
};

const buildingEffectChips: Record<string, BuildingEffectChip> = {
  senate: {
    iconPath: getResourceIconPath('buildtime'),
    labelKey: 'plannerV2.buildingEffect.buildSpeed',
    fallback: 'Build speed',
  },
  timber_camp: {
    iconPath: getResourceIconPath('wood'),
    labelKey: 'plannerV2.buildingEffect.woodProduction',
    fallback: 'Wood/h',
  },
  farm: {
    iconPath: getResourceIconPath('population'),
    labelKey: 'plannerV2.buildingEffect.maxPopulation',
    fallback: 'Max pop',
  },
  quarry: {
    iconPath: getResourceIconPath('stone'),
    labelKey: 'plannerV2.buildingEffect.stoneProduction',
    fallback: 'Stone/h',
  },
  warehouse: {
    iconPath: getBattleIconPath('capacity'),
    labelKey: 'plannerV2.buildingEffect.capacity',
    fallback: 'Capacity',
  },
  silver_mine: {
    iconPath: getResourceIconPath('silver'),
    labelKey: 'plannerV2.buildingEffect.silverProduction',
    fallback: 'Silver/h',
  },
  barracks: {
    iconPath: getBattleIconPath('speed'),
    labelKey: 'plannerV2.buildingEffect.recruitSpeed',
    fallback: 'Recruit speed',
  },
  temple: {
    iconPath: getResourceIconPath('favor'),
    labelKey: 'plannerV2.buildingEffect.favorProduction',
    fallback: 'Favor/h',
  },
  marketplace: {
    icon: '🔁',
    labelKey: 'plannerV2.buildingEffect.trade',
    fallback: 'Trade',
  },
  harbour: {
    iconPath: getBattleIconPath('speed'),
    labelKey: 'plannerV2.buildingEffect.recruitSpeed',
    fallback: 'Recruit speed',
  },
  academy: {
    icon: '🔬',
    labelKey: 'plannerV2.buildingEffect.researchPoints',
    fallback: 'Research pts',
  },
  city_wall: {
    iconPath: getBattleIconPath('defenseBlunt'),
    labelKey: 'plannerV2.buildingEffect.defensePercent',
    fallback: 'Defense %',
  },
  cave: {
    iconPath: getResourceIconPath('silver'),
    labelKey: 'plannerV2.buildingEffect.silverCap',
    fallback: 'Silver cap',
  },
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

const landExpansionMaxLevel = 6;
const landExpansionPopulationPerLevel = 50;

const specialBuildingEffectFallbacks: Record<string, string> = {
  none: 'None selected',
  theatre: 'Extra slow culture points possible',
  thermal_baths: '+10% maximum population',
  library: '+12 research points',
  lighthouse: '+15% naval movement',
  tower: '+10% defense buff',
  divine_statue: 'Counts as +5 temple levels for favor production',
  oracle: 'Shows information when you are being spied on',
  merchants_shop: '+50% trade, BD trade and Phoenician trade',
};

const getBuildingDefinition = (buildingId: string) => {
  return cityBuildingPlanDefinitions.find((building) => building.id === buildingId);
};

const getBuildingMaxLevel = (buildingId: string): number => {
  return getBuildingDefinition(buildingId)?.maxLevel ?? 40;
};

const normalizeNonNegativeInteger = (value: number): number => {
  return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
};

const clampLandExpansionLevel = (level: number): number => {
  return Math.min(landExpansionMaxLevel, normalizeNonNegativeInteger(level));
};

const clampBuildingLevel = (buildingId: string, level: number): number => {
  if (buildingId === 'land_expansion') {
    return clampLandExpansionLevel(level);
  }

  return Math.min(getBuildingMaxLevel(buildingId), normalizeNonNegativeInteger(level));
};

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

const getLandExpansionPopulationBonus = (level: number): number => {
  return clampLandExpansionLevel(level) * landExpansionPopulationPerLevel;
};

const formatLandExpansionDetail = (level: number): string => {
  const normalizedLevel = clampLandExpansionLevel(level);
  const populationBonus = getLandExpansionPopulationBonus(normalizedLevel);

  return `Level ${normalizedLevel}/${landExpansionMaxLevel} · +${formatNumber(populationBonus)} BHP`;
};

const createLandExpansionProgressSteps = (level: number): readonly boolean[] => {
  const normalizedLevel = clampLandExpansionLevel(level);

  return Array.from({ length: landExpansionMaxLevel }, (_, index) => index < normalizedLevel);
};

const createTilePopulationBadge = (
  value: number,
  fallback: string,
  useSignedGain = false,
): TilePopulationBadge => {
  const tone = value > 0 ? 'gain' : value < 0 ? 'used' : 'muted';
  const displayValue = value > 0 && useSignedGain ? `+${formatNumber(value)}` : formatNumber(value);

  return {
    labelKey: 'plannerV2.stat.populationShort',
    fallback,
    value: displayValue,
    tone,
  };
};

const getUnitAmountMax = (unit: Unit): number => {
  const populationCost = Math.max(1, unit.cost.population);
  return Math.ceil(5000 / populationCost);
};

type CostSummary = {
  readonly wood: number | null;
  readonly stone: number | null;
  readonly silver: number | null;
  readonly favor?: number | null;
};

const hasKnownCost = (cost: CostSummary): boolean => {
  return [cost.wood, cost.stone, cost.silver, cost.favor ?? null].some((value) => value !== null);
};

const formatCostSummary = (cost?: CostSummary): string => {
  if (!cost || !hasKnownCost(cost)) {
    return 'Costs';
  }

  const parts = [
    cost.wood !== null ? `W ${formatNumber(cost.wood)}` : null,
    cost.stone !== null ? `S ${formatNumber(cost.stone)}` : null,
    cost.silver !== null ? `Ag ${formatNumber(cost.silver)}` : null,
    cost.favor !== undefined && cost.favor !== null && cost.favor > 0
      ? `F ${formatNumber(cost.favor)}`
      : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(' · ') : 'Costs';
};

const createCostTooltipItems = (cost?: CostSummary) => {
  if (!cost || !hasKnownCost(cost)) {
    return [];
  }

  return [
    cost.wood !== null
      ? {
          iconPath: getResourceIconPath('wood'),
          labelKey: 'resource.wood',
          fallback: 'Wood',
          value: formatNumber(cost.wood),
          tone: cost.wood > 0 ? ('gold' as const) : ('muted' as const),
        }
      : null,
    cost.stone !== null
      ? {
          iconPath: getResourceIconPath('stone'),
          labelKey: 'resource.stone',
          fallback: 'Stone',
          value: formatNumber(cost.stone),
          tone: cost.stone > 0 ? ('gold' as const) : ('muted' as const),
        }
      : null,
    cost.silver !== null
      ? {
          iconPath: getResourceIconPath('silver'),
          labelKey: 'resource.silver',
          fallback: 'Silver',
          value: formatNumber(cost.silver),
          tone: cost.silver > 0 ? ('gold' as const) : ('muted' as const),
        }
      : null,
    cost.favor !== undefined && cost.favor !== null && cost.favor > 0
      ? {
          iconPath: getResourceIconPath('favor'),
          labelKey: 'resource.favor',
          fallback: 'Favor',
          value: formatNumber(cost.favor),
          tone: 'gold' as const,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);
};

const createCostStat = (cost?: CostSummary): BuildingTileStat | UnitTileStat => ({
  labelKey: 'troopsPlanner.costsShort',
  fallback: `Costs: ${formatCostSummary(cost)}`,
  value: '',
  tone: 'gold',
  tooltipItems: createCostTooltipItems(cost),
});

const formatPositiveBuildingEffect = (value: number): string => {
  return value > 0 ? `+${formatNumber(value)}` : formatNumber(value);
};

type BuildingEffectValueContext = {
  readonly buildingId: string;
  readonly level: number;
  readonly population: number;
  readonly divineStatueCount: number;
};

const senateConstructionTimePercentByLevel = [
  100, 100, 98.6, 97, 95.3, 93.5, 91.5, 89.5, 87.4, 85.3, 83, 80.8, 78.4, 76.1, 73.7, 71.2, 68.7,
  66.1, 63.6, 60.9, 58.3, 55.6, 52.9, 50.1, 47.4, 44.5,
] as const;

const recruitmentDurationPercentByLevel = [
  100, 100, 99, 97.9, 96.7, 95.4, 94.1, 92.8, 91.5, 90.2, 88.8, 87.4, 86, 84.6, 83.2, 81.8, 80.3,
  78.9, 77.4, 76, 74.5, 73, 71.5, 70, 68.5, 67, 65.5, 64, 62.5, 60.9, 59.4,
] as const;

const resourceProductionByLevel = [
  0, 8, 12, 18, 24, 30, 37, 43, 51, 58, 66, 73, 81, 89, 98, 106, 114, 123, 132, 141, 150, 159, 168,
  178, 187, 197, 206, 216, 226, 236, 246, 256, 266, 276, 286, 297, 307, 318, 328, 339, 350,
] as const;

const warehouseStorageWithoutCeramicsByLevel = [
  0, 300, 711, 1185, 1706, 2267, 2862, 3487, 4140, 4818, 5518, 6241, 6984, 7746, 8526, 9324, 10138,
  10969, 11815, 12675, 13550, 14439, 15341, 16257, 17185, 18125, 19077, 20041, 21016, 22003, 23000,
  24008, 25026, 26055, 27093, 28142,
] as const;

const cityWallDefenseBonusPercentByLevel = [
  0, 3.7, 7.5, 11.4, 15.5, 19.7, 24.1, 28.5, 33.3, 38, 43, 48.1, 53.5, 59, 64.7, 70.5, 76.7, 82.9,
  89.5, 96.2, 103.3, 110.4, 117.9, 125.6, 133.6, 141.9,
] as const;

const getIndexedBuildingValue = (values: readonly number[], level: number): number => {
  const index = Math.max(0, Math.min(values.length - 1, level));

  return values[index] ?? 0;
};

const getCityWallBaseDefense = (level: number): number => {
  return (Math.max(0, level) + 1) * 10;
};

const formatPercent = (value: number): string => {
  return `${value.toLocaleString('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  })}%`;
};

const formatDecimal = (value: number): string => {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
};

const getBuildingEffectValue = (context: BuildingEffectValueContext): string => {
  const { buildingId, divineStatueCount, level, population } = context;

  if (buildingId === 'senate') {
    return formatPercent(getIndexedBuildingValue(senateConstructionTimePercentByLevel, level));
  }

  if (buildingId === 'timber_camp' || buildingId === 'quarry' || buildingId === 'silver_mine') {
    return formatNumber(getIndexedBuildingValue(resourceProductionByLevel, level));
  }

  if (buildingId === 'farm') {
    return formatPositiveBuildingEffect(population);
  }

  if (buildingId === 'warehouse') {
    return formatNumber(getIndexedBuildingValue(warehouseStorageWithoutCeramicsByLevel, level));
  }

  if (buildingId === 'cave') {
    return level >= getBuildingMaxLevel('cave') ? '∞' : formatNumber(level * 1000);
  }

  if (buildingId === 'temple') {
    return formatDecimal(Math.sqrt(level + divineStatueCount * 5));
  }

  if (buildingId === 'marketplace') {
    return formatNumber(level * 500);
  }

  if (buildingId === 'barracks' || buildingId === 'harbour') {
    return formatPercent(getIndexedBuildingValue(recruitmentDurationPercentByLevel, level));
  }

  if (buildingId === 'academy') {
    return formatNumber(level * 4);
  }

  if (buildingId === 'city_wall') {
    return formatPercent(getIndexedBuildingValue(cityWallDefenseBonusPercentByLevel, level));
  }

  return formatNumber(level);
};

const createBuildingEffectTooltipItems = (
  effect: BuildingEffectChip,
  context: BuildingEffectValueContext,
  value: string,
): NonNullable<BuildingTileStat['tooltipItems']> => [
  {
    icon: effect.icon,
    iconPath: effect.iconPath,
    labelKey: effect.labelKey,
    fallback: effect.fallback,
    value,
    tone: value === '0' ? ('muted' as const) : ('default' as const),
  },
  ...(context.buildingId === 'city_wall'
    ? [
        {
          iconPath: getBattleIconPath('defenseBlunt'),
          labelKey: 'plannerV2.buildingEffect.baseDefense',
          fallback: 'Base defense',
          value: formatNumber(getCityWallBaseDefense(context.level)),
          tone: 'default' as const,
        },
      ]
    : []),
];

const getLandAttackIconPath = (attackType: Unit['attackType']): string => {
  if (attackType === 'sharp') {
    return getBattleIconPath('attackSharp');
  }

  if (attackType === 'distance') {
    return getBattleIconPath('attackDistance');
  }

  return getBattleIconPath('attackBlunt');
};

const createIconValueStat = (
  iconPath: string,
  labelKey: string,
  fallback: string,
  value: string | number,
  tone: UnitTileStat['tone'] = 'default',
): UnitTileStat => {
  const formattedValue = typeof value === 'number' ? formatNumber(value) : value;

  return {
    iconPath,
    labelKey,
    fallback,
    value: formattedValue,
    tone,
    tooltipItems: [
      {
        iconPath,
        labelKey,
        fallback,
        value: formattedValue,
        tone,
      },
    ],
  };
};

const createLandDefenseStat = (unit: Unit): UnitTileStat => {
  const defenseTotal = unit.defenseBlunt + unit.defenseSharp + unit.defenseDistance;

  return {
    iconPath: getBattleIconPath('defenseBlunt'),
    labelKey: 'plannerV2.stat.defense',
    fallback: 'Defense',
    value: formatNumber(defenseTotal),
    tone: defenseTotal > 0 ? 'default' : 'muted',
    tooltipItems: [
      {
        iconPath: getBattleIconPath('defenseBlunt'),
        labelKey: 'plannerV2.summary.defenseBlunt',
        fallback: 'Blunt defense',
        value: formatNumber(unit.defenseBlunt),
        tone: unit.defenseBlunt > 0 ? 'default' : 'muted',
      },
      {
        iconPath: getBattleIconPath('defenseSharp'),
        labelKey: 'plannerV2.summary.defenseSharp',
        fallback: 'Sharp defense',
        value: formatNumber(unit.defenseSharp),
        tone: unit.defenseSharp > 0 ? 'default' : 'muted',
      },
      {
        iconPath: getBattleIconPath('defenseDistance'),
        labelKey: 'plannerV2.summary.defenseDistance',
        fallback: 'Distance defense',
        value: formatNumber(unit.defenseDistance),
        tone: unit.defenseDistance > 0 ? 'default' : 'muted',
      },
    ],
  };
};

const createBuildingEffectStat = (
  buildingId: string,
  level: number,
  population: number,
  divineStatueCount: number,
): BuildingTileStat => {
  const effect = buildingEffectChips[buildingId] ?? {
    icon: 'ℹ',
    labelKey: 'plannerV2.tile.info',
    fallback: 'Info',
  };
  const context = { buildingId, divineStatueCount, level, population };
  const value = getBuildingEffectValue(context);

  return {
    icon: effect.icon,
    iconPath: effect.iconPath,
    labelKey: effect.labelKey,
    fallback: `${effect.fallback}: ${value}`,
    value,
    tone: value === '0' ? 'muted' : 'default',
    tooltipItems: createBuildingEffectTooltipItems(effect, context, value),
  };
};

const clampPercentage = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const formatUnitFallback = (unitId: string): string =>
  unitId
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const isVisibleForTroopCategory = (unit: Unit, category: TroopCategory): boolean => {
  if (category === 'land') {
    return unit.type === 'land' && !unit.isMythical;
  }

  if (category === 'sea') {
    return unit.type === 'sea' && !unit.isMythical;
  }

  return unit.isMythical;
};

const createUnitTileStats = (unit: Unit, hasLighthouse: boolean): readonly UnitTileStat[] => {
  const baseSpeed = unitSpeedById[unit.id] ?? 0;
  const speed = hasLighthouse && unit.type === 'sea' ? Math.round(baseSpeed * 1.15) : baseSpeed;
  const isTransportShip = unit.type === 'sea' && unit.transportCapacity > 0 && unit.attackSea === 0;
  const stats: UnitTileStat[] = [];

  if (unit.type === 'sea') {
    if (!isTransportShip) {
      stats.push(
        createIconValueStat(
          getBattleIconPath('attackSea'),
          'unitAttribute.attackSea',
          'Naval Attack',
          unit.attackSea,
          'gold',
        ),
        createIconValueStat(
          getBattleIconPath('defenseSea'),
          'unitAttribute.defenseSea',
          'Naval Defense',
          unit.defenseSea,
        ),
      );
    }

    if (isTransportShip) {
      stats.push(
        createIconValueStat(
          getBattleIconPath('capacity'),
          'unitAttribute.transportCapacity',
          'Transport Capacity',
          unit.transportCapacity,
          unit.transportCapacity > 0 ? 'gold' : 'muted',
        ),
      );
    }
  } else {
    stats.push(
      createIconValueStat(
        getLandAttackIconPath(unit.attackType),
        'unitAttribute.attack',
        'Attack',
        unit.attack,
        'gold',
      ),
      createLandDefenseStat(unit),
    );
  }

  stats.push(
    createIconValueStat(
      getBattleIconPath('speed'),
      'unitAttribute.speed',
      'Speed',
      speed,
      speed > 0 ? 'default' : 'muted',
    ),
    createCostStat(unit.cost) as UnitTileStat,
  );

  return stats;
};

const createBuildingTileStats = (
  buildingId: string,
  level: number,
  population: number,
  divineStatueCount: number,
): readonly BuildingTileStat[] => [
  createBuildingEffectStat(buildingId, level, population, divineStatueCount),
];

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
  protected readonly troopCategories = troopCategories;
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
    const divineStatueCount = Object.values(this.activeCityPlan().specialBuildings).filter(
      (optionId) => optionId === 'divine_statue',
    ).length;

    return cityBuildingOrder.map((buildingId) => {
      const definition = getBuildingDefinition(buildingId);
      const level = buildingLevels[buildingId] ?? 0;
      const maxLevel = getBuildingMaxLevel(buildingId);
      const population = level > 0 ? (definition?.populationByLevel[level] ?? 0) : 0;
      const stats = createBuildingTileStats(buildingId, level, population, divineStatueCount);

      return {
        id: buildingId,
        labelKey: `building.${buildingId}`,
        fallback: buildingFallbacks[buildingId] ?? buildingId,
        icon: buildingFallbackIcons[buildingId] ?? '▥',
        imagePath: getBuildingImagePath(buildingId),
        level,
        maxLevel,
        populationBadge: createTilePopulationBadge(population, 'Population effect', true),
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
    const landExpansionLevel = clampLandExpansionLevel(buildingLevels['land_expansion'] ?? 0);

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
        active: landExpansionLevel > 0,
        detail: formatLandExpansionDetail(landExpansionLevel),
        progressSteps: createLandExpansionProgressSteps(landExpansionLevel),
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
  protected readonly troopCategoryContexts = computed<Record<TroopCategory, SetupContextItem>>(
    () => {
      const buildingLevels = this.buildingLevels();

      return {
        land: {
          labelKey: 'building.barracks',
          fallback: 'Barracks',
          icon: '⚔',
          value: String(buildingLevels['barracks'] ?? 0),
        },
        sea: {
          labelKey: 'building.harbour',
          fallback: 'Harbour',
          icon: '⚓',
          value: String(buildingLevels['harbour'] ?? 0),
        },
        mythical: {
          labelKey: 'building.temple',
          fallback: 'Temple',
          icon: '♛',
          value: String(buildingLevels['temple'] ?? 0),
        },
      };
    },
  );
  protected readonly visibleUnits = computed<readonly UnitTileView[]>(() => {
    const unitAmounts = this.unitAmounts();
    const category = this.selectedTroopCategory();
    const hasLighthouse = Object.values(this.activeCityPlan().specialBuildings).includes(
      'lighthouse',
    );

    return this.unitDefinitions()
      .filter((unit) => isVisibleForTroopCategory(unit, category))
      .map((unit) => {
        const amount = unitAmounts[unit.id] ?? 0;

        return {
          id: unit.id,
          labelKey: unit.nameKey,
          fallback: formatUnitFallback(unit.id),
          imagePath: getUnitIconPath(unit.id),
          icon: unitFallbackIcons[unit.id] ?? '⚔',
          amount,
          maxAmount: getUnitAmountMax(unit),
          populationBadge: createTilePopulationBadge(-(amount * unit.cost.population), 'BHP used'),
          stats: createUnitTileStats(unit, hasLighthouse),
        };
      });
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
      const currentLevel = clampLandExpansionLevel(this.buildingLevels()['land_expansion'] ?? 0);

      this.updateBuildingLevel(
        'land_expansion',
        currentLevel >= landExpansionMaxLevel ? 0 : currentLevel + 1,
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
    const isNone = optionId === 'none';
    const isThermalBaths = optionId === 'thermal_baths';

    return {
      value: optionId,
      labelKey: isNone ? 'plannerV2.none' : `building.${optionId}`,
      fallback: isNone ? 'None' : (buildingFallbacks[optionId] ?? optionId),
      icon: isNone ? '—' : (buildingFallbackIcons[optionId] ?? '★'),
      imagePath: isNone ? '' : getBuildingImagePath(optionId),
      effectLabelKey: `plannerV2.specialBuildingEffect.${optionId}`,
      effectFallback: specialBuildingEffectFallbacks[optionId] ?? 'Special building effect',
      populationBadgeValue: isNone ? '0' : isThermalBaths ? '+10%' : '-60',
      populationBadgeTone: isNone ? 'muted' : isThermalBaths ? 'gain' : 'used',
    };
  }
}
