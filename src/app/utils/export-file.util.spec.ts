import { escapeDelimitedValue, sanitizeDownloadFileName } from './export-file.util';

describe('export file utilities', () => {
  it('sanitizes download file names with a stable fallback', () => {
    expect(sanitizeDownloadFileName(' Logic Plan / Alpha ')).toBe('logic-plan-alpha');
    expect(sanitizeDownloadFileName('???')).toBe('grepo-plan');
    expect(sanitizeDownloadFileName('???', 'fallback')).toBe('fallback');
  });

  it('escapes delimiter values and neutralizes spreadsheet formulas', () => {
    expect(escapeDelimitedValue('simple', ';')).toBe('simple');
    expect(escapeDelimitedValue('a;b', ';')).toBe('"a;b"');
    expect(escapeDelimitedValue('a"b', ';')).toBe('"a""b"');
    expect(escapeDelimitedValue('=SUM(1,1)', ';')).toBe("'=SUM(1,1)");
    expect(escapeDelimitedValue(' +cmd', ';')).toBe("' +cmd");
    expect(escapeDelimitedValue('@hidden', ',')).toBe("'@hidden");
  });
});
