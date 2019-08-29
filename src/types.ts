import { DependencyIdKey } from './symbols';

export type ServiceDirectory = {
  [key: string]: unknown;
}

export interface DependencyType<T> extends Function {
  [DependencyIdKey]?: string;
  new (...args: any[]): T;
}
