/**
 * Throws an error if `value === null`, returns `value` otherwise. Useful
 * cleaner looking runtime null checks.
 *
 * @param value The value to test.
 * @returns `value` if it was non-null.
 * @throws An `Error` if `value === null`.
 */
export function assertNotNull<T>(value: T|null): T {
  if (value === null) {
    throw new Error('value is null');
  }
  return value;
}
