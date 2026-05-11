import {
  cityBuildingPlanDefinitions,
  cityConfigurationPresets,
  citySpecialBuildingSlotDefinitions,
} from '../data/city-planner-presets';
import { troopConfigurationPresets } from '../data/troops-planner-presets';
import {
  CityConfiguration,
  CitySpecialBuildingOptionId,
  CitySpecialBuildingSlotId,
} from '../models/city-configuration.model';
import { PlanConfig, PlanConfigSettings } from '../models/plan-config.model';
import { TroopConfiguration } from '../models/troop-configuration.model';

const maxTroopUnitAmount = 10000;
const allowedTroopUnitIds = new Set([
  'swordsman',
  'slinger',
  'archer',
  'hoplite',
  'horseman',
  'chariot',
  'catapult',
  'divine_envoy',
  'minotaur',
  'manticore',
  'cyclop',
  'hydra',
  'harpy',
  'medusa',
  'centaur',
  'pegasus',
  'cerberus',
  'erinys',
  'griffin',
  'calydonian_boar',
  'siren',
  'satyr',
  'ladon',
  'spartoi',
  'transport_boat',
  'bireme',
  'light_ship',
  'fire_ship',
  'fast_transport_ship',
  'trireme',
  'colony_ship',
]);
const minimumBuildingLevels: Record<string, number> = {
  barracks: 1,
  farm: 1,
  marketplace: 1,
  quarry: 1,
  senate: 9,
  silver_mine: 1,
  temple: 1,
  timber_camp: 1,
  warehouse: 1,
};

export function normalizePlanConfig(rawPlan: Partial<PlanConfig>): PlanConfig {
  const rawCityPlan = isPlainRecord(rawPlan.cityPlan)
    ? rawPlan.cityPlan
    : cityConfigurationPresets[0];
  const rawTroopPlan = isPlainRecord(rawPlan.troopPlan)
    ? rawPlan.troopPlan
    : troopConfigurationPresets[0];

  return {
    id: normalizeOptionalString(rawPlan.id) ?? `custom-plan-${Date.now()}`,
    name: normalizeDisplayPlanName(rawPlan.name, 'Configuration'),
    isPreset: Boolean(rawPlan.isPreset),
    createdAt: normalizeOptionalString(rawPlan.createdAt),
    updatedAt: normalizeOptionalString(rawPlan.updatedAt),
    settings: normalizeSettings(rawPlan.settings),
    cityPlan: normalizeCityConfiguration(rawCityPlan),
    troopPlan: normalizeTroopConfiguration(rawTroopPlan),
  };
}

function normalizeSettings(rawSettings: unknown): PlanConfigSettings {
  const settings = isPlainRecord(rawSettings) ? rawSettings : {};
  const parsedWorldSpeed = Number(settings['worldSpeed']);
  const parsedUnitSpeed = Number(settings['unitSpeed']);

  return {
    worldSpeed: Number.isFinite(parsedWorldSpeed) && parsedWorldSpeed > 0 ? parsedWorldSpeed : null,
    unitSpeed: Number.isFinite(parsedUnitSpeed) && parsedUnitSpeed > 0 ? parsedUnitSpeed : null,
    timezone: normalizeOptionalString(settings['timezone']),
    locale: normalizeOptionalString(settings['locale']),
  };
}

export function createDefaultSettings(): PlanConfigSettings {
  return {
    worldSpeed: null,
    unitSpeed: null,
    timezone: null,
    locale: null,
  };
}

export function normalizeCityConfiguration(
  rawConfiguration: Partial<CityConfiguration>,
): CityConfiguration {
  const rawBuildingLevels = isPlainRecord(rawConfiguration.buildingLevels)
    ? rawConfiguration.buildingLevels
    : {};
  const rawModifiers: Record<string, unknown> = isPlainRecord(rawConfiguration.modifiers)
    ? rawConfiguration.modifiers
    : {};
  const rawSpecialBuildings: Record<string, unknown> = isPlainRecord(
    rawConfiguration.specialBuildings,
  )
    ? rawConfiguration.specialBuildings
    : {};
  const migratedSlot1 =
    rawSpecialBuildings['slot1'] ?? (rawModifiers['thermalBathsBuilt'] ? 'thermal_baths' : 'none');
  const migratedSlot2 = rawSpecialBuildings['slot2'] ?? 'none';

  return {
    id: normalizeOptionalString(rawConfiguration.id) ?? `custom-city-${Date.now()}`,
    name: normalizeImportName(rawConfiguration.name, 'City Plan'),
    isPreset: Boolean(rawConfiguration.isPreset),
    buildingLevels: cityBuildingPlanDefinitions.reduce(
      (accumulator, building) => {
        const rawLevel = Number(rawBuildingLevels[building.id] ?? 0);
        const normalizedLevel = Number.isFinite(rawLevel) ? rawLevel : 0;

        accumulator[building.id] = Math.min(
          Math.max(Math.round(normalizedLevel), 0),
          building.maxLevel,
        );

        return accumulator;
      },
      {} as Record<string, number>,
    ),
    modifiers: {
      plowResearched: Boolean(rawModifiers['plowResearched']),
      aphroditeActive: Boolean(rawModifiers['aphroditeActive']),
    },
    specialBuildings: {
      slot1:
        typeof migratedSlot1 === 'string' && isAllowedSpecialBuildingOption('slot1', migratedSlot1)
          ? migratedSlot1
          : 'none',
      slot2:
        typeof migratedSlot2 === 'string' && isAllowedSpecialBuildingOption('slot2', migratedSlot2)
          ? migratedSlot2
          : 'none',
    },
  };
}

