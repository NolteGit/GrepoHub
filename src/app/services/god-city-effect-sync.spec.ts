import type { CityConfiguration } from '../models/city-configuration.model';
import type { GrepolisGodId } from '../models/god.model';
import type { PlanConfig, PlanConfigSettings } from '../models/plan-config.model';

import { getEffectiveCityPlanForSelectedGod } from './city-planner-effects';
import { normalizePlanConfig } from './plan-config-normalization';

const createSettings = (selectedGod: GrepolisGodId): PlanConfigSettings => ({
  selectedGod,
  worldSpeed: null,
  unitSpeed: null,
  timezone: null,
  locale: null,
});

const createCityPlan = (aphroditeActive: boolean): CityConfiguration => ({
  id: 'god-sync-city',
  name: 'God Sync City',
  note: '',
  buildingLevels: {
    senate: 9,
    timber_camp: 1,
    quarry: 1,
    silver_mine: 1,
    warehouse: 1,
    farm: 10,
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
    aphroditeActive,
  },
  specialBuildings: {
    slot1: 'none',
    slot2: 'none',
  },
});

const createPlanInput = (
  selectedGod: GrepolisGodId,
  aphroditeActive: boolean,
): Partial<PlanConfig> => ({
  name: 'Imported God Sync Plan',
  settings: createSettings(selectedGod),
  cityPlan: createCityPlan(aphroditeActive),
});

describe('god and city effect synchronization', () => {
  it('treats Aphrodite as the source of truth for Pygmalion being active', () => {
    const cityPlan = createCityPlan(false);

    const effectiveCityPlan = getEffectiveCityPlanForSelectedGod(cityPlan, 'aphrodite');

    expect(effectiveCityPlan.modifiers.aphroditeActive).toBe(true);
    expect(cityPlan.modifiers.aphroditeActive).toBe(false);
  });

  it('turns Pygmalion off when a non-Aphrodite god is selected', () => {
    const cityPlan = createCityPlan(true);

    const effectiveCityPlan = getEffectiveCityPlanForSelectedGod(cityPlan, 'hera');

    expect(effectiveCityPlan.modifiers.aphroditeActive).toBe(false);
    expect(cityPlan.modifiers.aphroditeActive).toBe(true);
  });

  it('keeps imported Aphrodite plans visually active even when stored city modifiers are stale', () => {
    const normalizedPlan = normalizePlanConfig(createPlanInput('aphrodite', false));

    const effectiveCityPlan = getEffectiveCityPlanForSelectedGod(
      normalizedPlan.cityPlan,
      normalizedPlan.settings.selectedGod,
    );

    expect(normalizedPlan.settings.selectedGod).toBe('aphrodite');
    expect(normalizedPlan.cityPlan.modifiers.aphroditeActive).toBe(false);
    expect(effectiveCityPlan.modifiers.aphroditeActive).toBe(true);
  });

  it('keeps imported non-Aphrodite plans visually inactive even when stored city modifiers are stale', () => {
    const normalizedPlan = normalizePlanConfig(createPlanInput('hera', true));

    const effectiveCityPlan = getEffectiveCityPlanForSelectedGod(
      normalizedPlan.cityPlan,
      normalizedPlan.settings.selectedGod,
    );

    expect(normalizedPlan.settings.selectedGod).toBe('hera');
    expect(normalizedPlan.cityPlan.modifiers.aphroditeActive).toBe(true);
    expect(effectiveCityPlan.modifiers.aphroditeActive).toBe(false);
  });

  it('falls back invalid imported god values to Aphrodite and derives Pygmalion from that fallback', () => {
    const normalizedPlan = normalizePlanConfig({
      ...createPlanInput('aphrodite', false),
      name: 'Imported Invalid God Plan',
      settings: {
        ...createSettings('aphrodite'),
        selectedGod: 'unknown-god' as GrepolisGodId,
      },
    });

    const effectiveCityPlan = getEffectiveCityPlanForSelectedGod(
      normalizedPlan.cityPlan,
      normalizedPlan.settings.selectedGod,
    );

    expect(normalizedPlan.settings.selectedGod).toBe('aphrodite');
    expect(effectiveCityPlan.modifiers.aphroditeActive).toBe(true);
  });
});
