import { mappedListFactory, type MappedListTuple } from '@xstd/mapped-list';

/* CONSTANTS */

const TOKEN_INNER_PATTERN = "0-9a-zA-Z\\!\\#\\$\\%\\&'\\*\\+\\-\\.\\^_\\`\\|\\~";
const TOKEN_PATTERN = `[${TOKEN_INNER_PATTERN}]`;

const MIMETypeParameterKeyRegExp = new RegExp(`^${TOKEN_PATTERN}+$`);
const MIMETypeParameterValueRegExp = new RegExp('^[\\u0009\\u0020-\\u007e]*$');
const MIMETypeParameterValueRequiringQuotingRegExp = new RegExp(`[^${TOKEN_INNER_PATTERN}]`);

const MIMETypeParameterRegExp = new RegExp(
  `;\\s*(${TOKEN_PATTERN}+)=(?:"((?:[^"\\\\]|\\\\"|\\\\[^"])+?)"|(${TOKEN_PATTERN}+))\\s*`,
  'g',
);

/* TYPES */

export type MIMETypeParameterTuple = readonly [key: string, value: string];

export type MIMETypeParametersInit =
  | Iterable<MIMETypeParameterTuple>
  | Record<string, string>
  | string;

export interface MIMETypeParametersToStringOptions {
  readonly includeLeadingSeparator?: boolean; // (default: true)
}

/* CLASS */

/**
 * Represents a list of parameters of a MIME type.
 *
 * @doc: https://datatracker.ietf.org/doc/html/rfc5987#section-3.2
 * @doc: https://datatracker.ietf.org/doc/html/rfc2231#section-7
 */
export class MIMETypeParameters extends mappedListFactory<string>({
  validateKey: (key: string): string => {
    if (!MIMETypeParameterKeyRegExp.test(key)) {
      throw new Error('Invalid parameter key');
    }
    return key.toLowerCase();
  },
  validateValue: (value: string): string => {
    if (!MIMETypeParameterValueRegExp.test(value)) {
      throw new Error('Invalid parameter value');
    }

    return value;
  },
}) {
  /**
   * Returns `true` if `input` can be parsed into valid MIME type parameters.
   */
  static canParse(input: string): boolean {
    return this.parse(input) !== null;
  }

  /**
   * Returns a `MIMETypeParameters` if `input` can be parsed into valid parameters, else it returns `null`.
   */
  static parse(input: string): MIMETypeParameters | null {
    try {
      return new MIMETypeParameters(input);
    } catch {
      return null;
    }
  }

  /**
   * If `input` is a `MIMETypeParameters`, returns it, else returns a new `MIMETypeParameters` instance based on `input`.
   */
  static of(input: MIMETypeParametersInit): MIMETypeParameters {
    return input instanceof MIMETypeParameters ? input : new MIMETypeParameters(input);
  }

  /**
   * Constructs a new MIMETypeParameters from an input string, an Iterable of key/value, or an object of key/value.
   *
   * Throws if the `input` is invalid.
   *
   * > If the `input` is a string, the leading separator `;` bay be omitted.
   *
   * @example
   * ```ts
   * const parameters = new MIMETypeParameters('; encoding=utf-8');
   * ```
   */
  constructor(init?: MIMETypeParametersInit) {
    if (typeof init === 'string') {
      if (init === '') {
        init = [];
      } else {
        if (!init.startsWith(';')) {
          init = ';' + init;
        }

        const parameters: MappedListTuple<string>[] = [];

        let match: RegExpExecArray | null;
        MIMETypeParameterRegExp.lastIndex = 0;
        let index: number = 0;
        while ((match = MIMETypeParameterRegExp.exec(init)) !== null) {
          index = match.index + match[0].length;

          if (match[3] === void 0) {
            // mode quoted-string
            parameters.push([match[1], match[2].replaceAll('\\', '')]);
          } else {
            parameters.push([match[1], match[3]]);
          }
        }

        if (index !== init.length) {
          throw new Error(
            `Parameters ${JSON.stringify(`${init.slice(index, index + 30)}${index + 30 < init.length ? '...' : ''}`)} are not valid.`,
          );
        }

        init = parameters;
      }
    }

    super(init);
  }

  /**
   * Returns a MIME type parameters string suitable for use in a MIME type.
   */
  override toString({
    includeLeadingSeparator = false,
  }: MIMETypeParametersToStringOptions = {}): string {
    let output: string = '';

    for (const [key, value] of this.entries()) {
      if (output !== '' || includeLeadingSeparator) {
        output += '; ';
      }

      const escapedValue: string =
        value === '' || MIMETypeParameterValueRequiringQuotingRegExp.test(value)
          ? `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
          : value;

      output += `${key}=${escapedValue}`;
    }

    return output;
  }
}
