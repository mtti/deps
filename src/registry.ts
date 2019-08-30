import { ArgumentTypesKey, DependencyIdKey } from './symbols';
import {
  FactoryDirectory,
  FactoryFunction,
  InjectableConstructor,
  ServiceDirectory
} from './types';

/**
 * Stores instances indexed by their type in a run-time type-safe fashion.
 */
export class Registry {
  private static _nextId = 0;

  /**
   * Get the internal global dependency ID of a type, or assign it a new one
   * if does not already have one.
   *
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

  private _factories: FactoryDirectory = {};

  /**
   * Index a concrete object by its type.
   *
   * @param type The object's constructor/class
   * @param instance A concrete instance of `type`.
   */
  bind<T>(type: InjectableConstructor<T>, instance: T): void {
    const key = Registry.getId(type);

    if (!(instance instanceof type)) {
      throw new Error(`Implementation is not an instance of ${type.name}`);
    }

    if (this._services[key]) {
      console.log(this._services[key]);
      throw new Error(`Already bound: ${type.name}`);
    }

    this._services[key] = instance;
  }

  /**
   * Retrieve an already resolved instance by its type, throwing an error
   * if it's not found.
   *
   * @param type The object's type
   */
  get<T>(type: InjectableConstructor<T>): T {
    const key = Registry.getId(type);

    if (!this._services[key]) {
      throw new Error(`Not found: ${type.name}`);
    }

    const instance: unknown  = this._services[key];

    if (!(instance instanceof type)) {
      throw new Error(`Registered instance is not a ${type.name}`);
    }

    return instance as T;
  }

  /**
   * Register function `factory` as the source of `type` instances.
   * @param type
   * @param factory
   */
  addFactory<T>(
    type: InjectableConstructor<T>,
    factory: FactoryFunction<T>
  ): void {
    const key = Registry.getId(type);
    this._factories[key] = factory;
  }

  /**
   * Create an instance of a class while injecting dependencies to its
   * constructor based on argument type information added witn `injectable()`.
   *
   * @param type A class constructor.
   * @param extraArgs Extra arguments to pass to the constructor after the
   *   injected dependencies.
   */
  resolve<T>(type: InjectableConstructor<T>, ...extraArgs: any[]): T {
    const key = Registry.getId(type);
    let result: unknown;

    if (this._services[key]) {
      result = this._services[key];
    } else if (this._factories[key]) {
      const factory = this._factories[key];

      const argTypes = factory[ArgumentTypesKey] || [];
      const args: any[] = argTypes
        .map(argType => this.get(argType));
      args.push(...extraArgs);

      result = factory(...args);
      this.bind(type, result);
    } else {
      const argTypes = type[ArgumentTypesKey] || [];
      const args: any[] = argTypes
        .map(argType => this.get(argType));
      args.push(...extraArgs);

      result = new type(...args);
      this.bind(type, result);
    }

    if (!(result instanceof type)) {
      throw new Error(`Resolved to an incompatible instance: ${type.name}`);
    }

    return result;
  }
}
