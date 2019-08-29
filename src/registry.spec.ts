import { Registry } from './registry';

class ParentDependency {}

class DummyDependency extends ParentDependency {}

describe('Registry', () => {
  let registry: Registry = new Registry();
  let error: Error|null = null;

  beforeEach(() => {
    registry = new Registry();
    error = null;
  });

  describe('registering and fetching', () => {
    let result: DummyDependency|null = null;
    const dependency: DummyDependency = new DummyDependency();

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

  describe('fetching non-existent dependency', () => {
    beforeEach(() => {
      try {
        registry.get(DummyDependency);
      } catch (err) {
        error = err;
      }
    });

    it('throws an error', () => {
      expect(error).not.toBeNull();
    });
  });
});
