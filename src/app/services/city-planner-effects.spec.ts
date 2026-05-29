import type { CityConfiguration } from '../models/city-configuration.model';
import { getEffectiveCityPlanForSelectedGod, isAphroditeGodSelected } from './city-planner-effects';

const cityPlan = {
  id: 'effects-test',
  name: 'Effects Test',
  note: '',
  buildingLevels: {
    senate: 9,
    timber_camp: 1,
    quarry: 1,
    silver_mine: 1,
    warehouse: 1,
    farm: 1,
    barracks: 1,
    academy: 0,
    city_wall: 0,
    cave: 0,
    marketplace: 1,
    temple: 1,
    harbour: 0,
  },
  modifiers: {
    plowResearched: false,
    aphroditeActive: false,
  },
  specialBuildings: {
    slot1: 'none',
    slot2: 'none',
  },
} satisfies CityConfiguration;

describe('city planner effects', () => {
  it('detects Aphrodite as the selected Pygmalion god', () => {
    expect(isAphroditeGodSelected('aphrodite')).toBe(true);
    expect(isAphroditeGodSelected('zeus')).toBe(false);
  });

  it('derives the Pygmalion modifier from the selected god', () => {
    expect(
      getEffectiveCityPlanForSelectedGod(cityPlan, 'aphrodite').modifiers.aphroditeActive,
    ).toBe(true);
    expect(getEffectiveCityPlanForSelectedGod(cityPlan, 'hera').modifiers.aphroditeActive).toBe(
      false,
    );
  });

  it('does not mutate the stored city plan modifiers', () => {
    const effectiveCityPlan = getEffectiveCityPlanForSelectedGod(cityPlan, 'aphrodite');

    expect(effectiveCityPlan).not.toBe(cityPlan);
    expect(effectiveCityPlan.modifiers).not.toBe(cityPlan.modifiers);
    expect(cityPlan.modifiers.aphroditeActive).toBe(false);
  });
});
