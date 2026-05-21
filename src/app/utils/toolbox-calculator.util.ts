import type { CalculatorOperator, ToolDraft } from '../models/toolbox.models';

export const CALCULATOR_KEYBOARD_OPERATORS: Record<string, CalculatorOperator> = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  x: 'multiply',
  '/': 'divide',
  '÷': 'divide',
};

const OPERATOR_SYMBOLS: Record<CalculatorOperator, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
};

export function parseNumber(value: string): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function nextCalculatorDisplay(draft: ToolDraft, value: string): string {
  if (draft.calculatorWaitingForNext) {
    return value === '.' ? '0.' : value;
  }

  if (draft.calculatorDisplay === '0' && value !== '.') {
    return value;
  }

  return `${draft.calculatorDisplay}${value}`;
}

export function runCalculatorOperation(
  operator: CalculatorOperator,
  left: number,
  right: number,
): number {
  if (operator === 'subtract') {
    return left - right;
  }

  if (operator === 'multiply') {
    return left * right;
  }

  if (operator === 'divide') {
    return right === 0 ? 0 : left / right;
  }

  return left + right;
}

export function operatorSymbol(operator: CalculatorOperator): string {
  return OPERATOR_SYMBOLS[operator];
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}
