import { WithImmutability } from '@xstd/with-immutability';
import { MIMETypeParameters } from '../mime-type-parameters/mime-type-parameters.ts';

/* TYPES */

export type MIMETypeSource = string | MIMEType;

/* CLASS */

/**
 * Represents a MIME type.
 */
export class MIMEType extends WithImmutability {
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

  /**
   * If `input` is a `MIMEType`, returns it, else returns a new `MIMEType` instance based on `input`.
   */
  static of(input: MIMETypeSource): MIMEType {
    return input instanceof MIMEType ? input : new MIMEType(input);
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
    super();

    this.#type = '';
    this.#subtype = '';

    let typeAndSubtype: string, parameters: string;

    const indexOfParameters: number = input.indexOf(';');

    if (indexOfParameters === -1) {
      typeAndSubtype = input;
      parameters = '';
    } else {
      typeAndSubtype = input.slice(0, indexOfParameters);
      parameters = input.slice(indexOfParameters);
    }

    this.typeAndSubtype = typeAndSubtype;

    this.#parameters = new MIMETypeParameters(parameters);
  }

  /* PROPERTIES */

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
    this.throwIfImmutable();
    validateMIMETypeType(input);
    this.#type = input;
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
    this.throwIfImmutable();
    validateMIMETypeSubtype(input);
    this.#subtype = input;
  }

  /**
   * Returns the type and subtype of this MIMEType.
   */
  get typeAndSubtype(): string {
    return `${this.#type}/${this.#subtype}`;
  }

  /**
   * Sets the type and subtype of this MIMEType.
   *
   * Throws if the `input` is not a valid MIMEType.
   */
  set typeAndSubtype(input: string) {
    this.throwIfImmutable();

    const index: number = input.indexOf('/');

    if (index === -1) {
      throw new Error('Invalid MimeType: missing subtype.');
    }

    const type: string = input.slice(0, index);
    validateMIMETypeType(type);

    const subtype: string = input.slice(index + 1);
    validateMIMETypeSubtype(subtype);

    this.#type = type;
    this.#subtype = subtype;
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
  override toString(): string {
    return `${this.#type}/${this.#subtype}${this.#parameters.toString({ includeLeadingSeparator: true })}`;
  }
}

/* CONSTANTS */

const TOKEN_PATTERN = "[0-9a-zA-Z\\!\\#\\$\\%\\&'\\*\\+\\-\\.\\^_\\`\\|\\~]";

const MIMETypeTypeRegExp = new RegExp(`^${TOKEN_PATTERN}+$`);
const MIMETypeSubtypeRegExp = new RegExp(`^${TOKEN_PATTERN}+$`);

function validateMIMETypeType(type: string): void {
  if (!MIMETypeTypeRegExp.test(type)) {
    throw new Error(`Invalid type: ${type}`);
  }
}

function validateMIMETypeSubtype(subtype: string): void {
  if (!MIMETypeSubtypeRegExp.test(subtype)) {
    throw new Error(`Invalid subtype: ${subtype}`);
  }
}
