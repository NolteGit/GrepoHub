export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

export function evaluateCalculatorExpression(expression: string): number | null {
  const tokens = tokenizeCalculatorExpression(expression);
  let index = 0;

  const parseExpression = (): number | null => {
    let value = parseTerm();

    while (value !== null && (tokens[index] === '+' || tokens[index] === '−')) {
      const operator = tokens[index];
      index += 1;
      const right = parseTerm();

      if (right === null) {
        return null;
      }

      value = operator === '+' ? value + right : value - right;
    }

    return value;
  };

  const parseTerm = (): number | null => {
    let value = parseFactor();

    while (value !== null && (tokens[index] === '×' || tokens[index] === '÷')) {
      const operator = tokens[index];
      index += 1;
      const right = parseFactor();

      if (right === null || (operator === '÷' && right === 0)) {
        return null;
      }

      value = operator === '×' ? value * right : value / right;
    }

    return value;
  };

  const parseFactor = (): number | null => {
    const token = tokens[index];

    if (!token) {
      return null;
    }

    if (token === '(') {
      index += 1;
      const value = parseExpression();

      if (tokens[index] !== ')') {
        return null;
      }

      index += 1;
      return value;
    }

    const value = Number(token);

    if (!Number.isFinite(value)) {
      return null;
    }

    index += 1;
    return value;
  };

  const result = parseExpression();

  return result !== null && Number.isFinite(result) && index === tokens.length ? result : null;
}

function tokenizeCalculatorExpression(expression: string): readonly string[] {
  const tokens: string[] = [];
  const compactExpression = expression.replace(/\s+/g, '').replace(/-/g, '−');
  let index = 0;

  while (index < compactExpression.length) {
    const character = compactExpression[index];
    const previousToken = tokens[tokens.length - 1];
    const isUnaryMinus =
      character === '−' &&
      (!previousToken || previousToken === '(' || isCalculatorOperator(previousToken));

    if (/[0-9.]/.test(character) || isUnaryMinus) {
      let numberText = isUnaryMinus ? '-' : '';
      index += isUnaryMinus ? 1 : 0;

      while (index < compactExpression.length && /[0-9.]/.test(compactExpression[index])) {
        numberText += compactExpression[index];
        index += 1;
      }

      tokens.push(numberText);
      continue;
    }

    if (isCalculatorOperator(character) || character === '(' || character === ')') {
      tokens.push(character);
    }

    index += 1;
  }

  return tokens;
}

function isCalculatorOperator(value: string): boolean {
  return value === '+' || value === '−' || value === '×' || value === '÷';
}
