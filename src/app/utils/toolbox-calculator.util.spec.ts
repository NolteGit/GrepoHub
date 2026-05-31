import { describe, expect, it } from 'vitest';

import { evaluateCalculatorExpression, formatNumber } from './toolbox-calculator.util';

describe('toolbox calculator utils', () => {
  it('formats calculator numbers compactly', () => {
    expect(formatNumber(12)).toBe('12');
    expect(formatNumber(12.34)).toBe('12.34');
    expect(formatNumber(12.34001)).toBe('12.34');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('0');
  });

  it('evaluates basic arithmetic with precedence and parentheses', () => {
    expect(evaluateCalculatorExpression('2 + 3 × 4')).toBe(14);
    expect(evaluateCalculatorExpression('(2 + 3) × 4')).toBe(20);
    expect(evaluateCalculatorExpression('-2 × (3 + 4)')).toBe(-14);
    expect(evaluateCalculatorExpression('7.5 ÷ 2.5')).toBe(3);
  });

  it('rejects invalid calculator expressions', () => {
    expect(evaluateCalculatorExpression('2 +')).toBeNull();
    expect(evaluateCalculatorExpression('(2 + 3')).toBeNull();
    expect(evaluateCalculatorExpression('2 ÷ 0')).toBeNull();
    expect(evaluateCalculatorExpression('2 ÷ (3 - 3)')).toBeNull();
  });
});
