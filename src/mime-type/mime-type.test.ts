import { describe, expect, it } from 'vitest';
import { MIMEType } from './mime-type.ts';

describe('MIMEType', () => {
  describe('new(...)', () => {
    it('works with base input', () => {
      expect(new MIMEType('text/plain').toString()).toBe('text/plain');
    });

    it('works with parameters', () => {
      expect(new MIMEType('text/plain; charset="utf-8";78=8; test="ab\\"cd"').toString()).toBe(
        'text/plain; charset=utf-8; 78=8; test="ab\\"cd"',
      );
    });

    describe('with invalid data', () => {
      it('throws with an invalid input string', () => {
        // invalid type and subtype
        expect(() => new MIMEType('invalid').toString()).toThrow();
        // invalid parameters
        expect(() => new MIMEType('text/plain; def').toString()).toThrow();
      });
    });
  });

  describe('static methods', () => {
    describe('.parse(...)', () => {
      it('returns a valid MIMEType when providing a VALID string as input', () => {
        expect(MIMEType.parse('text/plain')!.toString()).toBe('text/plain');
      });

      it('returns null when providing an INVALID string as input', () => {
        expect(MIMEType.parse('invalid')).toBe(null);
      });
    });

    describe('.canParse(...)', () => {
      it('returns true when providing one VALID parameter in a string as input', () => {
        expect(MIMEType.canParse('text/plain')).toBe(true);
      });

      it('returns false when providing an INVALID string as input', () => {
        expect(MIMEType.canParse('invalid')).toBe(false);
      });
    });

    describe('.of(...)', () => {
      it('returns expected instance', () => {
        const mimeTypeA: MIMEType = new MIMEType('text/plain');

        expect(MIMEType.of(mimeTypeA)).toBe(mimeTypeA);

        const mimeTypeB: MIMEType = MIMEType.of('text/plain');

        expect(mimeTypeB.toString()).toBe('text/plain');
        expect(mimeTypeB).not.toBe(mimeTypeA);
      });
    });
  });

  describe('properties', () => {
    it('should have correct properties', () => {
      const mimeType = new MIMEType('text/plain; encoding=utf-8');

      expect(mimeType.type).toBe('text');
      expect(mimeType.subtype).toBe('plain');
      expect(mimeType.typeAndSubtype).toBe('text/plain');
      expect(mimeType.parameters.get('encoding')).toBe('utf-8');
    });

    it('should have settable properties', () => {
      const mimeType = new MIMEType('text/plain');

      mimeType.type = 'application';
      mimeType.subtype = 'json';

      expect(mimeType.type).toBe('application');
      expect(mimeType.subtype).toBe('json');
      expect(mimeType.typeAndSubtype).toBe('application/json');
      expect(mimeType.toString()).toBe('application/json');

      mimeType.typeAndSubtype = 'text/plain';
      expect(mimeType.typeAndSubtype).toBe('text/plain');
      expect(mimeType.toString()).toBe('text/plain');
    });

    it('should throw if set properties are invalid', () => {
      const mimeType = new MIMEType('text/plain');

      expect(() => (mimeType.type = '')).toThrow();
      expect(() => (mimeType.type = '@application')).toThrow();
      expect(() => (mimeType.subtype = '')).toThrow();
      expect(() => (mimeType.subtype = '@json')).toThrow();
    });
  });

  describe('methods', () => {
    describe('.toString(...)', () => {
      it('returns expected output', () => {
        expect(new MIMEType('text/plain').toString()).toBe('text/plain');
        expect(new MIMEType('text/plain; encoding=utf-8').toString()).toBe(
          'text/plain; encoding=utf-8',
        );
      });
    });
  });

  describe('immutability', () => {
    it('should throw when updating an immutable MIMEType', () => {
      const mimeType = new MIMEType('text/plain').makeImmutable();

      expect(mimeType.immutable).toBe(true);
      expect(() => (mimeType.subtype = 'html')).toThrow();

      expect(mimeType.parameters.immutable).toBe(true);
    });
  });
});
