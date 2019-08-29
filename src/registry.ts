import { DependencyIdKey } from './symbols';
import { DependencyType, ServiceDirectory } from './types';

/**
 * Stores instances indexed by their type in a run-time type-safe fashion.
 */
export class Registry {
  private static _nextId = 0;

  /**
   * Get the internal global dependency ID of a type, or assign it a new one
   * if does not already have one.
   * @param type
   */
  private static getId<T>(type: DependencyType<T>): string {
    const existingKey = type[DependencyIdKey];
    let result: string;

    if (existingKey) {
      result = existingKey;
    } else {
      result = (Registry._nextId++).toString();
      type[DependencyIdKey] = result;
    }

    return result;
  }

  private _services: ServiceDirectory = {};

  /**
   * Index a concrete object by its type.
   * @param type The object's constructor/class
   * @param instance A concrete instance of `type`.
   */
  bind<T>(type: DependencyType<T>, instance: T): void {
    const key = Registry.getId(type);

    if (!(instance instanceof type)) {
      throw new Error(`Implementation is not an instance of ${type.name}`);
    }

    if (this._services[key]) {
      throw new Error(`Already bound: ${type.name}`);
    }

    this._services[key] = instance;
  }

  /**
   * Retrieve a previously bound instance by its type.
   * @param type The object's type
   */
  get<T>(type: DependencyType<T>): T {
    const key = type[DependencyIdKey];
    if (!key) {
      throw new Error(`Not registered: ${type.name}`);
    }

    if (!this._services[key]) {
      throw new Error(`Not found: ${type.name}`);
    }

    const instance = this._services[key];
    if (!(instance instanceof type)) {
      throw new Error(`Registered instance is not of type ${type.name}`);
    }

    return instance as T;
  }
}
