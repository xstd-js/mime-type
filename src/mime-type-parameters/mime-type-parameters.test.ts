import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MIMETypeParameters, MIMETypeParametersToStringOptions } from './mime-type-parameters.ts';

describe('MIMETypeParameters', () => {
  const toStringOptions: MIMETypeParametersToStringOptions = {
    includeLeadingSeparator: true,
  };

  describe('new(...)', () => {
    describe('with nothing as input', () => {
      it('works with undefined as input', () => {
        expect(new MIMETypeParameters().toString(toStringOptions)).toBe('');
      });
    });

    describe('with a string as input', () => {
      it('works with an empty string as input', () => {
        expect(new MIMETypeParameters('').toString(toStringOptions)).toBe('');
      });

      it('works with one parameter in a string as input', () => {
        expect(new MIMETypeParameters('; a=b').toString(toStringOptions)).toBe('; a=b');
        expect(new MIMETypeParameters('a=b').toString(toStringOptions)).toBe('; a=b');
      });

      it('works with multiple parameters in a string as input', () => {
        expect(new MIMETypeParameters('; a=b; c=d').toString(toStringOptions)).toBe('; a=b; c=d');
      });

      it('works with "quoted-string"', () => {
        expect(new MIMETypeParameters('; test="ab\\"cd"').toString(toStringOptions)).toBe(
          '; test="ab\\"cd"',
        );
      });

      it('works with "ext-parameter"', () => {
        // NOTE: "ext-parameter" is not really supported - instead, the algorithm accepts the pattern but does not check its validity, not normalize its content
        expect(
          new MIMETypeParameters("; filename*=UTF-8''file%20name.jpg").toString(toStringOptions),
        ).toBe("; filename*=UTF-8''file%20name.jpg");
      });
    });

    describe('with an iterable as input', () => {
      it('works with a Map as input', () => {
        expect(
          new MIMETypeParameters(
            new Map([
              ['a', 'b'],
              ['c', 'd'],
            ]),
          ).toString(toStringOptions),
        ).toBe('; a=b; c=d');
      });
    });

    describe('with an object as input', () => {
      it('works with a key/value object as input', () => {
        expect(
          new MIMETypeParameters({
            a: 'b',
            c: 'd',
          }).toString(toStringOptions),
        ).toBe('; a=b; c=d');
      });
    });

    describe('with invalid data', () => {
      it('throws with an invalid input', () => {
        expect(() => new MIMETypeParameters(null as any)).toThrow();
      });

      it('throws with an invalid input string', () => {
        // invalid string
        expect(() => new MIMETypeParameters('invalid')).toThrow();
        // invalid key
        expect(() => new MIMETypeParameters('@=b')).toThrow();
        // invalid value
        expect(() => new MIMETypeParameters('a=\u0000')).toThrow();
      });

      it('throws with an invalid key/value object', () => {
        // invalid key
        expect(
          () =>
            new MIMETypeParameters({
              '@': 'b',
            }),
        ).toThrow();

        // invalid value
        expect(
          () =>
            new MIMETypeParameters({
              a: '\u0000',
            }),
        ).toThrow();
      });
    });
  });

  describe('static methods', () => {
    describe('.parse(...)', () => {
      it('returns a valid MIMETypeParameters when providing a VALID parameter in a string as input', () => {
        expect(MIMETypeParameters.parse('; a=b')!.toString(toStringOptions)).toBe('; a=b');
      });

      it('returns null when providing an INVALID parameter in a string as input', () => {
        expect(MIMETypeParameters.parse('invalid')).toBe(null);
      });
    });

    describe('.canParse(...)', () => {
      it('returns true when providing a VALID parameter in a string as input', () => {
        expect(MIMETypeParameters.canParse('; a=b')).toBe(true);
      });

      it('returns false when providing a INVALID parameter in a string as input', () => {
        expect(MIMETypeParameters.canParse('invalid')).toBe(false);
        expect(
          MIMETypeParameters.canParse(
            'invalid-invalid-invalid-invalid-invalid-invalid-invalid-invalid-invalid-invalid-invalid-invalid',
          ),
        ).toBe(false);
      });
    });

    describe('.of(...)', () => {
      it('returns expected instance', () => {
        const mimeTypeA: MIMETypeParameters = new MIMETypeParameters('a=b');

        expect(MIMETypeParameters.of(mimeTypeA)).toBe(mimeTypeA);

        const mimeTypeB: MIMETypeParameters = MIMETypeParameters.of('a=b');

        expect(mimeTypeB.toString()).toBe('a=b');
        expect(mimeTypeB).not.toBe(mimeTypeA);
      });
    });
  });

  describe('properties', () => {
    describe('.size', () => {
      it('should have correct size', () => {
        expect(new MIMETypeParameters('').size).toBe(0);
        expect(new MIMETypeParameters('; a=b').size).toBe(1);
        expect(new MIMETypeParameters('a=b; c=d').size).toBe(2);
      });
    });
  });

  describe('methods', () => {
    describe('.append(...)', () => {
      let mimeType: MIMETypeParameters;

      beforeEach(() => {
        mimeType = new MIMETypeParameters('');
      });

      it('should be able to append new parameters', () => {
        mimeType.append('a', 'b');
        expect(mimeType.toString(toStringOptions)).toBe('; a=b');
        mimeType.append('a', 'c');
        expect(mimeType.toString(toStringOptions)).toBe('; a=b; a=c');
      });

      it('should throw if key is invalid', () => {
        expect(() => mimeType.append('@', 'b')).toThrow();
      });

      it('should throw if value is invalid', () => {
        expect(() => mimeType.append('a', '\u0000')).toThrow();
      });
    });

    describe('.delete(...)', () => {
      let mimeType: MIMETypeParameters;

      beforeEach(() => {
        mimeType = new MIMETypeParameters('; a=b; a=c; e=f');
      });

      it('should be able to delete a parameter from its key', () => {
        expect(mimeType.delete('a')).toBe(2);
        expect(mimeType.toString(toStringOptions)).toBe('; e=f');
      });

      it('should be able to delete a parameter from its key and value', () => {
        expect(mimeType.delete('a', 'c')).toBe(1);
        expect(mimeType.toString(toStringOptions)).toBe('; a=b; e=f');
      });

      it('should throw if key is invalid', () => {
        expect(() => mimeType.delete('@')).toThrow();
      });

      it('should throw if value is invalid', () => {
        expect(() => mimeType.delete('a', '\u0000')).toThrow();
      });
    });

    describe('.get(...)', () => {
      let mimeType: MIMETypeParameters;

      beforeEach(() => {
        mimeType = new MIMETypeParameters('; a=b; a=c; e=f');
      });

      it('should be able to get the first a parameter from a key', () => {
        expect(mimeType.get('a')).toBe('b');
      });

      it('should throw if the parameter does not exist', () => {
        expect(() => mimeType.get('z')).toThrow();
      });

      it('should throw if key is invalid', () => {
        expect(() => mimeType.get('@')).toThrow();
      });
    });

    describe('.getAll(...)', () => {
      let mimeType: MIMETypeParameters;

      beforeEach(() => {
        mimeType = new MIMETypeParameters('; a=b; a=c; e=f');
      });

      it('should be able to get the all the parameters from a key', () => {
        expect(mimeType.getAll('a')).toEqual(['b', 'c']);
        expect(mimeType.getAll('e')).toEqual(['f']);
      });

      it('should return an empty array if the parameter does not exist', () => {
        expect(mimeType.getAll('z')).toEqual([]);
      });

      it('should throw if key is invalid', () => {
        expect(() => mimeType.getAll('@')).toThrow();
      });
    });

    describe('.getOptional(...)', () => {
      let mimeType: MIMETypeParameters;

      beforeEach(() => {
        mimeType = new MIMETypeParameters('; a=b; a=c; e=f');
      });

      it('should be able to get the first a parameter from a key', () => {
        expect(mimeType.getOptional('a')).toBe('b');
      });

      it('should return undefined if the parameter does not exist', () => {
        expect(mimeType.getOptional('z')).toBe(undefined);
      });

      it('should throw if key is invalid', () => {
        expect(() => mimeType.getOptional('@')).toThrow();
      });
    });

    describe('.has(...)', () => {
      let mimeType: MIMETypeParameters;

      beforeEach(() => {
        mimeType = new MIMETypeParameters('; a=b; a=c; e=f');
      });

      it('should have an existing parameter', () => {
        expect(mimeType.has('a')).toBe(true);
        expect(mimeType.has('e')).toBe(true);
      });

      it('should have an existing parameter with key and value', () => {
        expect(mimeType.has('a', 'b')).toBe(true);
        expect(mimeType.has('a', 'c')).toBe(true);
        expect(mimeType.has('e', 'f')).toBe(true);
      });

      it('should not have an inexisting parameter', () => {
        expect(mimeType.has('z')).toBe(false);
      });

      it('should not have a parameter with an inexisting value', () => {
        expect(mimeType.has('a', 'z')).toBe(false);
      });

      it('should throw if key is invalid', () => {
        expect(() => mimeType.has('@')).toThrow();
      });
    });

    describe('.set(...)', () => {
      let mimeType: MIMETypeParameters;

      beforeEach(() => {
        mimeType = new MIMETypeParameters('');
      });

      it('should be able to set new parameters', () => {
        mimeType.set('a', 'b');
        expect(mimeType.toString(toStringOptions)).toBe('; a=b');
        mimeType.set('a', 'c');
        expect(mimeType.toString(toStringOptions)).toBe('; a=c');
      });

      it('should throw if key is invalid', () => {
        expect(() => mimeType.set('@', 'b')).toThrow();
      });

      it('should throw if value is invalid', () => {
        expect(() => mimeType.set('a', '\u0000')).toThrow();
      });
    });

    describe('.clear(...)', () => {
      it('should remove all parameters', () => {
        const mimeType = new MIMETypeParameters('; a=a1; a=a2');
        expect(mimeType.toString(toStringOptions)).toBe('; a=a1; a=a2');
        mimeType.clear();
        expect(mimeType.toString(toStringOptions)).toBe('');
      });
    });

    describe('.sort(...)', () => {
      it('should be able to sort parameters', () => {
        {
          const mimeType = new MIMETypeParameters('; a=a1; a=a2');
          mimeType.sort();
          expect(mimeType.toString(toStringOptions)).toBe('; a=a1; a=a2');
        }

        {
          const mimeType = new MIMETypeParameters('; a=a1; b=b1');
          mimeType.sort();
          expect(mimeType.toString(toStringOptions)).toBe('; a=a1; b=b1');
        }

        {
          const mimeType = new MIMETypeParameters('; b=b1; a=a1');
          mimeType.sort();
          expect(mimeType.toString(toStringOptions)).toBe('; a=a1; b=b1');
        }
      });
    });

    describe('.keys(...)', () => {
      it('should return parameter keys', () => {
        expect(Array.from(new MIMETypeParameters('').keys())).toEqual([]);
        expect(Array.from(new MIMETypeParameters('; a=a1; a=a2; b=b1').keys())).toEqual([
          'a',
          'a',
          'b',
        ]);
      });
    });

    describe('.values(...)', () => {
      it('should return parameter values', () => {
        expect(Array.from(new MIMETypeParameters('').values())).toEqual([]);
        expect(Array.from(new MIMETypeParameters('; a=a1; a=a2; b=b1').values())).toEqual([
          'a1',
          'a2',
          'b1',
        ]);
      });
    });

    describe('.entries(...)', () => {
      it('should return parameter entries', () => {
        expect(Array.from(new MIMETypeParameters('').entries())).toEqual([]);
        expect(Array.from(new MIMETypeParameters('; a=a1; a=a2; b=b1').entries())).toEqual([
          ['a', 'a1'],
          ['a', 'a2'],
          ['b', 'b1'],
        ]);
      });
    });

    describe('[Symbol.iterator](...)', () => {
      it('should return parameter entries', () => {
        expect(Array.from(new MIMETypeParameters('; a=a1; a=a2; b=b1')[Symbol.iterator]())).toEqual(
          [
            ['a', 'a1'],
            ['a', 'a2'],
            ['b', 'b1'],
          ],
        );
      });
    });

    describe('forEach(...)', () => {
      it('should iterate on entries', () => {
        const spy = vi.fn();
        const mimeType = new MIMETypeParameters('; a=a1; a=a2; b=b1');
        mimeType.forEach(spy);
        expect(spy).toHaveBeenCalledTimes(3);
        expect(spy).toHaveBeenNthCalledWith(1, 'a1', 'a');
        expect(spy).toHaveBeenNthCalledWith(2, 'a2', 'a');
        expect(spy).toHaveBeenNthCalledWith(3, 'b1', 'b');
      });
    });

    describe('.toString(...)', () => {
      it('returns expected output', () => {
        expect(new MIMETypeParameters('').toString()).toBe('');
        expect(new MIMETypeParameters('').toString({ includeLeadingSeparator: true })).toBe('');
        expect(new MIMETypeParameters('; a=b').toString({ includeLeadingSeparator: true })).toBe(
          '; a=b',
        );
        expect(new MIMETypeParameters('a=b').toString({ includeLeadingSeparator: true })).toBe(
          '; a=b',
        );
        expect(
          new MIMETypeParameters('; a=b; c=d').toString({ includeLeadingSeparator: true }),
        ).toBe('; a=b; c=d');
        expect(
          new MIMETypeParameters('; a=b; c=d').toString({ includeLeadingSeparator: false }),
        ).toBe('a=b; c=d');
      });
    });
  });

  describe('immutability', () => {
    it('should throw when updating an immutable MIMETypeParameters', () => {
      const mimeType = new MIMETypeParameters('; a=b').makeImmutable();

      expect(mimeType.immutable).toBe(true);
      expect(() => mimeType.set('b', 'b1')).toThrow();
    });
  });
});
