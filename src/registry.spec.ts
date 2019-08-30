import { injectable } from './injectable';
import { Registry } from './registry';

class ParentDependency {}

class DummyDependency extends ParentDependency {}

class InjectableDependency {
  dependency: DummyDependency;

  constructor(dependency: DummyDependency) {
    this.dependency = dependency;
  }
}

injectable(InjectableDependency, [ DummyDependency ]);

describe('Registry', () => {
  let registry: Registry = new Registry();
  let error: Error|null = null;
  let dummyDependency: DummyDependency = new DummyDependency();

  beforeEach(() => {
    registry = new Registry();
    dummyDependency = new DummyDependency();
    error = null;
  });

  describe('registering and fetching', () => {
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

      it('returns the registered instance', () => {
        expect(result).toBe(dependency);
      });
    });

    describe('with superclass', () => {
      beforeEach(() => {
        registry.bind(ParentDependency, dependency);
        result = registry.get(ParentDependency);
      });

      it('returns the registered instance', () => {
        expect(result).toBe(dependency);
      });
    });

    describe('non-existent dependency', () => {
      beforeEach(() => {
        result = registry.get(DummyDependency);
      });

      it('creates an instance', () => {
        expect(result).toBeInstanceOf(DummyDependency);
      });
    });
  });

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
        registry.bind(DummyDependency, new DummyDependency())
      } catch (err) {
        error = err;
      }
    });

    it('throws an error', () => {
      expect(error).not.toBeNull();
    });
  });

  describe('resolve()', () => {
    let result: InjectableDependency|null = null;

    beforeEach(() => {
      result = null;
    });

    beforeEach(() => {
      registry.bind(DummyDependency, dummyDependency);
      result = registry.resolve(InjectableDependency);
    });

    it('successfully creates an instance', () => {
      expect(result).not.toBeNull();
    });

    it('injects dependency into the instance', () => {
      if (!result) {
        throw new Error('result is null');
      }
      expect(result.dependency).toBe(dummyDependency);
    });
  });
});
