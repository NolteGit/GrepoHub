import {
  clampTroopUnitAmount,
  getTroopUnitAmountMax,
  getTroopUnitAmountMaxForPopulationCost,
} from './unit-rules';

describe('unit rules', () => {
  it('derives unit amount maxima from a 5000 population budget', () => {
    expect(getTroopUnitAmountMaxForPopulationCost(1)).toBe(5000);
    expect(getTroopUnitAmountMaxForPopulationCost(3)).toBe(1667);
    expect(getTroopUnitAmountMaxForPopulationCost(7)).toBe(715);
    expect(getTroopUnitAmountMaxForPopulationCost(170)).toBe(30);
  });

  it('looks up configured per-unit amount maxima', () => {
    expect(getTroopUnitAmountMax('swordsman')).toBe(5000);
    expect(getTroopUnitAmountMax('horseman')).toBe(1667);
    expect(getTroopUnitAmountMax('transport_boat')).toBe(715);
    expect(getTroopUnitAmountMax('colony_ship')).toBe(30);
    expect(getTroopUnitAmountMax('unknown_unit')).toBe(0);
  });

  it('clamps amounts with the shared per-unit rule table', () => {
    expect(clampTroopUnitAmount('swordsman', 99999)).toBe(5000);
    expect(clampTroopUnitAmount('horseman', 99999)).toBe(1667);
    expect(clampTroopUnitAmount('transport_boat', 99999)).toBe(715);
    expect(clampTroopUnitAmount('colony_ship', 99999)).toBe(30);
    expect(clampTroopUnitAmount('swordsman', -10)).toBe(0);
    expect(clampTroopUnitAmount('swordsman', Number.NaN)).toBe(0);
    expect(clampTroopUnitAmount('unknown_unit', 50)).toBe(0);
  });
});
