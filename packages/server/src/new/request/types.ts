import type Request from '.';

type GetTypeByStringType<TString extends string> = TString extends 'number'
  ? number
  : string;

type ExtractStringWithoutSpacesType<TString extends string> =
  TString extends ` ${infer TRest}`
    ? ExtractStringWithoutSpacesType<`${TRest}`>
    : TString extends `${infer TRest} `
    ? ExtractStringWithoutSpacesType<`${TRest}`>
    : TString;

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

export type DefaultRequestType = Request<
  string,
  { Data: any; Headers: any; Cookies: any; Context: any }
>;
