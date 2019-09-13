import { ArgumentTypesKey } from './symbols';
import { DependencyKey, FactoryFunction } from './types';
import { isConstructable, resolveDependencyKey } from './utils';

/**
 * Stores instances indexed by their type in a run-time type-safe fashion.
 */
export class Injector {
  /**
   * Holds service instances keyed by their ID symbol. The type is `any` because
   * TypeScript does not support indexing by symbol at the time of writing.
   */
  private _services: any = {};

  private _factories: any = {};

  /**
   * Index a concrete object by its type.
   *
   * @param type The object's constructor/class
   * @param instance A concrete instance of `type`.
   */
  bind<T>(identity: DependencyKey<T>, instance: T): void {
    const key = resolveDependencyKey(identity);

    if (typeof identity !== 'symbol' && !(instance instanceof identity)) {
      throw new Error(`Trying to bind instance which is not a ${identity.name}`);
    }

    if (this._services[key]) {
      throw new Error(`Already bound: ${key.toString()}`);
    }

    this._services[key] = instance;
  }

  /**
   * Retrieve an already resolved instance by its type, throwing an error
   * if it's not found.
   *
   * @param type The object's type
   */
  get<T>(identity: DependencyKey<T>): T {
    const key = resolveDependencyKey(identity);

    if (!this._services[key]) {
      throw new Error(`Not found: ${identity.toString()}`);
    }

    const instance: unknown = this._services[key];

    if (typeof identity !== 'symbol' && !(instance instanceof identity)) {
      throw new Error(`Bound instance is not a ${identity.name}`);
    }

    return instance as T;
  }

  /**
   * Register function `factory` as the source of `identity` instances.
   * @param type
   * @param factory
   */
  provide<T>(
    identity: DependencyKey<T>,
    factory: FactoryFunction<T>,
  ): void {
    const key = resolveDependencyKey(identity);
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
  async resolve<T>(identity: DependencyKey<T>): Promise<T> {
    return this._resolve<T>(identity, []);
  }

  private async _resolve<T>(
    identity: DependencyKey<T>,
    stack: symbol[],
  ): Promise<T> {
    const key = resolveDependencyKey(identity);
    let result: unknown;

    if (stack.includes(key)) {
      throw new Error(`Circular dependency detected: ${key.toString()}`);
    }
    stack.push(key);

    if (this._services[key]) {
      // Return existing instance
      result = this._services[key];
    } else if (this._factories[key]) {
      // Create new instance with factory function
      const factory = this._factories[key] as FactoryFunction<unknown>;

      const argTypes = factory[ArgumentTypesKey] || [];
      const args: unknown[] = await Promise.all(
        argTypes.map((argType) => this._resolve(argType, stack)),
      );

      result = await factory(...args);
      this.bind(key, result);
    } else if (typeof identity !== 'symbol') {
      if (isConstructable(identity)) {
        // Create new instance with constructor
        const argTypes = identity[ArgumentTypesKey] || [];
        const args: unknown[] = await Promise.all(
          argTypes.map((argType) => this._resolve(argType, stack)),
        );

        // eslint-disable-next-line new-cap
        result = new identity(...args);
        this.bind(key, result);
      } else {
        // Create new instance with factory function
        const argTypes = identity[ArgumentTypesKey] || [];
        const args: unknown[] = await Promise.all(
          argTypes.map((argType) => this._resolve(argType, stack)),
        );

        result = await identity(...args);
        this.bind(key, result);
      }
    } else {
      throw new Error(`Unresolvable dependency: ${key.toString()}`);
    }

    if (isConstructable(identity) && !(result instanceof identity)) {
      throw new Error(`Resolved to an incompatible instance: ${identity.name}`);
    }

    return result as T;
  }
}
