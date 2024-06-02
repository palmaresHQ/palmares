import { StringFieldAdapter, FieldAdapter, StringAdapterTranslateArgs } from '@palmares/schemas';

import * as z from 'zod';

export default class ZodStringFieldSchemaAdapter extends StringFieldAdapter<z.ZodNumber> {
  async translate(fieldAdapter: FieldAdapter<any>, args: StringAdapterTranslateArgs) {
    const result = z.string();
    return result;
  }
}
