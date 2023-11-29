import { ErrorCodes } from '../adapter/types';
import Schema from '../schema/schema';
import {
  ValidationFallbackCallbackReturnType,
  ValidationFallbackCallbackType,
  ValidationFallbackReturnType,
} from '../schema/types';

import type { ValidatorTypes } from './types';

export default class Validator {
  child?: Validator;
  parent?: Validator;
  type: ValidatorTypes;
  fallbacks: ((
    value: any,
    path: (string | number)[],
    options: Parameters<Schema['_transformToAdapter']>[0]
  ) => Promise<{
    parsed: any;
    errors: {
      isValid: boolean;
      code: ErrorCodes;
      message: string;
      path: (string | number)[];
    }[];
    preventChildValidation?: boolean;
  }>)[] = [];

  constructor(type: ValidatorTypes) {
    this.type = type;
  }

  private checkAppendOrCreate(
    schema: Schema,
    type: ValidatorTypes,
    fallback: ValidationFallbackCallbackType,
    childOrParent: 'child' | 'parent',
    options?: Parameters<(typeof Validator)['createAndAppendFallback']>[2]
  ) {
    if (this[childOrParent] && (this as any)[childOrParent].type === type)
      (this as any)[childOrParent].addFallback(type, fallback, options);
    else {
      const validatorInstance = new Validator(type);

      this[childOrParent] = validatorInstance;
      (this as any)[childOrParent][childOrParent === 'parent' ? 'child' : 'parent'] = this;
      (this as any)[childOrParent].addFallback(type, fallback, options);
      if (type === 'high') schema.__rootFallbacksValidator = validatorInstance;
    }
  }

  addFallback(
    schema: Schema,
    type: ValidatorTypes,
    fallback: ValidationFallbackCallbackType,
    options?: Parameters<(typeof Validator)['createAndAppendFallback']>[2]
  ) {
    if (this.type === type) {
      if (typeof options?.at === 'number')
        this.fallbacks.splice(options.at, options.removeCurrent === true ? 1 : 0, fallback);
      else this.fallbacks.push(fallback);
    }
    if (this.type === 'high') this.checkAppendOrCreate(schema, type, fallback, 'child', options);
    if (this.type === 'medium') {
      if (type === 'low') this.checkAppendOrCreate(schema, type, fallback, 'child', options);
      if (type === 'high') this.checkAppendOrCreate(schema, type, fallback, 'parent', options);
    }
    if (this.type === 'low') this.checkAppendOrCreate(schema, type, fallback, 'parent', options);
  }

  async validate(
    errorsAsHashedSet: Set<string>,
    path: ValidationFallbackCallbackReturnType['errors'][number]['path'],
    parseResult: {
      errors: undefined | ValidationFallbackCallbackReturnType['errors'];
      parsed: any;
    },
    options: Parameters<Schema['_transformToAdapter']>[0] = {}
  ): Promise<ValidationFallbackCallbackReturnType> {
    let doesItShouldPreventChildValidation = false;

    for (const fallback of this.fallbacks) {
      const { parsed, errors, preventChildValidation } = await fallback(parseResult.parsed, path, options);
      parseResult.parsed = parsed;

      for (const error of errors) {
        if (error.isValid === false) {
          const hashedError = JSON.stringify(error);
          if (errorsAsHashedSet.has(hashedError)) continue;
          if (!Array.isArray(parseResult.errors)) parseResult.errors = [];
          parseResult.errors.push(error);
        }
      }
      doesItShouldPreventChildValidation = doesItShouldPreventChildValidation || preventChildValidation || false;
    }

    if (this.child && doesItShouldPreventChildValidation === false)
      return this.child.validate(
        errorsAsHashedSet,
        path,
        parseResult,
        options
      ) as Promise<ValidationFallbackCallbackReturnType>;

    return parseResult as unknown as Promise<ValidationFallbackCallbackReturnType>;
  }

  static createAndAppendFallback(
    schema: Schema,
    fallback: ValidationFallbackReturnType,
    options?: {
      at?: number;
      removeCurrent?: boolean;
    }
  ) {
    let validatorInstance = schema.__rootFallbacksValidator;
    if (schema.__rootFallbacksValidator === undefined) validatorInstance = new Validator(fallback.type);
    validatorInstance.addFallback(schema, fallback.type, fallback.callback, options);
    return validatorInstance;
  }
}
