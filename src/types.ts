import { ArgumentTypesKey, DependencyIdKey, IsConstructableKey } from './symbols';

/**
 * Constructor function with dependency injection metadata.
 */
export interface ClassDependency<T> extends Function {
  [DependencyIdKey]?: symbol;
  [ArgumentTypesKey]?: DependencyKey<unknown>[];
  [IsConstructableKey]?: boolean;
  new (...args: any[]): T;
}

/**
 * A function with dependency injector metadata.
 */
export interface CallableDependency<T> extends Function {
  [DependencyIdKey]?: symbol;
  [ArgumentTypesKey]?: DependencyKey<unknown>[];
  [IsConstructableKey]?: boolean;
  (...args: any[]): Promise<T>;
}

export type DependencyKey<T>
  = ClassDependency<T> | CallableDependency<T> | symbol;
