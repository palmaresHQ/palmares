import {
  Model,
  ModelFields,
} from "@palmares/databases";

import NumberSchema, { number } from './schema/number';
import ObjectSchema, { object } from './schema/object';
import UnionSchema, { union } from './schema/union';
import StringSchema, { string } from './schema/string';
import ArraySchema, { array } from './schema/array';
import BooleanSchema, { boolean } from './schema/boolean';
import DatetimeSchema, { datetime } from './schema/datetime';
import Schema, { schema } from './schema/schema';
import SchemaAdapter from './adapter';

export { default as default } from './domain';
export { default as FieldAdapter } from './adapter/fields';
export { default as NumberAdapter } from './adapter/fields/number';
export { default as ObjectFieldAdapter } from './adapter/fields/object';
export { default as UnionFieldAdapter } from './adapter/fields/union';
export { default as StringFieldAdapter } from './adapter/fields/string';
export { default as ArrayFieldAdapter } from './adapter/fields/array';
export { default as BooleanFieldAdapter } from './adapter/fields/boolean';
export { default as DatetimeFieldAdapter } from './adapter/fields/datetime';

export { setDefaultAdapter } from './conf';
export * from './adapter/types';
export * from './schema';
export {
  SchemaAdapter,
  NumberSchema,
  ObjectSchema,
  UnionSchema,
  StringSchema,
  ArraySchema,
  BooleanSchema,
  DatetimeSchema,
  Schema,
};
export { schema, number, object, union, string, array, datetime, boolean };
export { default as compile } from './compile';

import type { Narrow } from '@palmares/core';
import { modelSchema } from './model';
import { DefinitionsOfSchemaType, ExtractTypeFromObjectOfSchemas } from "./schema/types";

export { modelSchema };

