import type Request from '.';
import type { MethodTypes } from '../router/types';

type Whitespace = '\n' | ' ';
type Trim<T> = T extends `${Whitespace}${infer U}` ? Trim<U> : T extends `${infer U}${Whitespace}` ? Trim<U> : T;

type GetTypeByStringType<TString extends string, TFinalType = never> = TString extends `(${infer TUnionOrMergedTypes})`
  ? TUnionOrMergedTypes extends `${infer TType}|${infer TRest}`
    ? GetTypeByStringType<`(${TRest})`, TFinalType | GetTypeByStringType<TType>>
    : GetTypeByStringType<TUnionOrMergedTypes, TFinalType>
  : Trim<TString> extends 'number'
    ? TFinalType | number
    : Trim<TString> extends 'string'
      ? TFinalType | string
      : Trim<TString> extends 'boolean'
        ? TFinalType | boolean
        : TString;

// This is to see if the string is optional or not.
type GetLastCharacterOfString<TString extends string> = TString extends `${string}${infer End}`
  ? End extends ``
    ? TString
    : GetLastCharacterOfString<End>
  : TString;

type GetTypeByStringForQueryParamsType<TString extends string> = TString extends
  | `${infer TType}[]?`
  | `${infer TType}[]`
  ? GetLastCharacterOfString<TString> extends '?'
    ? GetTypeByStringType<TType>[] | undefined
    : GetTypeByStringType<TType>[]
  : TString extends `${infer TType}?` | `${infer TType}`
    ? GetLastCharacterOfString<TString> extends '?'
      ? GetTypeByStringType<TType> | undefined
      : GetTypeByStringType<TType>
    : never;

type ExtractStringWithoutSpacesType<TString extends string> = TString extends ` ${infer TRest}`
  ? ExtractStringWithoutSpacesType<`${TRest}`>
  : TString extends `${infer TRest} `
    ? ExtractStringWithoutSpacesType<`${TRest}`>
    : TString;

export type ExtractQueryParamsFromPathType<T extends string> = T extends `${string}?${infer TQueryParams}`
  ? ExtractUrlQueryParamsFromPathTypeRequiredAndOptional<TQueryParams>
  : never;

/**
 * Used for extracting all the url parameters as an object from a path string.
 */
export type ExtractUrlParamsFromPathType<TPath extends string> = TPath extends
  | `${string}<${infer TParam}:${infer TType}>${infer TRest}`
  | `${string}<${infer TParam}:${infer TType}>`
  ? {
      [key in TParam]: GetTypeByStringType<
        ExtractStringWithoutSpacesType<
          TType extends `${string}{${string}}:${infer TTypeOfRegex}` ? TTypeOfRegex : TType
        >
      >;
    } & ExtractUrlParamsFromPathType<TRest>
  : object;

export type ExtractUrlQueryParamsFromPathType<TPath extends string> =
  TPath extends `${infer TParam}=${infer TType}&${infer TRest}`
    ? {
        [key in TParam]: GetTypeByStringForQueryParamsType<
          ExtractStringWithoutSpacesType<
            TType extends `${string}{${string}}:${infer TTypeOfRegex}` ? TTypeOfRegex : TType
          >
        >;
      } & ExtractUrlQueryParamsFromPathType<TRest>
    : TPath extends `${infer TParam}=${infer TType}`
      ? {
          [key in TParam]: GetTypeByStringForQueryParamsType<
            ExtractStringWithoutSpacesType<
              TType extends `${string}{${string}}:${infer TTypeOfRegex}` ? TTypeOfRegex : TType
            >
          >;
        }
      : undefined;

/**
 * Some query parameters are obligatory and some are optional, we use this to convert
 * values with "undefined" in them to optional
 *
 * {
 *   key?: value
 * }
 */
export type ExtractUrlQueryParamsFromPathTypeRequiredAndOptional<TPath extends string> = {
  // eslint-disable-next-line max-len
  [key in keyof ExtractUrlQueryParamsFromPathType<TPath> as undefined extends ExtractUrlQueryParamsFromPathType<TPath>[key]
    ? never
    : key]: ExtractUrlQueryParamsFromPathType<TPath>[key];
} & {
  // eslint-disable-next-line max-len
  [key in keyof ExtractUrlQueryParamsFromPathType<TPath> as undefined extends ExtractUrlQueryParamsFromPathType<TPath>[key]
    ? key
    : never]?: ExtractUrlQueryParamsFromPathType<TPath>[key];
};

