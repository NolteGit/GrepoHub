export const maxPopulationBudgetPerUnit = 5000;

export const troopUnitAmountMaxById: Record<string, number> = {
  swordsman: 5000,
  slinger: 5000,
  archer: 5000,
  hoplite: 5000,
  horseman: 1667,
  chariot: 1250,
  catapult: 334,
  divine_envoy: 1667,
  minotaur: 167,
  manticore: 112,
  cyclop: 125,
  hydra: 100,
  harpy: 358,
  medusa: 278,
  centaur: 417,
  pegasus: 250,
  cerberus: 167,
  erinys: 91,
  griffin: 143,
  calydonian_boar: 250,
  siren: 313,
  satyr: 313,
  ladon: 59,
  spartoi: 500,
  transport_boat: 715,
  bireme: 625,
  light_ship: 500,
  fire_ship: 625,
  fast_transport_ship: 1000,
  trireme: 313,
  colony_ship: 30,
};

export const allowedTroopUnitIds = new Set(Object.keys(troopUnitAmountMaxById));

export function getTroopUnitAmountMax(unitId: string): number {
  return troopUnitAmountMaxById[unitId] ?? 0;
}

export function getTroopUnitAmountMaxForPopulationCost(populationCost: number): number {
  const normalizedPopulationCost = Math.max(
    1,
    Math.floor(Number.isFinite(populationCost) ? populationCost : 1),
  );

  return Math.ceil(maxPopulationBudgetPerUnit / normalizedPopulationCost);
}

export function normalizeNonNegativeInteger(value: number): number {
  return Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
}

export function clampTroopUnitAmount(unitId: string, value: number): number {
  return Math.min(normalizeNonNegativeInteger(value), getTroopUnitAmountMax(unitId));
}
