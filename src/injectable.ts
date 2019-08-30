import { ArgumentTypesKey } from './symbols';
import { FactoryFunction, InjectableConstructor } from './types';

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
export function injectableClass<T>(
  type: InjectableConstructor<T>,
  argTypes: InjectableConstructor<any>[],
): InjectableConstructor<T> {
  type[ArgumentTypesKey] = [...argTypes];
  return type;
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
export function injectableFactory<T>(
  factory: FactoryFunction<T>,
  argTypes: InjectableConstructor<any>[],
): FactoryFunction<T> {
  factory[ArgumentTypesKey] = [...argTypes];
  return factory;
}
