import { ArgumentTypesKey, DependencyIdKey } from './symbols';

/**
 * Factory function with dependency injection metadata.
 */
export interface FactoryFunction<T> extends Function {
  [ArgumentTypesKey]?: DependencyKey<unknown>[];
  (...args: any[]): Promise<T>;
}

/**
 * Constructor function with dependency injection metadata.
 */
export interface InjectableConstructor<T> extends Function {
  [DependencyIdKey]?: symbol;
  [ArgumentTypesKey]?: DependencyKey<unknown>[];
  new (...args: any[]): T;
}

export type DependencyKey<T> = InjectableConstructor<T> | symbol;
