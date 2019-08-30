import { ArgumentTypesKey, DependencyIdKey } from './symbols';

/**
 * Factory function with dependency injection metadata.
 */
export interface FactoryFunction<T> extends Function {
  [ArgumentTypesKey]?: InjectableConstructor<any>[];
  (...args: any[]): T;
}

/**
 * Constructor function with dependency injection metadata.
 */
export interface InjectableConstructor<T> extends Function {
  [DependencyIdKey]?: string;
  [ArgumentTypesKey]?: InjectableConstructor<any>[];
  new (...args: any[]): T;
}

/**
 * Indexes service instances by string ID.
 */
export type ServiceDirectory = {
  [key: string]: unknown;
}

/**
 * Indexes factory functions by string ID.
 */
export type FactoryDirectory = {
  [key: string]: FactoryFunction<any>;
};
