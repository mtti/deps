/* eslint-disable max-classes-per-file */

import { ArgumentTypesKey } from './symbols';
import { assertNotNull } from './utils';
import { CallableDependency, ClassDependency } from './types';
import { injectClass, injectFunction } from './decorators';

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
    let targetType: ClassDependency<unknown>|null = null;

    beforeEach(() => {
      targetType = class {
        first: FirstDummyDependency;

        second: SecondDummyDependency;

        constructor(
          first: FirstDummyDependency,
          second: SecondDummyDependency,
        ) {
          this.first = first;
          this.second = second;
        }
      };
    });

    beforeEach(() => {
      injectClass(
        [FirstDummyDependency, SecondDummyDependency],
        assertNotNull(targetType),
      );
    });

    it('adds the correct runtime type information', () => {
      expect(assertNotNull(targetType)[ArgumentTypesKey]).toEqual(
        [FirstDummyDependency, SecondDummyDependency],
      );
    });
  });

  describe('injectFactory()', () => {
    let targetFunction: CallableDependency<unknown>|null;

    beforeEach(() => {
      targetFunction = async (
        first: FirstDummyDependency,
        second: SecondDummyDependency,
      ): Promise<DummyResult> => new DummyResult(first, second);
    });

    beforeEach(() => {
      injectFunction(
        [FirstDummyDependency, SecondDummyDependency],
        assertNotNull(targetFunction),
      );
    });

    it('adds the correct runtime type information', () => {
      expect(assertNotNull(targetFunction)[ArgumentTypesKey]).toEqual(
        [FirstDummyDependency, SecondDummyDependency],
      );
    });
  });
});
