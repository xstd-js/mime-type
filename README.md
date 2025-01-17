[![npm (scoped)](https://img.shields.io/npm/v/@xstd/mime-type.svg)](https://www.npmjs.com/package/@xstd/mime-type)
![npm](https://img.shields.io/npm/dm/@xstd/mime-type.svg)
![NPM](https://img.shields.io/npm/l/@xstd/mime-type.svg)
![coverage](https://img.shields.io/npm/types/@xstd/mime-type.svg)
![npm type definitions](https://img.shields.io/badge/coverage-100%25-green)

<picture>
  <source height="64" media="(prefers-color-scheme: dark)" srcset="https://github.com/xstd-js/website/blob/main/assets/logo/png/logo-large-dark.png?raw=true">
  <source height="64" media="(prefers-color-scheme: light)" srcset="https://github.com/xstd-js/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
  <img height="64" alt="Shows a black logo in light color mode and a white one in dark color mode." src="https://github.com/xstd-js/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
</picture>


## @xstd/mime-type

This library provides a `MIMEType` class to manage MIME types, somehow like the [URL class](https://developer.mozilla.org/en-US/docs/Web/API/URL).

**Example:**

```ts
import { MIMEType } from '@xstd/mime-type';

function isUtf8EncodedText(
  file: Blob,
): boolean {
  const mimeType = new MIMEType(file.type);
  return mimeType.type === 'text' && mimeType.parameters.get('encoding') === 'utf-8';
}

console.log(isUtf8EncodedText(new Blob(['abc'], { type: 'text/plain; encoding=utf-8' }))); // logs `true`
```

## 📦 Installation

```shell
yarn add @xstd/mime-type
# or
npm install @xstd/mime-type --save
```

## 📑 Documentation

```ts
/**
 * Represents a MIME type.
 */
declare class MIMEType {
  /**
   * Returns `true` if `input` can be parsed into a valid MIME type.
   */
  static canParse(input: string): boolean;
  
  /**
   * Returns a `MIMEType` if `input` can be parsed a into valid MIME type, else it returns `null`.
   */
  static parse(input: string): MIMEType | null;
  
  /**
   * Constructs a new MIMEType from an input string.
   *
   * Throws if the `input` is not a valid MIME type.
   */
  constructor(input: string);
  
  /**
   * Returns the type of this MIMEType.
   */
  get type(): string;
  
  /**
   * Sets the type of this MIMEType.
   * 
   * Throws if the `input` is not a valid type.
   */
  set type(input: string);
  
  /**
   * Returns the subtype of this MIMEType.
   */
  get subtype(): string;
  
  /**
   * Sets the subtype of this MIMEType.
   * 
   * Throws if the `input` is not a valid subtype.
   */
  set subtype(input: string);
  
  /**
   * Returns the parameters of this MIMEType.
   */
  get parameters(): MIMETypeParameters;
  
  /**
   * Returns a MIME type string.
   */
  toString(): string;
}
```


```ts
/* TYPES */

type MIMETypeParameterTuple = readonly [key: string, value: string];

type MIMETypeParametersInit = Iterable<MIMETypeParameterTuple> | Record<string, string> | string;

interface MIMETypeParametersFromOptions {
    readonly mode?: 'replace' | 'append';
}

interface MIMETypeParametersToStringOptions {
    readonly includeLeadingSeparator?: boolean;
}

/* CLASS */

/**
 * Represents a list of parameters of a MIME type.
 */
declare class MIMETypeParameters {
    /**
     * Returns `true` if `input` can be parsed into valid MIME type parameters.
     */
    static canParse(input: string): boolean;
    
    /**
     * Returns a `MIMETypeParameters` if `input` can be parsed into valid parameters, else it returns `null`.
     */
    static parse(input: string): MIMETypeParameters | null;
    
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
    constructor(init?: MIMETypeParametersInit);
    
    /**
     * Returns the number of parameters.
     */
    get size(): number;
    
    /**
     * Appends a specified key/value pair as a new parameter.
     */
    append(key: string, value: string): void;
    
    /**
     * Deletes specified parameters and their associated value(s) from the list of all parameters.
     */
    delete(key: string, value?: string): void;
    
    /**
     * Returns the first value associated to the given parameter.
     */
    get(key: string): string | null;
    
    /**
     * Returns all the values associated with a given parameter as an array.
     */
    getAll(key: string): string[];
    
    /**
     * Returns a boolean value that indicates whether the specified parameter is in the parameters.
     */
    has(key: string, value?: string): boolean;
    
    /**
     * Sets the value associated with a given parameter to the given value.
     * If there were several matching values, this method deletes the others.
     * If the parameter doesn't exist, this method creates it.
     */
    set(key: string, value: string): void;
    
    /**
     * Removes all the parameters.
     */
    clear(): void;
    
    /**
     * Sorts all key/value pairs contained in this object in place.
     * The sort order is according to unicode code points of the keys.
     * This method uses a stable sorting algorithm (i.e. the relative order between key/value pairs with equal keys will be preserved).
     */
    sort(): void;
    
    /**
     * Returns an `Iterator` allowing iteration through all keys contained in this object.
     * The keys are strings.
     */
    keys(): Generator<string>;
    
    /**
     * Returns an `Iterator` allowing iteration through all values contained in this object.
     */
    values(): Generator<string>;
    
    /**
     * Returns an `Iterator` allowing iteration through all key/value pairs contained in this object.
     * The iterator returns key/value pairs in the same order as they appear in the parameters string.
     * The key and value of each pair are strings.
     */
    entries(): Generator<MIMETypeParameterTuple>;
    
    /**
     * Alias of `.entries()`.
     *
     * @see MIMETypeParameters.entries
     */
    [Symbol.iterator](): IterableIterator<MIMETypeParameterTuple>;
    
    /**
     * Allows iteration through all values contained in this object via a callback function.
     */
    forEach(callback: (value: string, key: string, parameters: MIMETypeParameters) => void): void;
    
    /**
     * Returns a MIME type parameters string suitable for use in a MIME type.
     */
    toString({ includeLeadingSeparator }?: MIMETypeParametersToStringOptions): string;
}
```
