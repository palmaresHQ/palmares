import { StringFieldAdapter, FieldAdapter, StringAdapterTranslateArgs } from '@palmares/schemas';

import * as z from 'zod';

export default class ZodStringFieldSchemaAdapter extends StringFieldAdapter {
  async translate(fieldAdapter: FieldAdapter, args: StringAdapterTranslateArgs) {
    const result = z.string();
    return result;
  }
}
