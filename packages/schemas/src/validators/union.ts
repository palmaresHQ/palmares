import type Schema from '../schema/schema';
import type { ValidationFallbackReturnType } from '../schema/types';

export function unionValidation(
  schemas: readonly Schema<any, any>[],
  schemaOptions: Parameters<ValidationFallbackReturnType['callback']>[2]
): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value, path, options) => {
      let parsedValues: Awaited<ReturnType<Schema['__parse']>> = {
        parsed: value,
        errors: undefined,
      };
      const startingToInternalBubbleUpLength = options.toInternalToBubbleUp?.length || 0;

      for (const schema of schemas) {
        const schemaWithProtected = schema as Schema & {
          __parse: Schema['__parse'];
          __toInternal: Schema['__toInternal'];
        };
        const parsedData = await schemaWithProtected.__parse(value, path, options);
        parsedValues.parsed = parsedData.parsed;
        if (Array.isArray(parsedData.errors))
          if (Array.isArray(parsedValues.errors)) parsedValues.errors.push(...parsedData.errors);
          else parsedValues.errors = parsedData.errors;

        const hasNoErrors = parsedData.errors === undefined || (parsedData.errors || []).length === 0;

        if (hasNoErrors) {
          parsedValues.errors = undefined;
          if (options.modifyItself && schemaOptions.modifyItself)
            await Promise.all([
              options.modifyItself(schema, options.validationKey),
              schemaOptions.modifyItself(schema, options.validationKey),
            ]);
          else if (options.modifyItself) await options.modifyItself(schema, options.validationKey);
          else if (schemaOptions.modifyItself) await schemaOptions.modifyItself(schema, options.validationKey);

          break;
        } else if (startingToInternalBubbleUpLength < (options.toInternalToBubbleUp?.length || 0)) {
          // If there is a new toInternalToBubbleUp we should remove the ones that we added since this is not a valid schema,
          // we shouldn't be calling the `toInternal` on that schemas.
          const numberOfElementsToRemove =
            (options.toInternalToBubbleUp?.length || 0) - startingToInternalBubbleUpLength;
          options.toInternalToBubbleUp?.splice(startingToInternalBubbleUpLength, numberOfElementsToRemove);
        }
      }
      return {
        parsed: parsedValues.parsed,
        errors: parsedValues.errors ? parsedValues.errors : [],
      };
    },
  };
}
