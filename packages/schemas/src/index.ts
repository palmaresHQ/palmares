import { SchemaAdapter } from './adapter';
import { schemasDomain as SchemaDomain } from './domain';
import { modelSchema } from './model';
import { ArraySchema, array } from './schema/array';
import { BooleanSchema, boolean } from './schema/boolean';
import { DatetimeSchema, datetime } from './schema/datetime';
import { NumberSchema, number } from './schema/number';
import { ObjectSchema, object } from './schema/object';
import { Schema, schema } from './schema/schema';
import { StringSchema, string } from './schema/string';
import { UnionSchema, union } from './schema/union';

import type { DefinitionsOfSchemaType, ExtractTypeFromObjectOfSchemas } from './schema/types';
import type { Narrow } from '@palmares/core';
import type { InferModel, Model, ModelFields } from '@palmares/databases';

export { FieldAdapter, fieldAdapter } from './adapter/fields';
export { NumberFieldAdapter, numberFieldAdapter } from './adapter/fields/number';
export { ObjectFieldAdapter, objectFieldAdapter } from './adapter/fields/object';
export { UnionFieldAdapter, unionFieldAdapter } from './adapter/fields/union';
export { StringFieldAdapter, stringFieldAdapter } from './adapter/fields/string';
export { ArrayFieldAdapter, arrayFieldAdapter } from './adapter/fields/array';
export { BooleanFieldAdapter, booleanFieldAdapter } from './adapter/fields/boolean';
export { DatetimeFieldAdapter, datetimeFieldAdapter } from './adapter/fields/datetime';

export type { Infer as infer } from './types';
export { setDefaultAdapter, getDefaultAdapter } from './conf';
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
  Schema
};
export { schema, number, object, union, string, array, datetime, boolean };
export { compile } from './compile';
export { schemaHandler } from './middleware';

export { modelSchema };
export { SchemaDomain };

export default SchemaDomain;

