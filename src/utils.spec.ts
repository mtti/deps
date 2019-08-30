import { assertNotNull } from './utils';

describe('utils', () => {
  describe('assertNotNull', () => {
    describe('when given non-null', () => {
      it('returns the original value', () => {
        const original = 'dummy';
        expect(assertNotNull(original)).toBe(original);
      });
    });

    describe('when given null', () => {
      it('throws an error', () => {
        let error: Error|null = null;
        try {
          assertNotNull((null as unknown));
        } catch (err) {
          error = err;
        }
        expect(error).not.toBeNull();
      });
    });
  });
});
