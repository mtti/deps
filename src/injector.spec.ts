/* eslint-disable max-classes-per-file */

import { Injector } from './injector';
import { assertNotNull, resolveDependencyKey } from './utils';
import { injectClass, injectFunction } from './decorators';

class ParentDependency {}

class DummyDependency extends ParentDependency {}

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
  let dummyDependency: DummyDependency = new DummyDependency();

  beforeEach(() => {
    injector = new Injector();
    dummyDependency = new DummyDependency();
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
    describe('with manually bound dependency', () => {
      let result: DummyTargetService|null = null;
      beforeEach(() => {
        result = null;
      });

      beforeEach(async () => {
        injector.bind(DummyDependency, dummyDependency);
        result = await injector.resolve(DummyTargetService);
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
        injector.provide(DummyDependency, factory);
      });

      beforeEach(async () => {
        result = await injector.resolve(DummyTargetService);
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
          .toEqual('Circular dependency detected: Symbol(CircularB dependency key)');
      });
    });
  });
});
