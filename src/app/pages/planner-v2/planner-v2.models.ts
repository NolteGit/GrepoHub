import type {
  CityModifierId,
  CitySpecialBuildingOptionId,
  CitySpecialBuildingSlotId,
} from '../../models/city-configuration.model';

export type TranslatableText = {
  readonly labelKey: string;
  readonly fallback: string;
};

export type BuildingTileStat = TranslatableText & {
  readonly value: string;
  readonly tone?: 'default' | 'gold' | 'muted';
};

export type BuildingTileView = TranslatableText & {
  readonly id: string;
  readonly imagePath: string;
  readonly icon: string;
  readonly level: number;
  readonly maxLevel: number;
  readonly stats: readonly BuildingTileStat[];
};

export type UnitTileStat = TranslatableText & {
  readonly value: string;
  readonly tone?: 'default' | 'gold' | 'muted';
};

export type UnitTileView = TranslatableText & {
  readonly id: string;
  readonly imagePath: string;
  readonly icon: string;
  readonly amount: number;
  readonly stats: readonly UnitTileStat[];
};

type SetupBarTab = TranslatableText & {
  readonly shortLabelKey: string;
  readonly shortFallback: string;
  readonly icon: string;
};

export type TroopCategory = 'land' | 'sea' | 'mythical';

export type TroopCategoryTab = SetupBarTab & {
  readonly id: TroopCategory;
};

export type SetupContextItem = TranslatableText & {
  readonly icon: string;
  readonly value: string;
};

export type CityModifierToggleId = CityModifierId | 'landExpansion';

export type CityModifierToggle = SetupBarTab & {
  readonly id: CityModifierToggleId;
  readonly active: boolean;
};

export type SpecialBuildingSlotView = TranslatableText & {
  readonly id: CitySpecialBuildingSlotId;
  readonly value: CitySpecialBuildingOptionId;
  readonly options: readonly SpecialBuildingOptionView[];
};

export type SpecialBuildingOptionView = TranslatableText & {
  readonly value: CitySpecialBuildingOptionId;
};

export type GodOption = TranslatableText & {
  readonly value: string;
};

export type SidebarUsedUnit = TranslatableText & {
  readonly imagePath: string;
  readonly icon: string;
  readonly amount: number;
  readonly displayAmount: string;
  readonly sharePercent: number;
};

export type SidebarTroopBattleStats = {
  readonly attackBlunt: number;
  readonly attackSharp: number;
  readonly attackDistance: number;
  readonly attackSea: number;
  readonly defenseBlunt: number;
  readonly defenseSharp: number;
  readonly defenseDistance: number;
  readonly defenseSea: number;
};

export type SidebarTroopTransportStats = {
  readonly transportCapacity: number;
  readonly transportSpace: number;
  readonly transportBalance: number;
  readonly transportUsagePercent: number;
  readonly bunksBonus: number;
};

export type SidebarPopulationStats = {
  readonly activePlanName: string;
  readonly populationCapacity: number;
  readonly usedPopulation: number;
  readonly troopPopulation: number;
  readonly freePopulation: number;
  readonly freePopulationAfterTroops: number;
  readonly freeBhp: number;
  readonly usedBuildingLevels: number;
  readonly activeBuildingCount: number;
  readonly activeModifierCount: number;
  readonly selectedSpecialBuildingCount: number;
};
