import {
  FieldAdapter,
  SchemaAdapter,
  UnionAdapterToStringArgs,
  UnionAdapterTranslateArgs,
  UnionFieldAdapter,
} from '@palmares/schemas';
import * as z from 'zod';

export default class ZodUnionFieldSchemaAdapter extends UnionFieldAdapter {
  translate(
    fieldAdapter: UnionFieldAdapter,
    args: UnionAdapterTranslateArgs<readonly [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>
  ) {
    let result = z.union(args.schemas);
    return result;
  }

  async parse(_adapter: any, _fieldAdapter:FieldAdapter, result: z.ZodOptional<any>, value: any) {
    try {
      const parsed = await result.parseAsync(value);
      return { errors: null, parsed };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: value };
      else throw error;
    }
  }

  async toString(_adapter: SchemaAdapter, _fieldAdapter: FieldAdapter, args: UnionAdapterToStringArgs) {
    const schemas = args.schemas.map((schema) => schema.toString()).join(', ');
    return `z.union([${schemas}])`;
  }
}
