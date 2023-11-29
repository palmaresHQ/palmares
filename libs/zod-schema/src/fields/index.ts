import { AdapterTranslateArgs, FieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

export default class ZodFieldSchemaAdapter extends FieldAdapter {
  translate(_: ZodFieldSchemaAdapter, args: AdapterTranslateArgs, baseResult: z.ZodType) {
    if (args.optional) baseResult = baseResult.optional();
    if (args.nullable) baseResult = baseResult.nullable();
    return baseResult;
  }
}
