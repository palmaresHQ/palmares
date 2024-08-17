import type { objectFieldAdapter } from '@palmares/schemas';
import type * as z from 'zod';

type Params = Parameters<NonNullable<Parameters<typeof objectFieldAdapter>['0']['formatError']>>;

export async function transformErrorsOnComplexTypes(
  adapter: Params[0],
  fieldAdapter: Params[1],
  schema: Params[2],
  error: z.ZodIssue,
  metadata: Params[4]
) {
  let errors = error as any;
  if (metadata.$alreadyValidatedOnComplex !== true) {
    const stringFormattedErrors = await adapter.string?.formatError(adapter, fieldAdapter, schema, error, metadata);
    const numberFormattedErrors = await adapter.number?.formatError(
      adapter,
      fieldAdapter,
      schema,
      stringFormattedErrors,
      metadata
    );
    const datetimeFormattedErrors = await adapter.datetime?.formatError(
      adapter,
      fieldAdapter,
      schema,
      numberFormattedErrors,
      metadata
    );
    errors = await adapter.boolean?.formatError(adapter, fieldAdapter, schema, datetimeFormattedErrors, metadata);

    metadata.$alreadyValidatedOnComplex = true;
    if (metadata.$type.has('union') === false && adapter.union)
      errors = await adapter.union.formatError(adapter, fieldAdapter, schema, errors, metadata);
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (metadata.$type.has('object') === false && adapter.object)
      errors = await adapter.object.formatError(adapter, fieldAdapter, schema, errors, metadata);
    if (metadata.$type.has('array') === false && adapter.array)
      errors = await adapter.array.formatError(adapter, fieldAdapter, schema, errors, metadata);
    return fieldAdapter.formatError(adapter, fieldAdapter, schema, errors, metadata);
  }
  return error as any;
}