export type DefaultRequestType = Request<
  string,
  {
    method: RequestMethodTypes;
    headers: unknown;
    body: unknown;
    context: unknown;
    mode: RequestMode;
    cache: RequestCache;
    credentials: RequestCredentials;
    integrity: string;
    destination: RequestDestination;
    referrer: string;
    referrerPolicy: ReferrerPolicy;
    redirect: RequestRedirect;
  }
>;

export type FormDataLike<TObject = unknown> = {
  new (
    /**
     * This should be prefered, what it does is that instead of creating a default form data like class
     * it'll return a proxy, this way all values are lazy loaded. Just when needed.
     */
    proxyCallback?: {
      /**
       * This function will be called when a value is needed. It should return an array of object for the given key.
       *
       * If the key is a File or Blob, fileName should be defined. Otherwise just return on value. A File
       * object is prefered over a Blob object, because it can hold more information about the file.
       *
       * @example
       * ```ts
       * const formData = new FormDataLike({
       *   getValue: (name) => {
       *      if (name === 'file') return [{ value: new File([''], 'file.txt'), fileName: 'file.txt' }];
       *      else return [{ value: 'value' }];
       *   },
       * });
       * formData.get('file'); // File { name: 'file.txt' }
       * ```
       *
       * @param name - The name of the key to get the value from.
       */
      getValue: (name: string) => {
        value: string | Blob;
        fileName?: string;
      }[];
      /**
       * This function will be called for returning all keys of the form data in order to transform it to a json object.
       *
       * @example
       * ```ts
       * const formData = new FormDataLike({
       *   getValue: (name) => {
       *     if (name === 'file') return [{ value: new File([''], 'file.txt'), fileName: 'file.txt' }];
       *     else return [{ value: 'value' }];
       *   },
       *   getKeys: () => ['file', 'key'],
       * });
       *
       * formData.toJSON(); // { file: File { name: 'file.txt' }, key: 'value' }
       * ```
       *
       * @returns - An array of all keys of the form data.
       */
      getKeys: () => string[];
    }
  ): {
    append: (name: keyof TObject, value: string | Blob | File, fileName?: string) => void;
    get: <TName extends keyof TObject>(
      name: TName
    ) => TName extends keyof TObject
      ? TObject[TName] extends (infer TType)[]
        ? TType
        : TObject[TName]
      : string | Blob | File;
    getAll: <TName extends keyof TObject>(
      name: TName
    ) => TName extends keyof TObject
      ? TObject[TName] extends any[]
        ? TObject[TName]
        : TObject[TName][]
      : string | Blob | File;
    has: (name: keyof TObject) => boolean;
    set: <TName extends keyof TObject>(
      name: keyof TObject,
      value: TName extends keyof TObject
        ? TObject[TName] extends (infer TType)[]
          ? TType
          : TObject[TName]
        : string | Blob | File,
      fileName?: string
    ) => void;
    delete: (name: keyof TObject) => void;
    toJSON: () => TObject;
  };
};

export type RequestMethodTypes = Uppercase<MethodTypes | 'connect' | 'trace'>;
export type RequestCache = 'default' | 'force-cache' | 'no-cache' | 'no-store' | 'only-if-cached' | 'reload';
export type RequestCredentials = 'include' | 'omit' | 'same-origin';
export type RequestDestination =
  | ''
  | 'audio'
  | 'audioworklet'
  | 'document'
  | 'embed'
  | 'font'
  | 'image'
  | 'manifest'
  | 'object'
  | 'paintworklet'
  | 'report'
  | 'script'
  | 'sharedworker'
  | 'style'
  | 'track'
  | 'video'
  | 'worker'
  | 'xslt';
export type RequestMode = 'cors' | 'navigate' | 'no-cors' | 'same-origin';
export type RequestRedirect = 'error' | 'follow' | 'manual';
