import { CityConfiguration } from '../models/city-configuration.model';
import { calculateCityPlannerPopulation } from './city-planner-population';

const baseCityConfiguration: CityConfiguration = {
  id: 'city-population-test',
  name: 'Population Test City',
  isPreset: false,
  buildingLevels: {
    farm: 10,
    senate: 9,
    academy: 0,
    timber_camp: 1,
    quarry: 1,
    silver_mine: 1,
    barracks: 1,
    harbour: 0,
    city_wall: 0,
    temple: 1,
    marketplace: 1,
    cave: 0,
    warehouse: 1,
    land_expansion: 1,
  },
  modifiers: {
    plowResearched: true,
    aphroditeActive: true,
  },
  specialBuildings: {
    slot1: 'thermal_baths',
    slot2: 'tower',
  },
};

describe('calculateCityPlannerPopulation', () => {
  it('calculates the city planner reference population values', () => {
    const result = calculateCityPlannerPopulation(baseCityConfiguration);

    expect(result.populationCapacity).toBe(744);
    expect(result.usedPopulation).toBe(159);
    expect(result.freePopulation).toBe(585);
  });

  it('applies Aphrodite before the thermal baths percentage bonus', () => {
    const result = calculateCityPlannerPopulation(baseCityConfiguration);

    expect(result.breakdown.farmLevel).toBe(10);
    expect(result.breakdown.farmCapacity).toBe(399);
    expect(result.breakdown.aphroditeCapacity).toBe(50);
    expect(result.breakdown.thermalBaseCapacity).toBe(449);
    expect(result.breakdown.thermalAdjustedCapacity).toBe(494);
  });

  it('keeps thermal baths inactive when the building is not selected', () => {
    const result = calculateCityPlannerPopulation({
      ...baseCityConfiguration,
      specialBuildings: {
        slot1: 'none',
        slot2: 'tower',
      },
    });

    expect(result.breakdown.thermalAdjustedCapacity).toBe(449);
    expect(result.populationCapacity).toBe(699);
    expect(result.usedPopulation).toBe(99);
    expect(result.freePopulation).toBe(600);
  });

  it('clamps configured building levels to city planner min and max levels', () => {
    const result = calculateCityPlannerPopulation({
      ...baseCityConfiguration,
      buildingLevels: {
        ...baseCityConfiguration.buildingLevels,
        farm: 99,
        senate: 0,
      },
    });

    expect(result.breakdown.farmLevel).toBe(45);
    expect(result.breakdown.farmCapacity).toBe(3560);
    expect(result.usedPopulation).toBe(159);
  });

  it('matches the Rattan real-game population reference', () => {
    const result = calculateCityPlannerPopulation({
      id: 'reference-rattan',
      name: '55D08 Rattan',
      isPreset: false,
      buildingLevels: {
        senate: 18,
        timber_camp: 15,
        farm: 10,
        quarry: 20,
        warehouse: 13,
        silver_mine: 17,
        barracks: 5,
        temple: 5,
        marketplace: 6,
        harbour: 0,
        academy: 23,
        city_wall: 0,
        cave: 2,
        land_expansion: 0,
      },
      modifiers: {
        plowResearched: true,
        aphroditeActive: false,
      },
      specialBuildings: {
        slot1: 'none',
        slot2: 'none',
      },
    });

    expect(result.populationCapacity).toBe(599);
    expect(result.usedPopulation).toBe(309);
    expect(result.freePopulation).toBe(290);
  });

  it('matches the Bisasam real-game population reference with land expansion', () => {
    const result = calculateCityPlannerPopulation({
      id: 'reference-bisasam',
      name: '55D01 Bisasam',
      isPreset: false,
      buildingLevels: {
        senate: 24,
        timber_camp: 23,
        farm: 45,
        quarry: 36,
        warehouse: 31,
        silver_mine: 35,
        barracks: 15,
        temple: 5,
        marketplace: 16,
        harbour: 10,
        academy: 30,
        city_wall: 4,
        cave: 10,
        land_expansion: 3,
      },
      modifiers: {
        plowResearched: true,
        aphroditeActive: true,
      },
      specialBuildings: {
        slot1: 'thermal_baths',
        slot2: 'merchants_shop',
      },
    });

    expect(result.populationCapacity).toBe(4514);
    expect(result.usedPopulation).toBe(717);
    expect(result.freePopulation).toBe(3797);
  });
});
