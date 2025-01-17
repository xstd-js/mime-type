import { MIMETypeParameters } from '../mime-type-parameters/mime-type-parameters.js';

/* CLASS */

/**
 * Represents a MIME type.
 */
export class MIMEType {
  /**
   * Returns `true` if `input` can be parsed into a valid MIME type.
   */
  static canParse(input: string): boolean {
    return this.parse(input) !== null;
  }

  /**
   * Returns a `MIMEType` if `input` can be parsed a into valid MIME type, else it returns `null`.
   */
  static parse(input: string): MIMEType | null {
    try {
      return new MIMEType(input);
    } catch {
      return null;
    }
  }

  #type: string;
  #subtype: string;
  readonly #parameters: MIMETypeParameters;

  /**
   * Constructs a new MIMEType from an input string.
   *
   * Throws if the `input` is not a valid MIME type.
   *
   * @example
   * ```ts
   * const mimeType = new MIMEType('text/plain; encoding=utf-8');
   * ```
   */
  constructor(input: string) {
    let typeAndSubtype: string, parameters: string;

    const indexOfParameters: number = input.indexOf(';');

    if (indexOfParameters === -1) {
      typeAndSubtype = input;
      parameters = '';
    } else {
      typeAndSubtype = input.slice(0, indexOfParameters);
      parameters = input.slice(indexOfParameters);
    }

    const indexOfSubtype: number = typeAndSubtype.indexOf('/');

    if (indexOfSubtype === -1) {
      throw new Error('Invalid MimeType: missing subtype.');
    }

    this.#type = '';
    this.#subtype = '';

    this.type = typeAndSubtype.slice(0, indexOfSubtype);
    this.subtype = typeAndSubtype.slice(indexOfSubtype + 1);

    this.#parameters = new MIMETypeParameters(parameters);
  }

  /**
   * Returns the type of this MIMEType.
   */
  get type(): string {
    return this.#type;
  }

  /**
   * Sets the type of this MIMEType.
   *
   * Throws if the `input` is not a valid type.
   */
  set type(input: string) {
    if (MIMETypeTypeRegExp.test(input)) {
      this.#type = input;
    } else {
      throw new Error(`Invalid type: ${input}`);
    }
  }

  /**
   * Returns the subtype of this MIMEType.
   */
  get subtype(): string {
    return this.#subtype;
  }

  /**
   * Sets the subtype of this MIMEType.
   *
   * Throws if the `input` is not a valid subtype.
   */
  set subtype(input: string) {
    if (MIMETypeSubtypeRegExp.test(input)) {
      this.#subtype = input;
    } else {
      throw new Error(`Invalid subtype: ${input}`);
    }
  }

  /**
   * Returns the parameters of this MIMEType.
   */
  get parameters(): MIMETypeParameters {
    return this.#parameters;
  }

  /**
   * Returns a MIME type string.
   */
  toString(): string {
    return `${this.#type}/${this.#subtype}${this.#parameters.toString({ includeLeadingSeparator: true })}`;
  }
}

/* CONSTANTS */

const TOKEN_PATTERN = "[0-9a-zA-Z\\!\\#\\$\\%\\&'\\*\\+\\-\\.\\^_\\`\\|\\~]";

const MIMETypeTypeRegExp = new RegExp(`^${TOKEN_PATTERN}+$`);
const MIMETypeSubtypeRegExp = new RegExp(`^${TOKEN_PATTERN}+$`);
