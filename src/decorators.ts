/* eslint-disable no-param-reassign */

import { ArgumentTypesKey, IsConstructableKey } from './symbols';
import {
  CallableDependency,
  ClassDependency,
  DependencyKey,
} from './types';

/**
 * "Decorate" a class with runtime type information needed to resolve its
 * dependencies during dependency injection.
 *
 * This modified the original `type`.
 *
 * Internally, this creates a symbol-keyed property on the target
 * type which contains the array of argument types.
 *
 * @param type The type to add argument type information to.
 * @param argTypes Types of the dependencies to be injected.
 */
export function injectClass<T>(
  argTypes: DependencyKey<any>[],
  target: ClassDependency<T>,
): ClassDependency<T> {
  target[ArgumentTypesKey] = [...argTypes];
  target[IsConstructableKey] = true;
  return target;
}

/**
 * Mark a function as a callable dependency. When the dependency is being
 * resolved, the callable dependency is called and should return a promise
 * resolving to the actual concrete instance.
 *
 * A secondary use is as factory functions that can provide a completely
 * different type when added to an injector with `injector.provide()`.
 *
 * This modifies the original `target`.
 *
 * @param argTypes
 * @param target
 */
export function injectFunction<T>(
  argTypes: DependencyKey<any>[],
  target: CallableDependency<T>,
): CallableDependency<T> {
  target[ArgumentTypesKey] = [...argTypes];
  target[IsConstructableKey] = false;
  return target;
}
