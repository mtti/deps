/* eslint-disable max-classes-per-file */

import { DependencyIdKey } from './symbols';
import { Injector } from './injector';
import { assertNotNull, resolveDependencyKey } from './utils';
import { injectClass, injectFunction } from './decorators';

class SimpleConstructable {}
injectClass([], SimpleConstructable);

class ParentDependency {}

class DummyDependency extends ParentDependency {}
injectClass([], DummyDependency);

class DummyTargetService {
  dependency: DummyDependency;

  constructor(dependency: DummyDependency) {
    this.dependency = dependency;
  }
}
injectClass([DummyDependency], DummyTargetService);

class HasUnresolvableDependency {
  dependency: DummyDependency;

  constructor(dependency: DummyDependency) {
    this.dependency = dependency;
  }
}
injectClass([Symbol('unresolvable')], HasUnresolvableDependency);

class CircularA {}

class CircularB {
  dep: CircularA;

  constructor(dep: CircularA) {
    this.dep = dep;
  }
}
injectClass([CircularA], CircularB);

async function createCircularA(dep: CircularB): Promise<CircularA> {
  return new CircularA();
}
injectFunction([CircularB], createCircularA);

describe('Injector', () => {
  let injector: Injector = new Injector();
  let error: Error|null = null;

  beforeEach(() => {
    injector = new Injector();
    error = null;
  });

  describe('bind()', () => {
    describe('with a class', () => {
      describe('registering wrong type of instance', () => {
        beforeEach(() => {
          try {
            injector.bind(DummyDependency, {} as DummyDependency);
          } catch (err) {
            error = err;
          }
        });

        it('throws an error', () => {
          expect(error).not.toBeNull();
        });
      });

      describe('registering same type more than once', () => {
        beforeEach(() => {
          injector.bind(DummyDependency, new DummyDependency());
          try {
            injector.bind(DummyDependency, new DummyDependency());
          } catch (err) {
            error = err;
          }
        });

        it('throws an error', () => {
          expect(error).not.toBeNull();
        });
      });
    });

    describe('with a symbol', () => {
      const key = Symbol('dummy key');

      describe('registering same key', () => {
        beforeEach(() => {
          injector.bind(key, new DummyDependency());
          try {
            injector.bind(key, new DummyDependency());
          } catch (err) {
            error = err;
          }
        });

        it('throws an error', () => {
          expect(error).not.toBeNull();
        });
      });
    });
  });

  describe('get()', () => {
    const dependency: DummyDependency = new DummyDependency();
    let result: DummyDependency|null = null;

    beforeEach(() => {
      result = null;
    });

    describe('with the same type', () => {
      beforeEach(() => {
        injector.bind(DummyDependency, dependency);
        result = injector.get(DummyDependency);
      });

      it('returns the previously bound instance', () => {
        expect(result).toBe(dependency);
      });
    });

    describe('with symbol', () => {
      const key = Symbol('dummy key');

      beforeEach(() => {
        injector.bind(key, dependency);
        result = injector.get<DummyDependency>(key);
      });

      it('returns the previously bound instance', () => {
        expect(result).toBe(dependency);
      });
    });

    describe('with superclass', () => {
      beforeEach(() => {
        injector.bind(ParentDependency, dependency);
        result = injector.get(ParentDependency);
      });

      it('returns the previously bound instance', () => {
        expect(result).toBe(dependency);
      });
    });

    describe('non-existent type', () => {
      beforeEach(() => {
        try {
          result = injector.get(DummyDependency);
        } catch (err) {
          error = err;
        }
      });

      it('throw an error', () => {
        expect(error).not.toBeNull();
      });
    });

    describe('non-existent symbol', () => {
      beforeEach(() => {
        try {
          result = injector.get(Symbol('dummy'));
        } catch (err) {
          error = err;
        }
      });

      it('throws an error', () => {
        expect(error).not.toBeNull();
      });
    });

    describe('bound to wrong type', () => {
      beforeEach(() => {
        const key = resolveDependencyKey(DummyDependency);
        injector.bind(key, {} as DummyDependency);
        try {
          result = injector.get(DummyDependency);
        } catch (err) {
          error = err;
        }
      });

      it('throw an error', () => {
        expect(assertNotNull(error).message).toEqual('Bound instance is not a DummyDependency');
      });
    });
  });

  describe('resolve()', () => {
    const simpleCallableInner = (): boolean => true;
    const simpleCallableOuter = async (): Promise<() => boolean> => (
      simpleCallableInner
    );

    const complexCallableInner = (): boolean => true;
    const complexCallableOuter = async (
      constructable: SimpleConstructable,
    ): Promise<() => boolean> => (
      complexCallableInner
    );
    injectFunction([SimpleConstructable], complexCallableOuter);

    describe('with a simple constructable dependency', () => {
      let result: SimpleConstructable|null = null;

      beforeEach(() => {
        result = null;
      });

      beforeEach(async () => {
        result = await injector.resolve(SimpleConstructable);
      });

      it('creates instance of the correct type', () => {
        expect(result).toBeInstanceOf(SimpleConstructable);
      });
    });

    describe('with a simple callable dependency', () => {
      let result: (() => boolean)|null = null;

      beforeEach(() => {
        result = null;
      });

      beforeEach(async () => {
        result = await injector.resolve(simpleCallableOuter);
      });

      it('resolves to the inner function', () => {
        expect(result).toBe(simpleCallableInner);
      });
    });

    describe('with manually bound constructable dependency', () => {
      let result: SimpleConstructable|null = null;
      const expected = new SimpleConstructable();

      beforeEach(() => {
        result = null;
      });

      beforeEach(async () => {
        injector.bind(SimpleConstructable, expected);
        result = await injector.resolve(SimpleConstructable);
      });

      it('resolves to the bound instance', () => {
        expect(result).toBe(expected);
      });
    });

    describe('with a constructable dependency bound to a symbol', () => {
      let result: SimpleConstructable|null = null;
      const expected = new SimpleConstructable();
      const key = Symbol('SimpleConstructable');

      beforeEach(() => {
        result = null;
      });

      beforeEach(async () => {
        injector.bind(key, expected);
        result = await injector.resolve(key);
      });

      it('resolves to the bound instance', () => {
        expect(result).toBe(expected);
      });
    });

    describe('with a dependency from a factory function', () => {
      let result: SimpleConstructable|null = null;
      let createdDependency: SimpleConstructable|null = null;

      beforeEach(() => {
        result = null;
        createdDependency = null;
      });

      beforeEach(() => {
        const factory = async (): Promise<SimpleConstructable> => {
          createdDependency = new SimpleConstructable();
          return createdDependency;
        };
        injector.provide(SimpleConstructable, factory);
      });

      beforeEach(async () => {
        result = await injector.resolve(SimpleConstructable);
      });

      it('resolves to the created dependency', () => {
        expect(result).toBe(createdDependency);
      });
    });

    describe('with an unresolvable dependency', () => {
      beforeEach(async () => {
        try {
          await injector.resolve(HasUnresolvableDependency);
        } catch (err) {
          error = err;
        }
      });

      it('throws an error', () => {
        expect(assertNotNull(error).message)
          .toEqual('Unresolvable dependency: Symbol(unresolvable)');
      });
    });

    describe('with circular dependency', () => {
      beforeEach(async () => {
        try {
          injector.provide(CircularA, createCircularA);
          await injector.resolve(CircularB);
        } catch (err) {
          error = err;
        }
      });

      it('throws an error', () => {
        expect(assertNotNull(error).message)
          .toEqual('Circular dependency detected: Symbol(CircularB) <- Symbol(CircularA) <- Symbol(CircularB)');
      });
    });

    describe('when bound to an incompatible instance', () => {
      class UnrelatedClass {}

      beforeEach(() => {
        // eslint-disable-next-line dot-notation
        injector['_services'][(SimpleConstructable as any)[DependencyIdKey]]
          = new UnrelatedClass();
      });

      beforeEach(async () => {
        try {
          await injector.resolve(SimpleConstructable);
        } catch (err) {
          error = err;
        }
      });

      it('throws an error', () => {
        expect(assertNotNull(error).message)
          .toEqual('Resolved to an incompatible instance: SimpleConstructable');
      });
    });

    describe('with a service with various dependencies', () => {
      class SimpleService {
        constructable: SimpleConstructable;

        callable: () => boolean;

        constructor(
          constructable: SimpleConstructable,
          callable: () => boolean,
        ) {
          this.constructable = constructable;
          this.callable = callable;
        }
      }
      injectClass([SimpleConstructable, complexCallableOuter], SimpleService);

      let result: SimpleService|null = null;

      beforeEach(() => {
        result = null;
      });

      beforeEach(async () => {
        result = await injector.resolve(SimpleService);
      });

      it('resolves to a SimpleService instance', () => {
        expect(result).toBeInstanceOf(SimpleService);
      });

      it('resolves constructable dependency', () => {
        expect(assertNotNull(result).constructable)
          .toBeInstanceOf(SimpleConstructable);
      });

      it('resolves callable dependency', () => {
        expect(assertNotNull(result).callable).toBe(complexCallableInner);
      });
    });
  });

  describe('_upsert', () => {
    const expected: SimpleConstructable = new SimpleConstructable();
    let result: SimpleConstructable|null = null;
    let upsert: (<T>(key: symbol, source: () => Promise<T>) => Promise<T>);

    beforeEach(() => {
      // Disabled to access private method.
      // eslint-disable-next-line dot-notation
      upsert = injector['_upsert'].bind(injector);

      result = null;
    });

    describe('when already bound', () => {
      beforeEach(() => {
        injector.bind(SimpleConstructable, expected);
      });

      beforeEach(async () => {
        result = await upsert(
          (SimpleConstructable as any)[DependencyIdKey],
          async () => new SimpleConstructable(),
        );
      });

      it('returns the previously bound instance', () => {
        expect(result).toBe(expected);
      });
    });
  });
});
