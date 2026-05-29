const grepolisGodIds = [
  'aphrodite',
  'ares',
  'artemis',
  'athena',
  'hades',
  'hera',
  'poseidon',
  'zeus',
] as const;

export type GrepolisGodId = (typeof grepolisGodIds)[number];

export const defaultGrepolisGodId: GrepolisGodId = 'aphrodite';
export const fallbackGrepolisGodId: GrepolisGodId = 'zeus';

function isGrepolisGodId(value: unknown): value is GrepolisGodId {
  return typeof value === 'string' && grepolisGodIds.some((godId) => godId === value);
}

export function normalizeGrepolisGodId(value: unknown): GrepolisGodId {
  return isGrepolisGodId(value) ? value : defaultGrepolisGodId;
}