export function normalizeTroopConfiguration(
  rawConfiguration: Partial<TroopConfiguration>,
): TroopConfiguration {
  const rawUnitAmounts = isPlainRecord(rawConfiguration.unitAmounts)
    ? rawConfiguration.unitAmounts
    : {};
  const rawModifiers: Record<string, unknown> = isPlainRecord(rawConfiguration.modifiers)
    ? rawConfiguration.modifiers
    : {};

  return {
    id: normalizeOptionalString(rawConfiguration.id) ?? `custom-troops-${Date.now()}`,
    name: normalizeImportName(rawConfiguration.name, 'Troop Plan'),
    isPreset: Boolean(rawConfiguration.isPreset),
    unitAmounts: Object.entries(rawUnitAmounts).reduce(
      (amounts, [unitId, rawAmount]) => {
        if (!allowedTroopUnitIds.has(unitId)) {
          return amounts;
        }

        const parsedAmount = Number(rawAmount);

        amounts[unitId] = Number.isFinite(parsedAmount)
          ? Math.min(Math.max(Math.round(parsedAmount), 0), maxTroopUnitAmount)
          : 0;

        return amounts;
      },
      {} as Record<string, number>,
    ),
    modifiers: {
      bunks: Boolean(rawModifiers['bunks']),
    },
  };
}

export function createMinimumBuildingLevels(): Record<string, number> {
  return cityBuildingPlanDefinitions.reduce(
    (levels, building) => {
      levels[building.id] = Math.min(minimumBuildingLevels[building.id] ?? 0, building.maxLevel);

      return levels;
    },
    {} as Record<string, number>,
  );
}

export function createEmptyUnitAmounts(
  unitAmounts: Record<string, number>,
): Record<string, number> {
  const unitIds = new Set<string>(
    troopConfigurationPresets.flatMap((configuration) => Object.keys(configuration.unitAmounts)),
  );

  for (const unitId of Object.keys(unitAmounts)) {
    unitIds.add(unitId);
  }

  return Array.from(unitIds).reduce(
    (amounts, unitId) => {
      amounts[unitId] = 0;

      return amounts;
    },
    {} as Record<string, number>,
  );
}

export function clonePlan(plan: PlanConfig): PlanConfig {
  return {
    ...plan,
    settings: { ...plan.settings },
    cityPlan: cloneCityPlan(plan.cityPlan),
    troopPlan: cloneTroopPlan(plan.troopPlan),
  };
}

export function cloneCityPlan(configuration: CityConfiguration): CityConfiguration {
  return {
    ...configuration,
    buildingLevels: { ...configuration.buildingLevels },
    modifiers: { ...configuration.modifiers },
    specialBuildings: { ...configuration.specialBuildings },
  };
}

export function cloneTroopPlan(configuration: TroopConfiguration): TroopConfiguration {
  return {
    ...configuration,
    unitAmounts: { ...configuration.unitAmounts },
    modifiers: { ...configuration.modifiers },
  };
}

export function createUniqueNameFromNames(
  requestedName: string,
  duplicateSuffix: 'Copy' | 'Import',
  existingNames: readonly string[],
): string {
  const baseName = normalizeDisplayPlanName(requestedName, 'Configuration');
  const usedNames = new Set(existingNames.map((name) => normalizeNameKey(name)));

  if (!usedNames.has(normalizeNameKey(baseName))) {
    return baseName;
  }

  const suffixPattern = new RegExp(`\\s+${duplicateSuffix}(?:\\s+\\d+)?$`, 'i');
  const candidateBase = suffixPattern.test(baseName)
    ? baseName.replace(/\s+\d+$/, '').trim()
    : `${baseName} ${duplicateSuffix}`;

  if (!usedNames.has(normalizeNameKey(candidateBase))) {
    return candidateBase;
  }

  let counter = 2;
  let candidate = `${candidateBase} ${counter}`;

  while (usedNames.has(normalizeNameKey(candidate))) {
    counter += 1;
    candidate = `${candidateBase} ${counter}`;
  }

  return candidate;
}

export function normalizeNameKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function normalizeDisplayPlanName(value: unknown, fallback: string): string {
  const name = normalizeImportName(value, fallback)
    .replace(/\s+Plan$/i, '')
    .trim();

  return name.length > 0 ? name : fallback;
}

export function normalizeImportName(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

export function createImportedPlanId(prefix: string, name: string, suffix: string): string {
  const slug = name
    .trim()
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return prefix + '-' + (slug || 'plan') + '-' + suffix;
}

function normalizeOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAllowedSpecialBuildingOption(
  slotId: CitySpecialBuildingSlotId,
  optionId: string,
): optionId is CitySpecialBuildingOptionId {
  const slotDefinition = citySpecialBuildingSlotDefinitions.find((slot) => slot.id === slotId);

  return Boolean(slotDefinition?.optionIds.some((allowedOptionId) => allowedOptionId === optionId));
}
