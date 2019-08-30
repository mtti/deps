import { ArgumentTypesKey, DependencyIdKey } from './symbols';

export interface InjectableConstructor<T> extends Function {
  [DependencyIdKey]?: string;
  [ArgumentTypesKey]?: InjectableConstructor<any>[];
  new (...args: any[]): T;
}

export type ServiceDirectory = {
  [key: string]: unknown;
}
