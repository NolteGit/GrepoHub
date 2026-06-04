import type { CityConfiguration } from '../models/city-configuration.model';
import type { GrepolisGodId } from '../models/god.model';
import {
  getPygmalionModifierState,
  isPygmalionGodSelected,
} from '../domain/planner/god-effect-rules';

export const isAphroditeGodSelected = isPygmalionGodSelected;

export function getEffectiveCityPlanForSelectedGod(
  cityPlan: CityConfiguration,
  selectedGod: GrepolisGodId | string,
): CityConfiguration {
  return {
    ...cityPlan,
    modifiers: {
      ...cityPlan.modifiers,
      aphroditeActive: getPygmalionModifierState(selectedGod),
    },
  };
}
