import { PathParamsType } from '../types';

export type PathParamsTypes = 'string' | 'number' | RegExp;

export type RawParamsType = { [paramName: string]: string };

export type PathParamsParser = (rawParams: RawParamsType) => PathParamsType;

export type PathParams = {
  value: string;
  paramName: string;
  paramType: PathParamsTypes;
};

export type HandlersType<REQ = any, RES = unknown> = (
  req: REQ,
  options?: Record<string, unknown>
) => Promise<RES>;
