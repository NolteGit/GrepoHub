export type Building = {
  id: string;
  name: string;
  isSpecial: boolean;
  maxLevel: number | null;
  wood: number | null;
  stone: number | null;
  silver: number | null;
  population: number | null;
  constructionTimeMinutes: number | null;
};