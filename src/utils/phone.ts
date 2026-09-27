/**
 * Pure US phone-number helpers. No masking dependency.
 */

/** Strips non-digits and caps to 10 digits (NANP subscriber number). */
export function sanitizePhoneNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

/** Progressively formats digits as `(XXX) XXX-XXXX`. */
export function formatUsPhoneNumber(value: string): string {
  const digits = sanitizePhoneNumber(value);

  if (digits.length === 0) {
    return '';
  }
  if (digits.length < 4) {
    return `(${digits}`;
  }
  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** A US phone number is valid when it has exactly 10 digits. */
export function isValidUsPhoneNumber(value: string): boolean {
  return sanitizePhoneNumber(value).length === 10;
}
