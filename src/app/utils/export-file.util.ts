export function sanitizeDownloadFileName(value: string, fallback = 'grepo-plan'): string {
  const sanitizedValue = value
    .trim()
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return sanitizedValue || fallback;
}

export function downloadTextFile(fileName: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function escapeDelimitedValue(value: string | number, delimiter: string): string {
  const safeValue = neutralizeSpreadsheetFormula(String(value));

  if (!hasDelimitedSpecialCharacter(safeValue, delimiter)) {
    return safeValue;
  }

  return '"' + safeValue.replaceAll('"', '""') + '"';
}

function neutralizeSpreadsheetFormula(value: string): string {
  return /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : value;
}

function hasDelimitedSpecialCharacter(value: string, delimiter: string): boolean {
  return (
    value.includes(delimiter) || value.includes('"') || value.includes('\r') || value.includes('\n')
  );
}
