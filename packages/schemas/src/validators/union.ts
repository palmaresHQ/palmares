import type Schema from '../schema/schema';
import type { ValidationFallbackReturnType } from '../schema/types';

export function unionValidation(schemas: readonly Schema<any, any>[]): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value, path, options) => {
      let parsedValues: Awaited<ReturnType<Schema['__parse']>> = {
        parsed: value,
        errors: undefined,
      };
      for (const schema of schemas) {
        const schemaWithProtected = schema as Schema & {
          __parse: Schema['__parse'];
          __toInternal: Schema['__toInternal'];
        };
        const parsedData = await schemaWithProtected.__parse(value, path, options);
        const hasNoErrors = parsedData.errors === undefined || Array.isArray(parsedData.errors);
        parsedValues.parsed = parsedData.parsed;
        if (Array.isArray(parsedData.errors))
          if (Array.isArray(parsedValues.errors)) parsedValues.errors.push(...parsedData.errors);
          else parsedValues.errors = parsedData.errors;

        if (hasNoErrors) {
          if (options.modifyItself) options.modifyItself(schema);
          break;
        }
      }
      console.log('aqui', options);
      return {
        parsed: parsedValues.parsed,
        errors: parsedValues.errors ? parsedValues.errors : [],
      };
    },
  };
}
