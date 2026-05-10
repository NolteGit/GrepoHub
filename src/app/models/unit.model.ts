export type AttackType = 'naval' | 'blunt' | 'sharp' | 'distance';

type UnitType = 'land' | 'sea';

type God =
  | 'zeus'
  | 'poseidon'
  | 'hera'
  | 'athena'
  | 'hades'
  | 'artemis'
  | 'aphrodite'
  | 'ares'
  | 'all';

type UnitCost = {
  wood: number;
  stone: number;
  silver: number;
  favor: number;
  population: number;
};

export type Unit = {
  id: string;
  nameKey: string;
  type: UnitType;
  isMythical: boolean;
  god: God | null;
  cost: UnitCost;
  transportCapacity: number;
  transportSpace: number;
  attack: number;
  attackType: AttackType;
  defenseBlunt: number;
  defenseSharp: number;
  defenseDistance: number;
  attackSea: number;
  defenseSea: number;
};
