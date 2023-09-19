import type Request from '.';

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

export type ExtractUrlQueryParamsFromPathTypeRequiredAndOptional<TPath extends string> = {
  [key in keyof ExtractUrlQueryParamsFromPathType<TPath> as undefined extends ExtractUrlQueryParamsFromPathType<TPath>[key]
    ? never
    : key]: ExtractUrlQueryParamsFromPathType<TPath>[key];
} & {
  [key in keyof ExtractUrlQueryParamsFromPathType<TPath> as undefined extends ExtractUrlQueryParamsFromPathType<TPath>[key]
    ? key
    : never]?: ExtractUrlQueryParamsFromPathType<TPath>[key];
};

export type DefaultRequestType = Request<string, { Body: any; Headers: any; Cookies: any; Context: any }>;

export type FormDataLike<TObject = unknown> = new (proxyCallback?: {
  getValue: (name: string) => {
    value: string | Blob;
    fileName?: string;
  }[];
  getKeys: () => string[];
}) => {
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
