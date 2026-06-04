import { defaultGrepolisGodId, type GrepolisGodId } from '../../models/god.model';

export const pygmalionGodId = defaultGrepolisGodId;
export const pygmalionCityModifierId = 'aphroditeActive' as const;

export function isPygmalionGodSelected(selectedGod: GrepolisGodId | string): boolean {
  return selectedGod === pygmalionGodId;
}

export function getPygmalionModifierState(selectedGod: GrepolisGodId | string): boolean {
  return isPygmalionGodSelected(selectedGod);
}
