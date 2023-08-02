import type Request from '.';

type GetTypeByStringType<TString extends string> = TString extends 'number'
  ? number
  : string;

// This is to see if the string is optional or not.
type GetLastCharacterOfString<TString extends string> =
  TString extends `${string}${infer End}`
    ? End extends ``
      ? TString
      : GetLastCharacterOfString<End>
    : TString;

// THis is to see if the query string value is an array or not.
type IsArray<TString extends string> = TString extends
  | `${string}[]${string}`
  | `${string}[]`
  ? true
  : false;

type GetTypeByStringForQueryParamsType<TString extends string> =
  GetLastCharacterOfString<TString> extends '?'
    ? IsArray<TString> extends true
      ? GetTypeByStringType<TString>[] | undefined
      : GetTypeByStringType<TString> | undefined
    : IsArray<TString> extends true
    ? GetTypeByStringType<TString>[]
    : GetTypeByStringType<TString>;

type ExtractStringWithoutSpacesType<TString extends string> =
  TString extends ` ${infer TRest}`
    ? ExtractStringWithoutSpacesType<`${TRest}`>
    : TString extends `${infer TRest} `
    ? ExtractStringWithoutSpacesType<`${TRest}`>
    : TString;

export type ExtractQueryParamsFromPathType<T extends string> =
  T extends `${string}?${infer TQueryParams}`
    ? ExtractUrlQueryParamsFromPathTypeRequiredAndOptional<TQueryParams>
    : never;

export type ExtractUrlParamsFromPathType<TPath extends string> =
  TPath extends `${string}<${infer TParam}:${infer TType}>${infer TRest}`
    ? {
        [key in TParam]: GetTypeByStringType<
          ExtractStringWithoutSpacesType<
            TType extends `${string}(${string}):${infer TTypeOfRegex}`
              ? TTypeOfRegex
              : TType
          >
        >;
      } & ExtractUrlParamsFromPathType<TRest>
    : unknown;

export type ExtractUrlQueryParamsFromPathType<TPath extends string> =
  TPath extends `${infer TParam}=${infer TType}&${infer TRest}`
    ? {
        [key in TParam]: GetTypeByStringForQueryParamsType<
          ExtractStringWithoutSpacesType<
            TType extends `${string}(${string}):${infer TTypeOfRegex}`
              ? TTypeOfRegex
              : TType
          >
        >;
      } & ExtractUrlQueryParamsFromPathType<TRest>
    : TPath extends `${infer TParam}=${infer TType}`
    ? {
        [key in TParam]: GetTypeByStringForQueryParamsType<
          ExtractStringWithoutSpacesType<
            TType extends `${string}(${string}):${infer TTypeOfRegex}`
              ? TTypeOfRegex
              : TType
          >
        >;
      }
    : undefined;

export type ExtractUrlQueryParamsFromPathTypeRequiredAndOptional<
  TPath extends string
> = {
  [key in keyof ExtractUrlQueryParamsFromPathType<TPath> as undefined extends ExtractUrlQueryParamsFromPathType<TPath>[key]
    ? never
    : key]: ExtractUrlQueryParamsFromPathType<TPath>[key];
} & {
  [key in keyof ExtractUrlQueryParamsFromPathType<TPath> as undefined extends ExtractUrlQueryParamsFromPathType<TPath>[key]
    ? key
    : never]?: ExtractUrlQueryParamsFromPathType<TPath>[key];
};

export type DefaultRequestType = Request<
  string,
  { Body: any; Headers: any; Cookies: any; Context: any }
>;
