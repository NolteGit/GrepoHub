import { describe, expect, it } from 'vitest';

import {
  clampCityBuildingLevel,
  clampCityBuildingLevelForPopulation,
  clampLandExpansionLevel,
  createLandExpansionProgressSteps,
  createMinimumCityBuildingLevels,
  getCityBuildingDefinition,
  getCityBuildingMaxLevel,
  getCityBuildingMinimumLevel,
  getLandExpansionPopulationBonus,
  landExpansionMaxLevel,
} from './building-rules';

describe('building rules', () => {
  it('looks up building definitions and max levels', () => {
    expect(getCityBuildingDefinition('farm')?.maxLevel).toBe(45);
    expect(getCityBuildingMaxLevel('cave')).toBe(10);
    expect(getCityBuildingMaxLevel('unknown')).toBe(40);
  });

  it('clamps normal building levels to non-negative integers and max level', () => {
    expect(clampCityBuildingLevel('farm', -1)).toBe(0);
    expect(clampCityBuildingLevel('farm', 46)).toBe(45);
    expect(clampCityBuildingLevel('farm', 12.4)).toBe(12);
    expect(clampCityBuildingLevel('farm', Number.NaN)).toBe(0);
  });

  it('clamps land expansion to its own max level', () => {
    expect(landExpansionMaxLevel).toBe(6);
    expect(clampLandExpansionLevel(-1)).toBe(0);
    expect(clampLandExpansionLevel(4)).toBe(4);
    expect(clampLandExpansionLevel(99)).toBe(6);
    expect(clampCityBuildingLevel('land_expansion', 99)).toBe(6);
  });

  it('calculates land expansion population and progress consistently', () => {
    expect(getLandExpansionPopulationBonus(0)).toBe(0);
    expect(getLandExpansionPopulationBonus(3)).toBe(150);
    expect(getLandExpansionPopulationBonus(99)).toBe(300);
    expect(createLandExpansionProgressSteps(2)).toEqual([true, true, false, false, false, false]);
  });

  it('creates the minimum building level table used by new city plans', () => {
    expect(createMinimumCityBuildingLevels()).toMatchObject({
      barracks: 1,
      farm: 1,
      senate: 1,
      warehouse: 1,
    });
  });

  it('exposes the city setup minimum level for stepper reset actions', () => {
    expect(getCityBuildingMinimumLevel('senate')).toBe(1);
    expect(getCityBuildingMinimumLevel('farm')).toBe(1);
    expect(getCityBuildingMinimumLevel('harbour')).toBe(0);
    expect(getCityBuildingMinimumLevel('land_expansion')).toBe(0);
    expect(getCityBuildingMinimumLevel('unknown')).toBe(0);
  });

  it('applies population-context minimum levels where Grepolis requires them', () => {
    expect(clampCityBuildingLevelForPopulation('senate', 0)).toBe(1);
    expect(clampCityBuildingLevelForPopulation('farm', 0)).toBe(1);
    expect(clampCityBuildingLevelForPopulation('academy', 0)).toBe(0);
    expect(clampCityBuildingLevelForPopulation('unknown', 4)).toBe(4);
  });
});
