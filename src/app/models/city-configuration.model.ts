export type CityModifierId =
  | 'specialBuildingSlot1'
  | 'specialBuildingSlot2'
  | 'plowResearched'
  | 'thermalBathsBuilt'
  | 'aphroditeActive';

export type CityConfiguration = {
  id: string;
  name: string;
  buildingLevels: Record<string, number>;
  modifiers: Record<CityModifierId, boolean>;
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