export type TranslatableText = {
  readonly labelKey: string;
  readonly fallback: string;
};

export type BuildingTilePlaceholder = TranslatableText & {
  readonly icon: string;
  readonly level: number;
  readonly statLabelKey: string;
  readonly statFallback: string;
  readonly statValue: string;
};

export type UnitTilePlaceholder = TranslatableText & {
  readonly icon: string;
  readonly amount: string;
  readonly attack: number;
  readonly population: number;
  readonly time: string;
};

export type SetupBarTab = TranslatableText & {
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

export type CityModifierToggle = SetupBarTab & {
  readonly active: boolean;
};

export type GodOption = TranslatableText & {
  readonly value: string;
};

export type BottomSummaryStat = TranslatableText & {
  readonly value: string;
  readonly icon: string;
};
