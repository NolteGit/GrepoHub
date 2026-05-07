export type AttackType = 'naval' | 'blunt' | 'sharp' | 'distance';

export type God =
  | 'Zeus'
  | 'Poseidon'
  | 'Hera'
  | 'Athena'
  | 'Hades'
  | 'Artemis'
  | 'Aphrodite'
  | 'Ares'
  | 'All';

export type Unit = {
  id: string;
  name: string;
  isMythical: boolean;
  god: God | null;
  wood: number;
  stone: number;
  silver: number;
  favor: number;
  population: number;
  attackType: AttackType;
  attack: number | null;
  defenseNaval: number;
  defenseBlunt: number;
  defenseSharp: number;
  defenseDistance: number;
  lootCapacity: number;
  transportCapacity: number;
  speed: number;
  recruitmentTimeMinutes: number | null;
};