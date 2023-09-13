import { BaseRouter, MethodsRouter } from '../router/routers';

export function parseParamsValue(
  value: any,
  type:
    | (BaseRouter['__queryParamsAndPath']['params'] extends Map<any, infer TType> ? TType : any)
    | (BaseRouter['__urlParamsAndPath']['params'] extends Map<any, infer TType> ? TType : any)
) {
  if (type.type.includes('string') && typeof value === 'string') return value;
  else if (type.type.includes('string') && typeof value !== 'string') {
    if (value !== undefined && value !== null) return String(value);
    else return undefined;
  } else if (type.type.includes('number') && typeof value === 'number') return value;
  else if (type.type.includes('number') && typeof value !== 'number') {
    const numberValidatorRegex = /^[\d]+(\.{1})?[\d]+$/g;
    if (value !== undefined && value !== null && numberValidatorRegex.test(value.toString())) return Number(value);
    else return undefined;
  } else if (type.type.includes('boolean') && typeof value === 'boolean') return value;
  else if (type.type.includes('boolean') && typeof value !== 'boolean') return Boolean(value);
  return undefined;
}

export function parseQueryParams(
  value: any,
  type: BaseRouter['__queryParamsAndPath']['params'] extends Map<any, infer TType> ? TType : any
) {
  if (type.isArray && Array.isArray(value)) return value.map((valueToParse) => parseParamsValue(valueToParse, type));
  else return parseParamsValue(value, type);
}
