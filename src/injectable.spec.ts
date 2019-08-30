import { ArgumentTypesKey } from './symbols';
import { assertNotNull } from './utils';
import { FactoryFunction, InjectableConstructor } from './types';
import { injectableClass, injectableFactory } from './injectable';

class FirstDummyDependency {}

class SecondDummyDependency {}

class DummyResult {
  first: FirstDummyDependency;
  second: SecondDummyDependency;

  constructor(first: FirstDummyDependency, second: SecondDummyDependency) {
    this.first = first;
    this.second = second;
  }
}

describe('decorators', () => {
  describe('injectableClass()', () => {
    let targetType: InjectableConstructor<unknown>|null = null;

    beforeEach(() => {
      targetType = class {
        first: FirstDummyDependency;
        second: SecondDummyDependency;

        constructor(
          first: FirstDummyDependency,
          second: SecondDummyDependency
        ) {
          this.first = first;
          this.second = second;
        }
      };
    });

    beforeEach(() => {
      injectableClass(
        assertNotNull(targetType),
        [ FirstDummyDependency, SecondDummyDependency ]
      );
    });

    it('adds the correct runtime type information', () => {
      expect(assertNotNull(targetType)[ArgumentTypesKey]).toEqual(
        [ FirstDummyDependency, SecondDummyDependency ]
      );
    });
  });

  describe('injectableFactory()', () => {
    let targetFunction: FactoryFunction<unknown>|null;

    beforeEach(() => {
      targetFunction = (
        first: FirstDummyDependency,
        second: SecondDummyDependency
      ): DummyResult => new DummyResult(first, second);
    });

    beforeEach(() => {
      injectableFactory(
        assertNotNull(targetFunction),
        [ FirstDummyDependency, SecondDummyDependency ]
      );
    });

    it('adds the correct runtime type information', () => {
      expect(assertNotNull(targetFunction)[ArgumentTypesKey]).toEqual(
        [ FirstDummyDependency, SecondDummyDependency ]
      );
    });
  });
});
