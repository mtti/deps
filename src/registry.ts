import { ArgumentTypesKey, DependencyIdKey } from './symbols';
import { InjectableConstructor, ServiceDirectory } from './types';

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
  private static getId<T>(type: InjectableConstructor<T>): string {
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
  bind<T>(type: InjectableConstructor<T>, instance: T): void {
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
  get<T>(type: InjectableConstructor<T>): T {
    const key = type[DependencyIdKey];
    if (!key) {
      throw new Error(`Not registered: ${type.name}`);
    }

    let instance: unknown;

    if (this._services[key]) {
      instance = this._services[key];
    } else {
      instance = this.resolve(type);
      this.bind(type, instance);
    }

    if (!(instance instanceof type)) {
      throw new Error(`Registered instance is not a ${type.name}`);
    }

    return instance as T;
  }

  /**
   * Create an instance of a class while injecting dependencies to its
   * constructor based on argument type information added witn `injectable()`.
   * @param type A class constructor.
   * @param extraArgs Extra arguments to pass to the constructor after the
   *   injected dependencies.
   */
  resolve<T>(type: InjectableConstructor<T>, ...extraArgs: any[]): T {
    const argTypes = type[ArgumentTypesKey];

    if (!argTypes) {
      return new type(...extraArgs);
    }

    const args: any[] = argTypes
      .map(argType => this.get(argType));
    args.push(...extraArgs);

    return new type(...args);
  }
}