export function getSchemasWithDefaultAdapter<TAdapter extends SchemaAdapter>() {
  return {
    number: () => NumberSchema.new<{ schemaAdapter: TAdapter; schemaType: 'number'; hasSave: false }>(),
    string: () => StringSchema.new<{ schemaAdapter: TAdapter; schemaType: 'string'; hasSave: false }>(),
    array: <TSchemas extends readonly [Schema, ...Schema[]] | [Array<Schema>]>(...schemas: TSchemas) =>
      array<TSchemas, { schemaAdapter: TAdapter; schemaType: 'array'; hasSave: false }>(...schemas),
    boolean: () => BooleanSchema.new<{ schemaAdapter: TAdapter; schemaType: 'boolean'; hasSave: false }>(),
    object: <TData extends Record<any, Schema<any, any>>>(data: TData) =>
      ObjectSchema.new<TData, { schemaAdapter: TAdapter; schemaType: 'object'; hasSave: false }>(data),
    union: <TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]]>(
      ...schemas: Narrow<TSchemas>
    ) => UnionSchema.new<TSchemas, { schemaAdapter: TAdapter; schemaType: 'union'; hasSave: false }>(schemas),
    datetime: () => DatetimeSchema.new<{ schemaAdapter: TAdapter; schemaType: 'datetime'; hasSave: false }>(),
    /**
     * Different from other models, this function is a factory function that returns either an ObjectSchema or an ArraySchema.
     * The idea is to build the schema of a model dynamically based on its fields.
     *
     * Another feature is that it can automatically add the foreign key relation to the schema, but for that you need to define
     * the fields of the related model in the fields object.
     *
     * For example: A User model have a field `companyId` that is a ForeignKeyField to the Company model. The `relationName`
     * is the direct relation from the User model to the Company model, and the `relatedName` is the reverse relation from the
     * Company model to the User model. If you define the fieldName as either the relatedName or the relationName it will fetch
     * the data automatically.
     *
     * **Important**: We build the schema dynamically but also lazily, if you don't try to parse or validate the schema, it won't be built.
     * After the first time it's built, it's cached and never built again.
     *
     * **Important 2**: If you want to use the automatic relation feature, you need to define guarantee that the foreignKey field fieldName
     * exists on `show` array, or that it doesn't exist on `omit` array.
     *
     * Like: `{ options: { show: ['id', 'name', 'companyId'] }}` or `{ options: { omit: ['id'] }}` it **will work**.
     *
     * If you do `{ options: { show: ['id', 'name'] }}` or `{ options: { omit: ['companyId']} }` it **won't work**.
     *
     * **Important 3**: If you want to return an array instead of an object, you need to pass the `many` option as true.
     *
     * @example
     * ```typescript
     * import { auto, choice, foreignKey, Model, define } from '@palmares/databases';
     * import * as p from '@palmares/schemas';
     *
     * const Company = define('Company', {
     *   fields: {
     *     id: auto(),
     *     name: text(),
     *   },
     *   options: {
     *     tableName: 'company',
     *   }
     * });
     *
     * class User extends Model<User>() {
     *    fields = {
     *     id: auto(),
     *     type: choice({ choices: ['user', 'admin'] }),
     *     companyId: foreignKey({
     *        relatedTo: Company,
     *        relationName: 'company',
     *        relatedName: 'usersOfCompany',
     *        toField: 'id',
     *        onDelete: 'CASCADE',
     *      }),
     *   }
     *
     *   options = {
     *     tableName: 'user',
     *   }
     * }
     *
     * const userSchema = p.modelSchema(User, {
     *   fields: {
     *      company: p.modelSchema(Company).optional({ outputOnly: true });
     *   },
     *   show: ['type', 'companyId']
     * });
     *
     * const companySchema = p.modelSchema(Company, {
     *   fields: {
     *      usersOfCompany: p.modelSchema(User, { many: true }).optional({ outputOnly: true });
     *   },
     *   show: ['id', 'type']
     * });
     *```
    * @param model - The model that you want to build the schema from.
    * @param options - The options to build the schema.
    * @param options.ignoreExtraneousFields - If you want to ignore extraneous fields set this to true.
    * @param options.engineInstance - What engine instance you want to use to fetch the data. Defaults to the first one.
    * @param options.fields - Extra fields that you want to add to the schema. If it has the same name as the model field,
    * We will not create a schema for that field and use the one you have defined here.
    * @param options.omit - Fields that you want to omit from the schema. If that is defined, we ignore `show` option.
    * @param options.show - Fields that you want to show on the schema. If that is defined, we ignore `omit` option.
    * @param options.many - If you want to return an array instead of an object, set this to true. With that we create
    * an ArraySchema instead of an ObjectSchema.
    *
    * @returns - If you pass the `many` option as true, we return an ArraySchema, otherwise we return an ObjectSchema.
    */
    modelSchema: <
      TModel extends ReturnType<typeof Model>,
      const TOmit extends readonly (keyof ModelFields<InstanceType<TModel>>)[] | undefined[] = undefined[],
      const TShow extends readonly (keyof ModelFields<InstanceType<TModel>>)[] | undefined[] = undefined[],
      TMany extends boolean = false,
      TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> | undefined = undefined,
      TAllModelFields = ModelFields<InstanceType<TModel>>,
      TFieldsOnModel = TOmit extends undefined[]
        ? TShow extends undefined[]
          ? TAllModelFields
          : Pick<
              TAllModelFields,
              TShow[number] extends keyof TAllModelFields ? TShow[number] : never
            >
        : Omit<
            TAllModelFields,
            TOmit[number] extends keyof TAllModelFields ? TOmit[number] : never
          >,
      TReturnType extends {
        input: any;
        output: any;
        validate: any,
        internal: any;
        representation: any;
      } = {
        input: TFields extends undefined ? TFieldsOnModel :
          Omit<
          TFieldsOnModel,
            keyof ExtractTypeFromObjectOfSchemas<
              TFields extends undefined ? {} : TFields,
              'input'
            >
          > &
          ExtractTypeFromObjectOfSchemas<
            TFields extends undefined ? {} : TFields,
            'input'
          >
        output: TFields extends undefined ? TFieldsOnModel :
          (Omit<
            TFieldsOnModel,
            keyof ExtractTypeFromObjectOfSchemas<
              TFields extends undefined ? {} : TFields,
              'output'
            >
          > &
          ExtractTypeFromObjectOfSchemas<
            TFields extends undefined ? {} : TFields,
            'output'
          >);
        internal: TFields extends undefined ? TFieldsOnModel :
          (Omit<
            TFieldsOnModel,
            keyof ExtractTypeFromObjectOfSchemas<
              TFields extends undefined ? {} : TFields,
              'internal'
            >
          > &
          ExtractTypeFromObjectOfSchemas<
            TFields extends undefined ? {} : TFields,
            'internal'
          >);
        representation: TFields extends undefined ? TFieldsOnModel :
          (Omit<
            TFieldsOnModel,
            keyof ExtractTypeFromObjectOfSchemas<
              TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
              'representation'
            >
          > &
          ExtractTypeFromObjectOfSchemas<
            TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
            'representation'
          >);
        validate: TFields extends undefined ? TFieldsOnModel :
          Omit<
          TFieldsOnModel,
            keyof ExtractTypeFromObjectOfSchemas<
              TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
              'validate'
            >
          > &
          ExtractTypeFromObjectOfSchemas<
            TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
            'validate'
          >;
      }
    >(
      model: TModel,
      options?: {
      ignoreExtraneousFields?: boolean;
      engineInstance?: string;
      fields?: TFields;
      omit?: TOmit;
      show?: TShow;
      many?: TMany
    }):  TMany extends true ? ArraySchema<{
      input: TReturnType['input'][];
      output: TReturnType['output'][];
      internal: TReturnType['internal'][];
      representation: TReturnType['representation'][];
      validate: TReturnType['validate'][];
    }, {
      schemaAdapter: TAdapter;
      schemaType: 'object';
      hasSave: false
    }, [
      Array<
        ObjectSchema<{
          input: TReturnType['input'];
          output: TReturnType['output'];
          internal: TReturnType['internal'];
          representation: TReturnType['representation'];
          validate: TReturnType['validate'];
        }, {
          schemaAdapter: TAdapter;
          schemaType: 'object';
          hasSave: false
        }, Record<any, any>>
      >
      ]> : ObjectSchema<{
      input: TReturnType['input'];
      output: TReturnType['output'];
      internal: TReturnType['internal'];
      representation: TReturnType['representation'];
      validate: TReturnType['validate'];
    }, {
      schemaAdapter: TAdapter;
      schemaType: 'object';
      hasSave: false
    }, Record<any, any>> => modelSchema<
      TModel,
      TOmit,
      TShow,
      TMany,
      TFields,
      TAllModelFields,
      {
        schemaAdapter: TAdapter;
        schemaType: 'object';
        hasSave: false
      },
      TFieldsOnModel,
      TReturnType
    >(model, options)
  };
}
/*
const prisma = {
  user: {
    create: (data: { email: string; password: string }) => {
      return { id: '1', ...data };
    },
  },
};
function express() {
  return {
    post(path: string, callback: (req: any, res: any) => void) {
      callback();
    },
  };
}

const userSchema = object({
  id: string().nullable().optional(),
  email: string(),
  password: string(),
})
  .onSave(async (data) => {
    const user = prisma.user.create({ email: data.email, password: data.password });
    return user;
  })
  .toRepresentation(async (createdUser) => {
    return { id: createdUser.id as string, email: createdUser.email };
  });

const app = express();

app.post('/login', async (req, res) => {
  const validatedResult = await userSchema.validate(req.body);

  if (validatedResult.isValid) {
    const user = await validatedResult.save();
    res.json(user);
    return;
  }

  res.json(validatedResult.errors);
});
*/
