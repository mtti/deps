/* eslint-disable max-classes-per-file */

import { Registry } from './registry';
import { assertNotNull, resolveDependencyKey } from './utils';
import { injectableClass, injectableFactory } from './injectable';

class ParentDependency {}

class DummyDependency extends ParentDependency {}

class DummyTargetService {
  dependency: DummyDependency;

  constructor(dependency: DummyDependency) {
    this.dependency = dependency;
  }
}
injectableClass(DummyTargetService, [DummyDependency]);

class HasUnresolvableDependency {
  dependency: DummyDependency;

  constructor(dependency: DummyDependency) {
    this.dependency = dependency;
  }
}
injectableClass(HasUnresolvableDependency, [Symbol('unresolvable')]);

class CircularA {}

class CircularB {
  dep: CircularA;

  constructor(dep: CircularA) {
    this.dep = dep;
  }
}
injectableClass(CircularB, [CircularA]);

async function createCircularA(dep: CircularB): Promise<CircularA> {
  return new CircularA();
}
injectableFactory(createCircularA, [CircularB]);

describe('Registry', () => {
  let registry: Registry = new Registry();
  let error: Error|null = null;
  let dummyDependency: DummyDependency = new DummyDependency();

  beforeEach(() => {
    registry = new Registry();
    dummyDependency = new DummyDependency();
    error = null;
  });

  describe('bind()', () => {
    describe('with a class', () => {
      describe('registering wrong type of instance', () => {
        beforeEach(() => {
          try {
            registry.bind(DummyDependency, {} as DummyDependency);
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
          registry.bind(DummyDependency, new DummyDependency());
          try {
            registry.bind(DummyDependency, new DummyDependency());
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
          registry.bind(key, new DummyDependency());
          try {
            registry.bind(key, new DummyDependency());
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
        registry.bind(DummyDependency, dependency);
        result = registry.get(DummyDependency);
      });

      it('returns the previously bound instance', () => {
        expect(result).toBe(dependency);
      });
    });

    describe('with symbol', () => {
      const key = Symbol('dummy key');

      beforeEach(() => {
        registry.bind(key, dependency);
        result = registry.get<DummyDependency>(key);
      });

      it('returns the previously bound instance', () => {
        expect(result).toBe(dependency);
      });
    });

    describe('with superclass', () => {
      beforeEach(() => {
        registry.bind(ParentDependency, dependency);
        result = registry.get(ParentDependency);
      });

      it('returns the previously bound instance', () => {
        expect(result).toBe(dependency);
      });
    });

    describe('non-existent type', () => {
      beforeEach(() => {
        try {
          result = registry.get(DummyDependency);
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
          result = registry.get(Symbol('dummy'));
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
        registry.bind(key, {} as DummyDependency);
        try {
          result = registry.get(DummyDependency);
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
    describe('with manually bound dependency', () => {
      let result: DummyTargetService|null = null;
      beforeEach(() => {
        result = null;
      });

      beforeEach(async () => {
        registry.bind(DummyDependency, dummyDependency);
        result = await registry.resolve(DummyTargetService);
      });

      it('successfully creates an instance', () => {
        expect(result).not.toBeNull();
      });

      it('injects dependency into the instance', () => {
        expect(assertNotNull(result).dependency).toBe(dummyDependency);
      });
    });

    describe('with a dependency from a factory function', () => {
      let result: DummyTargetService|null = null;
      let createdDependency: DummyDependency|null = null;

      beforeEach(() => {
        result = null;
        createdDependency = null;
      });

      beforeEach(() => {
        const factory = async (): Promise<DummyDependency> => {
          createdDependency = new DummyDependency();
          return createdDependency;
        };
        registry.addFactory(DummyDependency, factory);
      });

      beforeEach(async () => {
        result = await registry.resolve(DummyTargetService);
      });

      it('successfully creates an instance', () => {
        expect(result).not.toBeNull();
      });

      it('injects dependency into the instance', () => {
        expect(assertNotNull(result).dependency).toBe(createdDependency);
      });
    });

    describe('with an unresolvable dependency', () => {
      beforeEach(async () => {
        try {
          await registry.resolve(HasUnresolvableDependency);
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
          registry.addFactory(CircularA, createCircularA);
          await registry.resolve(CircularB);
        } catch (err) {
          error = err;
        }
      });

      it('throws an error', () => {
        expect(assertNotNull(error).message)
          .toEqual('Circular dependency detected: Symbol(CircularB dependency key)');
      });
    });
  });
});
