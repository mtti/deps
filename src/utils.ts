import { DependencyIdKey } from './symbols';
import { DependencyKey } from './types';

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

export function resolveDependencyKey(source: DependencyKey<unknown>): symbol {
  if (typeof source === 'symbol') {
    return source;
  }

  const existingKey = source[DependencyIdKey];
  if (existingKey) {
    return existingKey;
  }

  const newKey = Symbol(`${source.name} dependency key`);
  // eslint-disable-next-line no-param-reassign
  source[DependencyIdKey] = newKey;
  return newKey;
}
