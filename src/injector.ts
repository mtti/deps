import { ArgumentTypesKey } from './symbols';
import { CallableDependency, DependencyKey } from './types';
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
   *
   * @param type
   * @param factory
   */
  provide<T>(
    identity: DependencyKey<T>,
    factory: CallableDependency<T>,
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

  /**
   * Return a previously bound instance if one exists, or if not, call a
   * function to create an instance then bind and return that.
   *
   * @param key
   * @param source
   */
  private async _upsert<T>(key: symbol, source: () => Promise<T>): Promise<T> {
    await (async (): Promise<void> => {})();

    if (this._services[key]) {
      return this._services[key];
    }

    const result: T = await source();
    this.bind(key, result);

    return result;
  }

  /**
   * Resolve a list of dependencies.
   *
   * @param argTypes
   * @param stack
   */
  private async _resolveArguments(
    argTypes: DependencyKey<unknown>[]|undefined,
    stack: symbol[],
  ): Promise<unknown[]> {
    // ESLint rules are disabled to resolve arguments one-by-one to avoid
    // instances being created twice dues to async timings

    if (!argTypes) {
      return [];
    }

    const result: unknown[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const item of argTypes) {
      // eslint-disable-next-line no-await-in-loop
      result.push(await this._resolve(item, stack));
    }
    return result;
  }

  private async _resolve<T>(
    identity: DependencyKey<T>,
    stack: symbol[],
  ): Promise<T> {
    const key = resolveDependencyKey(identity);
    let result: unknown;

    if (stack.includes(key)) {
      const keys = [...stack, key].map((item) => item.toString());
      throw new Error(`Circular dependency detected: ${keys.join(' <- ')}`);
    }
    const newStack = [...stack, key];

    if (this._services[key]) {
      // Return existing instance
      result = this._services[key];
    } else if (this._factories[key]) {
      // Create new instance with factory function

      const factory = this._factories[key] as CallableDependency<unknown>;
      const args: unknown[] = await this._resolveArguments(
        factory[ArgumentTypesKey],
        newStack,
      );

      result = await this._upsert(key, async () => factory(...args));
    } else if (typeof identity !== 'symbol') {
      if (isConstructable(identity)) {
        // Create new instance with constructor

        const args: unknown[] = await this._resolveArguments(
          identity[ArgumentTypesKey],
          newStack,
        );

        // eslint-disable-next-line new-cap
        result = await this._upsert(key, async () => new identity(...args));
      } else {
        // Create instance from a callable

        const args: unknown[] = await this._resolveArguments(
          identity[ArgumentTypesKey],
          newStack,
        );

        result = await this._upsert(key, async () => identity(...args));
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
