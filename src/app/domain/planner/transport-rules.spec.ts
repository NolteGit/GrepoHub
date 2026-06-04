import { describe, expect, it } from 'vitest';

import type { Unit } from '../../models/unit.model';

import {
  bunksCapacityBonusPerShip,
  calculateBunksBonus,
  fastTransportShipId,
  getRequiredTransportShipCount,
  getTransportShipCapacity,
  isTransportShipUnitId,
  slowTransportShipId,
} from './transport-rules';

const createUnit = (unit: Partial<Unit> & Pick<Unit, 'id'>): Unit => ({
  id: unit.id,
  nameKey: `unit.${unit.id}`,
  type: unit.type ?? 'sea',
  isMythical: unit.isMythical ?? false,
  god: unit.god ?? null,
  cost: unit.cost ?? {
    wood: 0,
    stone: 0,
    silver: 0,
    favor: 0,
    population: 0,
  },
  transportCapacity: unit.transportCapacity ?? 0,
  transportSpace: unit.transportSpace ?? 0,
  attack: unit.attack ?? 0,
  attackType: unit.attackType ?? 'blunt',
  defenseBlunt: unit.defenseBlunt ?? 0,
  defenseSharp: unit.defenseSharp ?? 0,
  defenseDistance: unit.defenseDistance ?? 0,
  attackSea: unit.attackSea ?? 0,
  defenseSea: unit.defenseSea ?? 0,
});

describe('transport rules', () => {
  it('identifies the known transport ship ids', () => {
    expect(isTransportShipUnitId(slowTransportShipId)).toBe(true);
    expect(isTransportShipUnitId(fastTransportShipId)).toBe(true);
    expect(isTransportShipUnitId('bireme')).toBe(false);
  });

  it('applies bunks only to positive transport capacity', () => {
    const units = [
      createUnit({ id: slowTransportShipId, transportCapacity: 20 }),
      createUnit({ id: fastTransportShipId, transportCapacity: 10 }),
      createUnit({ id: 'bireme', transportCapacity: 0 }),
    ];

    expect(getTransportShipCapacity(units, slowTransportShipId, false)).toBe(20);
    expect(getTransportShipCapacity(units, slowTransportShipId, true)).toBe(
      20 + bunksCapacityBonusPerShip,
    );
    expect(getTransportShipCapacity(units, fastTransportShipId, true)).toBe(
      10 + bunksCapacityBonusPerShip,
    );
    expect(getTransportShipCapacity(units, 'bireme', true)).toBe(0);
  });

  it('rounds required ships up and handles impossible capacity safely', () => {
    expect(getRequiredTransportShipCount(0, 20)).toBe(0);
    expect(getRequiredTransportShipCount(1, 0)).toBe(0);
    expect(getRequiredTransportShipCount(40, 20)).toBe(2);
    expect(getRequiredTransportShipCount(41, 20)).toBe(3);
  });

  it('calculates bunks bonus from selected transport ship count only', () => {
    expect(calculateBunksBonus(0, true)).toBe(0);
    expect(calculateBunksBonus(3, false)).toBe(0);
    expect(calculateBunksBonus(3, true)).toBe(18);
  });
});
