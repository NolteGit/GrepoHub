import {
  AcademyResearchDefinition,
  AcademyResearchId,
  academyResearchDefinitions,
} from '../data/academy-research-presets';

interface AcademyResearchCalculationInput {
  readonly academyLevel: number;
  readonly selectedResearchIds: readonly AcademyResearchId[];
  readonly libraryBuilt: boolean;
}

export interface AcademyResearchCalculationResult {
  readonly academyLevel: number;
  readonly academyPoints: number;
  readonly libraryBonusPoints: number;
  readonly availablePoints: number;
  readonly selectedCost: number;
  readonly remainingPoints: number;
  readonly missingPoints: number;
  readonly missingAcademyLevels: number;
  readonly missingUnlockLevels: number;
  readonly requiredAcademyLevel: number;
  readonly highestUnlockLevel: number;
  readonly isCurrentAcademyLevelEnough: boolean;
  readonly isWithinMaximumPoints: boolean;
}

const MAX_ACADEMY_LEVEL = 36;
const POINTS_PER_ACADEMY_LEVEL = 4;
const LIBRARY_BONUS_POINTS = 12;

const researchById = new Map<AcademyResearchId, AcademyResearchDefinition>(
  academyResearchDefinitions.map((research) => [research.id, research]),
);

export function calculateAcademyResearchPlan(
  input: AcademyResearchCalculationInput,
): AcademyResearchCalculationResult {
  const academyLevel = clampInteger(input.academyLevel, 0, MAX_ACADEMY_LEVEL);
  const libraryBonusPoints = input.libraryBuilt ? LIBRARY_BONUS_POINTS : 0;
  const academyPoints = academyLevel * POINTS_PER_ACADEMY_LEVEL;
  const availablePoints = academyPoints + libraryBonusPoints;
  const selectedResearches = input.selectedResearchIds
    .map((id) => researchById.get(id))
    .filter((research): research is AcademyResearchDefinition => Boolean(research));
  const selectedCost = selectedResearches.reduce((sum, research) => sum + research.cost, 0);
  const highestUnlockLevel = selectedResearches.reduce(
    (level, research) => Math.max(level, research.requiredAcademyLevel),
    0,
  );
  const requiredPointLevel = Math.ceil(
    Math.max(selectedCost - libraryBonusPoints, 0) / POINTS_PER_ACADEMY_LEVEL,
  );
  const requiredAcademyLevel = Math.max(highestUnlockLevel, requiredPointLevel);
  const remainingPoints = availablePoints - selectedCost;
  const missingPoints = Math.max(Math.abs(Math.min(remainingPoints, 0)), 0);
  const maxAvailablePoints = MAX_ACADEMY_LEVEL * POINTS_PER_ACADEMY_LEVEL + libraryBonusPoints;
  const missingAcademyLevels = Math.max(requiredAcademyLevel - academyLevel, 0);
  const missingUnlockLevels = Math.max(highestUnlockLevel - academyLevel, 0);

  return {
    academyLevel,
    academyPoints,
    libraryBonusPoints,
    availablePoints,
    selectedCost,
    remainingPoints,
    missingPoints,
    missingAcademyLevels,
    missingUnlockLevels,
    requiredAcademyLevel,
    highestUnlockLevel,
    isCurrentAcademyLevelEnough: academyLevel >= requiredAcademyLevel && remainingPoints >= 0,
    isWithinMaximumPoints: selectedCost <= maxAvailablePoints,
  };
}

function clampInteger(value: number, min: number, max: number): number {
  const safeValue = Number.isFinite(value) ? Math.round(value) : min;

  return Math.min(Math.max(safeValue, min), max);
}
