import type { CityConfiguration } from '../models/city-configuration.model';
import { defaultGrepolisGodId, type GrepolisGodId } from '../models/god.model';

export function isAphroditeGodSelected(selectedGod: GrepolisGodId | string): boolean {
  return selectedGod === defaultGrepolisGodId;
}

export function getEffectiveCityPlanForSelectedGod(
  cityPlan: CityConfiguration,
  selectedGod: GrepolisGodId | string,
): CityConfiguration {
  return {
    ...cityPlan,
    modifiers: {
      ...cityPlan.modifiers,
      aphroditeActive: isAphroditeGodSelected(selectedGod),
    },
  };
}
