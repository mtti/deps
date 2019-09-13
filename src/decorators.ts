/* eslint-disable no-param-reassign */

import { ArgumentTypesKey, IsConstructableKey } from './symbols';
import {
  CallableDependency,
  ClassDependency,
  DependencyKey,
  FactoryFunction,
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
 * Mark a function as a callable dependency.
 *
 * @param argTypes
 * @param target
 */
export function injectCallable<T>(
  argTypes: DependencyKey<any>[],
  target: CallableDependency<T>,
): CallableDependency<T> {
  target[ArgumentTypesKey] = [...argTypes];
  target[IsConstructableKey] = false;
  return target;
}

/**
 * "Decorate" a factory function with runtime type information needed to
 * resolve its dependencies during dependency injection.
 *
 * This modifies the original `factory`.
 *
 * Internally, this creates a symbol-keyed property on the target function which
 * contains an array of argument types.
 *
 * @param type
 * @param factory
 * @param argTypes
 */
export function injectFactory<T>(
  argTypes: DependencyKey<any>[],
  target: FactoryFunction<T>,
): FactoryFunction<T> {
  target[ArgumentTypesKey] = [...argTypes];
  return target;
}
