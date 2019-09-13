import { ArgumentTypesKey, DependencyIdKey, IsConstructableKey } from './symbols';

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
export interface ClassDependency<T> extends Function {
  [DependencyIdKey]?: symbol;
  [ArgumentTypesKey]?: DependencyKey<unknown>[];
  [IsConstructableKey]?: boolean;
  new (...args: any[]): T;
}

export interface CallableDependency<T> extends Function {
  [DependencyIdKey]?: symbol;
  [ArgumentTypesKey]?: DependencyKey<unknown>[];
  [IsConstructableKey]?: boolean;
  (...args: any[]): Promise<T>;
}

export type DependencyKey<T>
  = ClassDependency<T> | CallableDependency<T> | symbol;
