import {
  getPygmalionModifierState,
  isPygmalionGodSelected,
  pygmalionCityModifierId,
  pygmalionGodId,
} from './god-effect-rules';

describe('god effect rules', () => {
  it('uses Aphrodite as the source god for Pygmalion', () => {
    expect(pygmalionGodId).toBe('aphrodite');
    expect(pygmalionCityModifierId).toBe('aphroditeActive');
  });

  it('detects whether Pygmalion should be active from the selected god', () => {
    expect(isPygmalionGodSelected('aphrodite')).toBe(true);
    expect(isPygmalionGodSelected('hera')).toBe(false);
    expect(isPygmalionGodSelected('unknown-god')).toBe(false);
  });

  it('derives the Pygmalion city modifier state from the selected god', () => {
    expect(getPygmalionModifierState('aphrodite')).toBe(true);
    expect(getPygmalionModifierState('zeus')).toBe(false);
  });
});
