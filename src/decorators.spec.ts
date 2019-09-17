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
  let error: Error|null = null;

  beforeEach(() => {
    error = null;
  });

  describe(injectClass.name, () => {
    describe('with valid arguments', () => {
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

    describe('with non-function type', () => {
      beforeEach(() => {
        try {
          injectClass([], {} as any);
        } catch (err) {
          error = err;
        }
      });

      it('throws an error', () => {
        expect(error).not.toBeNull();
      });
    });

    describe('with falsy argument', () => {
      beforeEach(() => {
        try {
          injectClass([null as any], FirstDummyDependency);
        } catch (err) {
          error = err;
        }
      });

      it('throws an error', () => {
        expect(error).not.toBeNull();
      });
    });
  });

  describe(injectFunction.name, () => {
    describe('with valid arguments', () => {
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

    describe('with non-function type', () => {
      beforeEach(() => {
        try {
          injectFunction([], {} as any);
        } catch (err) {
          error = err;
        }
      });

      it('throws an error', () => {
        expect(error).not.toBeNull();
      });
    });

    describe('with falsy argument', () => {
      beforeEach(() => {
        try {
          injectFunction([null as any], async () => null);
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
