import {
  calculateBunksBonus,
  fastTransportShipId,
  getRequiredTransportShipCount,
  getTransportShipCapacity,
  isTransportShipUnitId,
  slowTransportShipId,
} from '../domain/planner/transport-rules';
import type { TroopConfiguration } from '../models/troop-configuration.model';
import type { Unit } from '../models/unit.model';

export type TroopPlannerSummary = {
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
  readonly bunksEnabled: boolean;
  readonly slowTransportCapacity: number;
  readonly fastTransportCapacity: number;
  readonly slowTransportShipCount: number;
  readonly fastTransportShipCount: number;
  readonly requiredSlowTransportShips: number;
  readonly requiredFastTransportShips: number;
  readonly additionalSlowTransportShips: number;
  readonly additionalFastTransportShips: number;
};

type TroopPlannerTotals = Omit<
  TroopPlannerSummary,
  | 'transportBalance'
  | 'transportUsagePercent'
  | 'bunksBonus'
  | 'bunksEnabled'
  | 'slowTransportCapacity'
  | 'fastTransportCapacity'
  | 'requiredSlowTransportShips'
  | 'requiredFastTransportShips'
  | 'additionalSlowTransportShips'
  | 'additionalFastTransportShips'
>;

const clampPercentage = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const emptyTroopPlannerTotals: TroopPlannerTotals = {
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
  slowTransportShipCount: 0,
  fastTransportShipCount: 0,
};

export function calculateTroopPlannerSummary(
  troopPlan: TroopConfiguration,
  units: readonly Unit[],
): TroopPlannerSummary {
  const totals = units.reduce<TroopPlannerTotals>((sum, unit) => {
    const amount = troopPlan.unitAmounts[unit.id] ?? 0;

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
      totalDefense: sum.totalDefense + bluntDefense + sharpDefense + distanceDefense + navalDefense,
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
      transportShipCount: sum.transportShipCount + (isTransportShipUnitId(unit.id) ? amount : 0),
      slowTransportShipCount:
        sum.slowTransportShipCount + (unit.id === slowTransportShipId ? amount : 0),
      fastTransportShipCount:
        sum.fastTransportShipCount + (unit.id === fastTransportShipId ? amount : 0),
    };
  }, emptyTroopPlannerTotals);
  const bunksEnabled = troopPlan.modifiers.bunks;
  const bunksBonus = calculateBunksBonus(totals.transportShipCount, bunksEnabled);
  const transportCapacity = totals.transportCapacity + bunksBonus;
  const transportBalance = transportCapacity - totals.transportSpace;
  const slowTransportCapacity = getTransportShipCapacity(units, slowTransportShipId, bunksEnabled);
  const fastTransportCapacity = getTransportShipCapacity(units, fastTransportShipId, bunksEnabled);
  const missingTransportCapacity = Math.max(0, -transportBalance);

  return {
    ...totals,
    bunksBonus,
    bunksEnabled,
    slowTransportCapacity,
    fastTransportCapacity,
    transportCapacity,
    transportBalance,
    requiredSlowTransportShips: getRequiredTransportShipCount(
      totals.transportSpace,
      slowTransportCapacity,
    ),
    requiredFastTransportShips: getRequiredTransportShipCount(
      totals.transportSpace,
      fastTransportCapacity,
    ),
    additionalSlowTransportShips: getRequiredTransportShipCount(
      missingTransportCapacity,
      slowTransportCapacity,
    ),
    additionalFastTransportShips: getRequiredTransportShipCount(
      missingTransportCapacity,
      fastTransportCapacity,
    ),
    transportUsagePercent:
      totals.transportSpace > 0
        ? clampPercentage((transportCapacity / totals.transportSpace) * 100)
        : 0,
  };
}
