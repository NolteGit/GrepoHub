import { calculateAcademyResearchPlan } from './academy-research-calculator';

const calculate = (
  selectedResearchIds: Parameters<typeof calculateAcademyResearchPlan>[0]['selectedResearchIds'],
  academyLevel = 0,
  libraryBuilt = false,
) => calculateAcademyResearchPlan({ academyLevel, selectedResearchIds, libraryBuilt });

describe('calculateAcademyResearchPlan', () => {
  it('returns zero cost and zero required level without selected researches', () => {
    const result = calculate([]);

    expect(result.selectedCost).toBe(0);
    expect(result.requiredAcademyLevel).toBe(0);
    expect(result.remainingPoints).toBe(0);
    expect(result.isCurrentAcademyLevelEnough).toBe(true);
  });

  it('uses points and unlock gates to calculate the required academy level', () => {
    const result = calculate(['slinger', 'archer', 'mathematics'], 20);

    expect(result.selectedCost).toBe(18);
    expect(result.highestUnlockLevel).toBe(25);
    expect(result.requiredAcademyLevel).toBe(25);
    expect(result.isCurrentAcademyLevelEnough).toBe(false);
  });

  it('uses the library bonus when calculating the required point level', () => {
    const selectedResearchIds = ['slinger', 'archer', 'city_guard', 'hoplite'] as const;
    const withoutLibrary = calculate(selectedResearchIds);
    const withLibrary = calculate(selectedResearchIds, 0, true);

    expect(withoutLibrary.selectedCost).toBe(23);
    expect(withoutLibrary.requiredAcademyLevel).toBe(6);
    expect(withLibrary.requiredAcademyLevel).toBe(4);
    expect(withLibrary.availablePoints - withoutLibrary.availablePoints).toBe(12);
  });

  it('reports missing points when the current academy level is too low', () => {
    const result = calculate(['slinger', 'archer', 'hoplite'], 3);

    expect(result.availablePoints).toBe(12);
    expect(result.selectedCost).toBe(20);
    expect(result.missingPoints).toBe(8);
    expect(result.missingAcademyLevels).toBe(2);
    expect(result.missingUnlockLevels).toBe(1);
    expect(result.isCurrentAcademyLevelEnough).toBe(false);
  });

  it('reports missing academy levels for high-level selected researches', () => {
    const result = calculate(['slinger', 'mathematics'], 10);

    expect(result.highestUnlockLevel).toBe(25);
    expect(result.requiredAcademyLevel).toBe(25);
    expect(result.missingAcademyLevels).toBe(15);
    expect(result.missingUnlockLevels).toBe(15);
    expect(result.missingPoints).toBe(0);
  });
});
