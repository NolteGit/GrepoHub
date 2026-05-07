export type CityModifierId = 'plowResearched' | 'aphroditeActive';

export type CitySpecialBuildingSlotId = 'slot1' | 'slot2';

export type CitySpecialBuildingOptionId =
  | 'none'
  | 'theatre'
  | 'thermal_baths'
  | 'library'
  | 'lighthouse'
  | 'tower'
  | 'divine_statue'
  | 'oracle'
  | 'merchants_shop';

export type CityConfiguration = {
  id: string;
  name: string;
  buildingLevels: Record<string, number>;
  modifiers: Record<CityModifierId, boolean>;
  specialBuildings: Record<CitySpecialBuildingSlotId, CitySpecialBuildingOptionId>;
  isPreset?: boolean;
};

export type CityBuildingPlanDefinition = {
  id: string;
  maxLevel: number;
  populationByLevel: number[];
};

export type CityModifierDefinition = {
  id: CityModifierId;
  populationDelta: number;
};

export type CitySpecialBuildingSlotDefinition = {
  id: CitySpecialBuildingSlotId;
  optionIds: CitySpecialBuildingOptionId[];
};

export type CitySpecialBuildingOptionDefinition = {
  id: CitySpecialBuildingOptionId;
  populationDelta: number;
};