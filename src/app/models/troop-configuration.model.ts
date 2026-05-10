export type TroopModifierId = 'bunks';

export type TroopConfiguration = {
  id: string;
  name: string;
  isPreset: boolean;
  unitAmounts: Record<string, number>;
  modifiers: Record<TroopModifierId, boolean>;
};
