import type ArraySchema from '../schema/array';
import type Schema from '../schema/schema';
import type { ValidationFallbackCallbackReturnType, ValidationFallbackReturnType } from '../schema/types';

export function arrayValidation(isTuple: boolean, schemas: Schema<any, any>[]): ValidationFallbackReturnType {
  return {
    type: 'medium',
    callback: async (value: any, path: (string | number)[], options: Parameters<Schema['__transformToAdapter']>[0]) => {
      const isNotAnArray = Array.isArray(value) === false;
      if (isNotAnArray)
        return {
          parsed: value,
          preventChildValidation: true,
          errors: [
            {
              isValid: false,
              code: 'array',
              // eslint-disable-next-line ts/no-unnecessary-condition
              path: path || [],
              message: 'The value must be an array. Received: ' + typeof value
            }
          ]
        };
      if (isTuple && value.length !== schemas.length)
        return {
          parsed: value,
          preventChildValidation: true,
          errors: [
            {
              isValid: false,
              code: 'tuple',
              // eslint-disable-next-line ts/no-unnecessary-condition
              path: path || [],
              message: 'The tuple must have exactly ' + schemas.length + ' elements. Received: ' + value.length
            }
          ]
        };

      const errorsOfArray: ValidationFallbackCallbackReturnType['errors'] = [];

      // To speed things up, we can do a simple type check, if the value is of type number and
      // number is on index 1, and on index 0 is a string,
      // if the value is a number we can skip checking at index 0.
      const schemaIndexByTypeof = new Map<string, number>();
      let parsedValues: any[] = [];
      parsedValues = await Promise.all(
        value.map(async (element, index) => {
          let errorsToAppendAfterLoopIfNoSchemaMatched: ValidationFallbackCallbackReturnType['errors'] = [];
          const typeofElement = typeof element;
          const schemaIndex = schemaIndexByTypeof.get(typeofElement);
          const existsASchemaIndex = typeof schemaIndex === 'number';

          const schemasToValidateAgainst = isTuple
            ? [schemas[index]]
            : existsASchemaIndex
              ? [schemas[schemaIndex]]
              : schemas;

          for (let indexOfSchema = 0; indexOfSchema < schemasToValidateAgainst.length; indexOfSchema++) {
            const schemaToValidate = schemasToValidateAgainst[indexOfSchema];
            const schemaWithProtected = schemaToValidate as Schema & {
              __parse: Schema['__parse'];
              __toInternal: Schema['__toInternal'];
            };
            const { parsed, errors } = await schemaWithProtected.__parse(element, [...path, index], options);

            if (schemaWithProtected.__toInternal && options.toInternalToBubbleUp)
              options.toInternalToBubbleUp.push(
                async () => (parsedValues[indexOfSchema] = await schemaWithProtected.__toInternal?.(parsed))
              );

            // eslint-disable-next-line ts/no-unnecessary-condition
            if ((errors || []).length <= 0) {
              errorsToAppendAfterLoopIfNoSchemaMatched = [];
              schemaIndexByTypeof.set(typeofElement, indexOfSchema);
              return parsed;
            }
            errorsToAppendAfterLoopIfNoSchemaMatched.push(...errors);
          }

          errorsOfArray.push(...errorsToAppendAfterLoopIfNoSchemaMatched);
          return element;
        })
      );

      return {
        parsed: parsedValues,
        errors: errorsOfArray
      };
    }
  };
}

export function minLength(args: ArraySchema['__minLength']): ValidationFallbackReturnType {
  return {
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = args.inclusive ? value.length >= args.value : value.length > args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'minLength',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function maxLength(args: ArraySchema['__maxLength']): ValidationFallbackReturnType {
  return {
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = args.inclusive ? value.length <= args.value : value.length < args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'maxLength',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function nonEmpty(args: ArraySchema['__nonEmpty']): ValidationFallbackReturnType {
  return {
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = value.length > 0;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'nonEmpty',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}
