import { ClassDependency, DependencyKey } from './types';
import { DependencyIdKey, IsConstructableKey } from './symbols';

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

/**
 * Get a dependency key symbol when given either a symbol or an injectable
 * type.
 *
 * @param source Dependency key source to resolve
 */
export function resolveDependencyKey(source: DependencyKey<unknown>): symbol {
  if (typeof source === 'symbol') {
    return source;
  }

  const existingKey = source[DependencyIdKey];
  if (existingKey) {
    return existingKey;
  }

  const newKey = Symbol(source.name);
  // eslint-disable-next-line no-param-reassign
  source[DependencyIdKey] = newKey;
  return newKey;
}

/**
 * Check if a dependency key is marked as constructable.
 *
 * @param target
 */
export function isConstructable<T>(
  target: DependencyKey<T>,
): target is ClassDependency<T> {
  if (typeof target === 'symbol') {
    return false;
  }
  return target[IsConstructableKey] === true;
}

/**
 * Get indexes of all falsy entries in an array.
 * @param target
 */
export function getFalsyEntries(target: any[]): number[] {
  return Array.from(target.entries())
    .filter(([, value]) => !value)
    .map(([index]) => index);
}
