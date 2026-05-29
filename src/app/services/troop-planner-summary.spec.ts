import { describe, expect, it } from 'vitest';

import type { TroopConfiguration } from '../models/troop-configuration.model';
import type { Unit } from '../models/unit.model';

import { calculateTroopPlannerSummary } from './troop-planner-summary';

const createUnit = (unit: Partial<Unit> & Pick<Unit, 'id'>): Unit => ({
  id: unit.id,
  nameKey: `unit.${unit.id}`,
  type: unit.type ?? 'land',
  isMythical: unit.isMythical ?? false,
  god: unit.god ?? null,
  cost: unit.cost ?? {
    wood: 0,
    stone: 0,
    silver: 0,
    favor: 0,
    population: 1,
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

const createTroopPlan = (
  unitAmounts: Record<string, number>,
  bunks = false,
): TroopConfiguration => ({
  id: 'test',
  name: 'Test',
  isPreset: false,
  unitAmounts,
  modifiers: {
    bunks,
  },
});

describe('calculateTroopPlannerSummary', () => {
  it('aggregates population, battle values, and resource costs', () => {
    const units = [
      createUnit({
        id: 'swordsman',
        cost: {
          wood: 95,
          stone: 0,
          silver: 85,
          favor: 0,
          population: 1,
        },
        attack: 5,
        attackType: 'blunt',
        defenseBlunt: 14,
        defenseSharp: 8,
        defenseDistance: 30,
      }),
      createUnit({
        id: 'bireme',
        type: 'sea',
        cost: {
          wood: 800,
          stone: 700,
          silver: 180,
          favor: 0,
          population: 8,
        },
        attackSea: 24,
        defenseSea: 160,
      }),
    ];

    const summary = calculateTroopPlannerSummary(
      createTroopPlan({
        swordsman: 10,
        bireme: 2,
      }),
      units,
    );

    expect(summary.totalUnits).toBe(12);
    expect(summary.usedPopulation).toBe(26);
    expect(summary.landPopulation).toBe(10);
    expect(summary.seaPopulation).toBe(16);
    expect(summary.attackBlunt).toBe(50);
    expect(summary.attackSea).toBe(48);
    expect(summary.defenseDistance).toBe(300);
    expect(summary.defenseSea).toBe(320);
    expect(summary.wood).toBe(2550);
    expect(summary.stone).toBe(1400);
    expect(summary.silver).toBe(1210);
  });

  it('calculates transport capacity, bunks bonus, and required ships', () => {
    const units = [
      createUnit({
        id: 'swordsman',
        cost: {
          wood: 0,
          stone: 0,
          silver: 0,
          favor: 0,
          population: 1,
        },
        transportSpace: 1,
      }),
      createUnit({
        id: 'transport_boat',
        type: 'sea',
        cost: {
          wood: 0,
          stone: 0,
          silver: 0,
          favor: 0,
          population: 7,
        },
        transportCapacity: 20,
      }),
      createUnit({
        id: 'fast_transport_ship',
        type: 'sea',
        cost: {
          wood: 0,
          stone: 0,
          silver: 0,
          favor: 0,
          population: 5,
        },
        transportCapacity: 10,
      }),
    ];

    const summary = calculateTroopPlannerSummary(
      createTroopPlan(
        {
          swordsman: 50,
          transport_boat: 1,
          fast_transport_ship: 1,
        },
        true,
      ),
      units,
    );

    expect(summary.transportSpace).toBe(50);
    expect(summary.transportCapacity).toBe(42);
    expect(summary.transportBalance).toBe(-8);
    expect(summary.transportShipCount).toBe(2);
    expect(summary.bunksBonus).toBe(12);
    expect(summary.slowTransportCapacity).toBe(26);
    expect(summary.fastTransportCapacity).toBe(16);
    expect(summary.requiredSlowTransportShips).toBe(2);
    expect(summary.requiredFastTransportShips).toBe(4);
    expect(summary.additionalSlowTransportShips).toBe(1);
    expect(summary.additionalFastTransportShips).toBe(1);
    expect(summary.transportUsagePercent).toBe(84);
  });
});
