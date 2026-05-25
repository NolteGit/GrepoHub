export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}
