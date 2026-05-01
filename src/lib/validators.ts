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
