/**
 * Validates that a string is a well-formed email address.
 *
 * @param email - The string to validate.
 * @returns 'true' when the string matches a basic email pattern, 'false' otherwise.
 */
export function isValidEmail(email?: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates that a string is a well-formed phone number.
 *
 * @param phone - The string to validate.
 * @returns 'true' if the string is empty or matches a phone pattern, 'false' otherwise.
 */
export function isValidPhone(phone?: string): boolean {
  if (!phone) return true; // Optional field
  return /^[\+]?[0-9\s\-\(\)]{7,15}$/.test(phone);
}

/**
 * Validates that a string is exactly an 11-digit numeric RUC.
 *
 * @param ruc - The string to validate.
 * @returns 'true' when the string is 11 digits, 'false' otherwise.
 */
export function isValidRUC(ruc?: string): boolean {
  if (!ruc) return false;
  return /^[0-9]{11}$/.test(ruc);
}
