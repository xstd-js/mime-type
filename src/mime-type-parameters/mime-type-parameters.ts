/* TYPES */

export type MIMETypeParameterTuple = readonly [key: string, value: string];

export type MIMETypeParametersInit =
  | Iterable<MIMETypeParameterTuple>
  | Record<string, string>
  | string;

export interface MIMETypeParametersFromOptions {
  readonly mode?: 'replace' | 'append'; // (default: 'replace')
}

export interface MIMETypeParametersToStringOptions {
  readonly includeLeadingSeparator?: boolean; // (default: true)
}

/* CLASS */

/**
 * Represents a list of parameters of a MIME type.
 */
export class MIMETypeParameters {
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

  readonly #parameters: MIMETypeParameterTuple[];

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
    this.#parameters = [];

    if (init !== undefined) {
      this.#from(init, { mode: 'append' });
    }
  }

  /**
   * Replaces or appends parameters to this object.
   */
  #from(
    init: MIMETypeParametersInit,
    { mode = 'replace' }: MIMETypeParametersFromOptions = {},
  ): void {
    if (mode === 'replace') {
      this.clear();
    }

    if (typeof init === 'string') {
      if (init !== '') {
        if (!init.startsWith(';')) {
          init = ';' + init;
        }

        let match: RegExpExecArray | null;
        MIMETypeParameterRegExp.lastIndex = 0;
        let index: number = 0;
        while ((match = MIMETypeParameterRegExp.exec(init)) !== null) {
          index = match.index + match[0].length;

          if (match[3] === void 0) {
            // mode quoted-string
            this.#append(match[1], match[2].replaceAll('\\', ''));
          } else {
            this.#append(match[1], match[3]);
          }
        }

        if (index !== init.length) {
          throw new Error(
            `Parameters ${JSON.stringify(`${init.slice(index, index + 30)}${index + 30 < init.length ? '...' : ''}`)} are not valid.`,
          );
        }
      }
    } else {
      if (typeof init === 'object' && init !== null) {
        if (Symbol.iterator in init) {
          const iterator: Iterator<MIMETypeParameterTuple> = init[Symbol.iterator]();
          let result: IteratorResult<MIMETypeParameterTuple>;
          while (!(result = iterator.next()).done) {
            this.append(result.value[0], result.value[1]);
          }
        } else {
          Object.entries(init).forEach(([key, value]: MIMETypeParameterTuple): void => {
            this.append(key, value);
          });
        }
      } else {
        throw new TypeError('Invalid input type.');
      }
    }
  }

  /**
   * Returns the number of parameters.
   */
  get size(): number {
    return this.#parameters.length;
  }

  /**
   * Appends a specified key/value pair as a new parameter.
   */
  append(key: string, value: string): void {
    this.#append(
      checkAndNormalizeMIMETypeParameterKey(key),
      checkAndNormalizeMIMETypeParameterValue(value),
    );
  }

  #append(key: string, value: string): void {
    this.#parameters.push(Object.freeze([key, value]));
  }

  /**
   * Deletes specified parameters and their associated value(s) from the list of all parameters.
   */
  delete(key: string, value?: string): void {
    this.#delete(
      checkAndNormalizeMIMETypeParameterKey(key),
      checkAndNormalizeMIMETypeParameterValue(value),
    );
  }

  #delete(key: string, value?: string): void {
    for (let i: number = 0; i < this.#parameters.length; i++) {
      const [_key, _value]: MIMETypeParameterTuple = this.#parameters[i];

      if (_key === key && (value === undefined || _value == value)) {
        this.#parameters.splice(i, 1);
        i--;
      }
    }
  }

  /**
   * Returns the first value associated to the given parameter.
   */
  get(key: string): string | null {
    return this.#get(checkAndNormalizeMIMETypeParameterKey(key));
  }

  #get(key: string): string | null {
    for (let i: number = 0; i < this.#parameters.length; i++) {
      if (this.#parameters[i][0] === key) {
        return this.#parameters[i][1];
      }
    }

    return null;
  }

  /**
   * Returns all the values associated with a given parameter as an array.
   */
  getAll(key: string): string[] {
    return this.#getAll(checkAndNormalizeMIMETypeParameterKey(key));
  }

  #getAll(key: string): string[] {
    const values: string[] = [];

    for (let i: number = 0; i < this.#parameters.length; i++) {
      if (this.#parameters[i][0] === key) {
        values.push(this.#parameters[i][1]);
      }
    }

    return values;
  }

  /**
   * Returns a boolean value that indicates whether the specified parameter is in the parameters.
   */
  has(key: string, value?: string): boolean {
    return this.#has(
      checkAndNormalizeMIMETypeParameterKey(key),
      checkAndNormalizeMIMETypeParameterValue(value),
    );
  }

  #has(key: string, value?: string): boolean {
    for (let i: number = 0; i < this.#parameters.length; i++) {
      const [_key, _value]: MIMETypeParameterTuple = this.#parameters[i];

      if (_key === key && (value === undefined || _value == value)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Sets the value associated with a given parameter to the given value.
   * If there were several matching values, this method deletes the others.
   * If the parameter doesn't exist, this method creates it.
   */
  set(key: string, value: string): void {
    this.#set(
      checkAndNormalizeMIMETypeParameterKey(key),
      checkAndNormalizeMIMETypeParameterValue(value),
    );
  }

  #set(key: string, value: string): void {
    this.#delete(key);
    this.#append(key, value);
  }

  /**
   * Removes all the parameters.
   */
  clear(): void {
    this.#parameters.length = 0;
  }

  /**
   * Sorts all key/value pairs contained in this object in place.
   * The sort order is according to unicode code points of the keys.
   * This method uses a stable sorting algorithm (i.e. the relative order between key/value pairs with equal keys will be preserved).
   */
  sort(): void {
    this.#parameters.sort(
      ([keyA]: MIMETypeParameterTuple, [keyB]: MIMETypeParameterTuple): number => {
        if (keyA < keyB) {
          return -1;
        } else if (keyA > keyB) {
          return 1;
        } else {
          return 0;
        }
      },
    );
  }

  /**
   * Returns an `Iterator` allowing iteration through all keys contained in this object.
   * The keys are strings.
   */
  *keys(): Generator<string> {
    for (let i: number = 0; i < this.#parameters.length; i++) {
      yield this.#parameters[i][0];
    }
  }

  /**
   * Returns an `Iterator` allowing iteration through all values contained in this object.
   */
  *values(): Generator<string> {
    for (let i: number = 0; i < this.#parameters.length; i++) {
      yield this.#parameters[i][1];
    }
  }

  /**
   * Returns an `Iterator` allowing iteration through all key/value pairs contained in this object.
   * The iterator returns key/value pairs in the same order as they appear in the parameters string.
   * The key and value of each pair are strings.
   */
  *entries(): Generator<MIMETypeParameterTuple> {
    for (let i: number = 0; i < this.#parameters.length; i++) {
      yield this.#parameters[i];
    }
  }

  /**
   * Alias of `.entries()`.
   *
   * @see MIMETypeParameters.entries
   */
  [Symbol.iterator](): IterableIterator<MIMETypeParameterTuple> {
    return this.entries();
  }

  /**
   * Allows iteration through all values contained in this object via a callback function.
   */
  forEach(callback: (value: string, key: string, parameters: MIMETypeParameters) => void): void {
    for (let i: number = 0; i < this.#parameters.length; i++) {
      callback(this.#parameters[i][0], this.#parameters[i][1], this);
    }
  }

  /**
   * Returns a MIME type parameters string suitable for use in a MIME type.
   */
  toString({ includeLeadingSeparator = false }: MIMETypeParametersToStringOptions = {}): string {
    let output: string = '';

    const iterator: Iterator<MIMETypeParameterTuple> = this.entries();
    let result: IteratorResult<MIMETypeParameterTuple>;
    while (!(result = iterator.next()).done) {
      const [key, value]: MIMETypeParameterTuple = result.value;

      if (output !== '' || includeLeadingSeparator) {
        output += '; ';
      }

      const _value: string =
        value === '' || MIMETypeParameterValueRequiringQuotingRegExp.test(value)
          ? `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
          : value;

      output += `${key}=${_value}`;
    }

    return output;
  }
}

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

function checkMIMETypeParameterKey(key: string): void {
  if (!MIMETypeParameterKeyRegExp.test(key)) {
    throw new Error(`Invalid parameter key`);
  }
}

function checkAndNormalizeMIMETypeParameterKey(key: string): string {
  checkMIMETypeParameterKey(key);
  return key.toLowerCase();
}

function checkMIMETypeParameterValue(value: string): void {
  if (!MIMETypeParameterValueRegExp.test(value)) {
    throw new Error(`Invalid parameter key`);
  }
}

function checkAndNormalizeMIMETypeParameterValue<GValue extends string | undefined>(
  value: GValue,
): GValue {
  if (value !== undefined) {
    checkMIMETypeParameterValue(value);
  }
  return value;
}