export function getSchemasWithDefaultAdapter<TAdapter extends SchemaAdapter>() {
  return {
    number: () => NumberSchema.new<{ schemaAdapter: TAdapter; schemaType: 'number'; hasSave: false; context: any }>(),
    string: () => StringSchema.new<{ schemaAdapter: TAdapter; schemaType: 'string'; hasSave: false; context: any }>(),
    array: <TSchemas extends readonly [Schema, ...Schema[]] | [[Schema]]>(...schemas: TSchemas) =>
      array<TSchemas, { schemaAdapter: TAdapter; schemaType: 'array'; hasSave: false; context: any }>(...schemas),
    boolean: () =>
      BooleanSchema.new<{ schemaAdapter: TAdapter; schemaType: 'boolean'; hasSave: false; context: any }>(),
    object: <TData extends Record<any, Schema<any, any>>>(data: TData) =>
      ObjectSchema.new<TData, { schemaAdapter: TAdapter; schemaType: 'object'; hasSave: false; context: any }>(data),
    union: <TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]]>(
      ...schemas: Narrow<TSchemas>
    ) =>
      UnionSchema.new<TSchemas, { schemaAdapter: TAdapter; schemaType: 'union'; hasSave: false; context: any }>(
        schemas
      ),
    datetime: () =>
      DatetimeSchema.new<{ schemaAdapter: TAdapter; schemaType: 'datetime'; hasSave: false; context: any }>(),
    /**
     * Different from other models, this function is a factory function that returns either an ObjectSchema or
     * an ArraySchema.
     * The idea is to build the schema of a model dynamically based on its fields.
     *
     * Another feature is that it can automatically add the foreign key relation to the schema,
     * but for that you need to define the fields of the related model in the fields object.
     *
     * For example: A User model have a field `companyId` that is a ForeignKeyField to the Company model.
     * The `relationName` is the direct relation from the User model to the Company model, and the `relatedName`
     * is the reverse relation from the Company model to the User model. If you define the fieldName as either
     * the relatedName or the relationName it will fetch the data automatically.
     *
     * **Important**: We build the schema dynamically but also lazily, if you don't try to parse or validate the
     * schema, it won't be built. After the first time it's built, it's cached and never built again.
     *
     * **Important 2**: If you want to use the automatic relation feature, you need to define guarantee that the
     * foreignKey field fieldName exists on `show` array, or that it doesn't exist on `omit` array.
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
     * @param options.engineInstance - What engine instance you want to use to fetch the data.
     * Defaults to the first one.
     * @param options.fields - Extra fields that you want to add to the schema. If it has the same name as the
     * model field, We will not create a schema for that field and use the one you have defined here.
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
      TAllModelFieldsRead = InferModel<InstanceType<TModel>, 'read'>,
      TAllModelFieldsCreate = InferModel<InstanceType<TModel>, 'create'>,
      TFieldsOnModelRead = TOmit extends undefined[]
        ? TShow extends undefined[]
          ? TAllModelFieldsRead
          : Pick<TAllModelFieldsRead, TShow[number] extends keyof TAllModelFieldsRead ? TShow[number] : never>
        : Omit<TAllModelFieldsRead, TOmit[number] extends keyof TAllModelFieldsRead ? TOmit[number] : never>,
      TFieldsOnModelCreateOrUpdate = TOmit extends undefined[]
        ? TShow extends undefined[]
          ? TAllModelFieldsCreate
          : Pick<TAllModelFieldsCreate, TShow[number] extends keyof TAllModelFieldsCreate ? TShow[number] : never>
        : Omit<TAllModelFieldsCreate, TOmit[number] extends keyof TAllModelFieldsCreate ? TOmit[number] : never>,
      TReturnType extends {
        input: any;
        output: any;
        validate: any;
        internal: any;
        representation: any;
      } = {
        input: TFields extends undefined
          ? TFieldsOnModelCreateOrUpdate
          : Omit<
              TFieldsOnModelCreateOrUpdate,
              keyof ExtractTypeFromObjectOfSchemas<TFields extends undefined ? {} : TFields, 'input'>
            > &
              ExtractTypeFromObjectOfSchemas<TFields extends undefined ? {} : TFields, 'input'>;
        output: TFields extends undefined
          ? TFieldsOnModelRead
          : Omit<
              TFieldsOnModelRead,
              keyof ExtractTypeFromObjectOfSchemas<TFields extends undefined ? {} : TFields, 'output'>
            > &
              ExtractTypeFromObjectOfSchemas<TFields extends undefined ? {} : TFields, 'output'>;
        internal: TFields extends undefined
          ? TFieldsOnModelCreateOrUpdate
          : Omit<
              TFieldsOnModelCreateOrUpdate,
              keyof ExtractTypeFromObjectOfSchemas<TFields extends undefined ? {} : TFields, 'internal'>
            > &
              ExtractTypeFromObjectOfSchemas<TFields extends undefined ? {} : TFields, 'internal'>;
        representation: TFields extends undefined
          ? TFieldsOnModelRead
          : Omit<
              TFieldsOnModelRead,
              keyof ExtractTypeFromObjectOfSchemas<
                TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
                'representation'
              >
            > &
              ExtractTypeFromObjectOfSchemas<
                TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
                'representation'
              >;
        validate: TFields extends undefined
          ? TFieldsOnModelCreateOrUpdate
          : Omit<
              TFieldsOnModelCreateOrUpdate,
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
        omitRelation?: readonly (keyof TFields)[];
        show?: TShow;
        many?: TMany;
      }
    ): TMany extends true
      ? ArraySchema<
          {
            input: TReturnType['input'][];
            output: TReturnType['output'][];
            internal: TReturnType['internal'][];
            representation: TReturnType['representation'][];
            validate: TReturnType['validate'][];
          },
          {
            schemaAdapter: TAdapter;
            schemaType: 'object';
            context: any;
            hasSave: false;
          },
          [
            ObjectSchema<
              {
                input: TReturnType['input'];
                output: TReturnType['output'];
                internal: TReturnType['internal'];
                representation: TReturnType['representation'];
                validate: TReturnType['validate'];
              },
              {
                schemaAdapter: TAdapter;
                schemaType: 'object';
                context: any;
                hasSave: false;
              },
              Record<any, any>
            >
          ]
        >
      : ObjectSchema<
          {
            input: TReturnType['input'];
            output: TReturnType['output'];
            internal: TReturnType['internal'];
            representation: TReturnType['representation'];
            validate: TReturnType['validate'];
          },
          {
            schemaAdapter: TAdapter;
            schemaType: 'object';
            context: any;
            hasSave: false;
          },
          Record<any, any>
        > =>
      modelSchema<
        TModel,
        TOmit,
        TShow,
        TMany,
        TFields,
        TAllModelFieldsRead,
        TAllModelFieldsCreate,
        {
          schemaAdapter: TAdapter;
          context: any;
          schemaType: 'object';
          hasSave: false;
        },
        TFieldsOnModelRead,
        TFieldsOnModelCreateOrUpdate,
        TReturnType
      >(model, options)
  };
}
