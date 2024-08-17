import type Schema from '../schema/schema';
import type { ValidationFallbackReturnType } from '../schema/types';

export function unionValidation(
  schemas: readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]]
): ValidationFallbackReturnType {
  return {
    name: 'union',
    type: 'medium',
    callback: async (value, path, options) => {
      const parsedValues: Awaited<ReturnType<Schema['__parse']>> = {
        parsed: value,
        errors: []
      };
      const startingToInternalBubbleUpLength = options.toInternalToBubbleUp?.length || 0;

      // eslint-disable-next-line ts/prefer-for-of
      for (let i = 0; i < schemas.length; i++) {
        const schemaWithProtected = schemas[i] as Schema & {
          __parse: Schema['__parse'];
          __toInternal: Schema['__toInternal'];
        };
        const parsedData = await schemaWithProtected.__parse(value, path, options);
        parsedValues.parsed = parsedData.parsed;
        if (Array.isArray(parsedData.errors))
          if (Array.isArray(parsedValues.errors)) parsedValues.errors.push(...parsedData.errors);
          else parsedValues.errors = parsedData.errors;

        const hasNoErrorsSoItsAValidSchemaAndShouldResetOldErrors =
          // eslint-disable-next-line ts/no-unnecessary-condition
          parsedData.errors === undefined || (parsedData.errors || []).length === 0;
        if (hasNoErrorsSoItsAValidSchemaAndShouldResetOldErrors) {
          return {
            parsed: parsedValues.parsed,
            errors: []
          };
        } else if (startingToInternalBubbleUpLength < (options.toInternalToBubbleUp?.length || 0)) {
          // If there is a new toInternalToBubbleUp we should remove the ones that we added since this is not a
          // valid schema, we shouldn't be calling the `toInternal` on that schemas.
          const numberOfElementsToRemove =
            (options.toInternalToBubbleUp?.length || 0) - startingToInternalBubbleUpLength;
          options.toInternalToBubbleUp?.splice(startingToInternalBubbleUpLength, numberOfElementsToRemove);
        }
      }
      return {
        parsed: parsedValues.parsed,
        // eslint-disable-next-line ts/no-unnecessary-condition
        errors: Array.isArray(parsedValues.errors) ? parsedValues.errors : []
      };
    }
  };
}
