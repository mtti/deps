import { ArgumentTypesKey } from './symbols';
import { InjectableConstructor } from './types';

/**
 * Annotate a class with the types which should be injected to its constructor.
 * Internally, this creates a symbol-keyed property on the target type which
 * contains the array of argument types.
 *
 * @param type The type to add argument type information to.
 * @param argTypes Types of the dependencies to be injected.
 */
export function injectable<T>(
  type: InjectableConstructor<T>,
  argTypes: InjectableConstructor<any>[]
): InjectableConstructor<T> {
  type[ArgumentTypesKey] = [...argTypes];
  return type;
}
