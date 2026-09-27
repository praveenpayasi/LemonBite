import { formatUsPhoneNumber, isValidUsPhoneNumber, sanitizePhoneNumber } from '@/utils/phone';

describe('sanitizePhoneNumber', () => {
  it('keeps only digits and caps at 10', () => {
    expect(sanitizePhoneNumber('(217) 555-0113')).toBe('2175550113');
    expect(sanitizePhoneNumber('abc217def')).toBe('217');
    expect(sanitizePhoneNumber('2175550113999')).toBe('2175550113');
  });
});

describe('formatUsPhoneNumber', () => {
  it('formats 10 digits as (XXX) XXX-XXXX', () => {
    expect(formatUsPhoneNumber('2175550113')).toBe('(217) 555-0113');
  });

  it('formats progressively as the user types', () => {
    expect(formatUsPhoneNumber('')).toBe('');
    expect(formatUsPhoneNumber('217')).toBe('(217');
    expect(formatUsPhoneNumber('217555')).toBe('(217) 555');
  });

  it('normalizes an already-formatted number', () => {
    expect(formatUsPhoneNumber('(217) 555-0113')).toBe('(217) 555-0113');
  });
});

describe('isValidUsPhoneNumber', () => {
  it('requires exactly 10 digits', () => {
    expect(isValidUsPhoneNumber('(217) 555-0113')).toBe(true);
    expect(isValidUsPhoneNumber('2175550113')).toBe(true);
  });

  it('rejects too few or empty', () => {
    expect(isValidUsPhoneNumber('217555011')).toBe(false);
    expect(isValidUsPhoneNumber('')).toBe(false);
  });
});
