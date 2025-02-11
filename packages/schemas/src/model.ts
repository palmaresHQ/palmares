import { number } from './schema';
import { ArraySchema } from './schema/array';
import { boolean } from './schema/boolean';
import { datetime } from './schema/datetime';
import { ObjectSchema } from './schema/object';
import { string } from './schema/string';
import { union } from './schema/union';

import type { DatetimeSchema } from './schema/datetime';
import type { NumberSchema } from './schema/number';
import type { Schema } from './schema/schema';
import type { StringSchema } from './schema/string';
import type { DefinitionsOfSchemaType, ExtractTypeFromObjectOfSchemas } from './schema/types';
import type { UnionSchema } from './schema/union';
import type {
  CharField,
  DateField,
  DecimalField,
  EnumField,
  Field,
  ForeignKeyField,
  InferModel,
  InternalModelClass_DoNotUse,
  Model,
  ModelFields,
  TextField,
  UuidField
} from '@palmares/databases';

async function getSchemaFromModelField(
  model: ReturnType<typeof Model>,
  field: Field<any, any, any>,
  parent: Schema<any, any> | undefined,
  definedFields: Record<any, Schema<any, DefinitionsOfSchemaType>> | undefined,
  engineInstanceName?: string,
  options?: {
    // This will use the Field's typename to convert it to a schema.
    fieldParsersByType?: Record<string, (field: Field<any, any, any>) => Schema<any, any>>;
    foreignKeyRelation?: {
      schema?: Schema<any, any>;
      isArray: boolean;
      model: ReturnType<typeof Model>;
      fieldToSearchOnModel: string;
      fieldToGetFromData: string;
      relationOrRelatedName: string;
    };
  }
) {
  const fieldAsAny = field as any;
  let schema:
    | Schema<any, any>
    | NumberSchema<any, any>
    | StringSchema<any, any>
    | DatetimeSchema<any, any>
    | UnionSchema<any, any, any>
    | undefined = undefined;
  if (options?.fieldParsersByType?.[field['__typeName']]) {
    schema = options.fieldParsersByType[field['__typeName']](field);
  } else if (fieldAsAny?.['$$type'] === '$PAutoField' || fieldAsAny?.['$$type'] === '$PBigAutoField')
    schema = number().integer().optional();
  else if (fieldAsAny?.['$$type'] === '$PDecimalField')
    schema = number()
      .decimalPlaces((field as DecimalField)['__decimalPlaces'])
      .maxDigits((field as DecimalField)['__maxDigits']);
  else if (fieldAsAny?.['$$type'] === '$PIntegerField') schema = number().integer();
  else if (fieldAsAny?.['$$type'] === '$PBooleanField') schema = boolean();
  else if (
    fieldAsAny?.['$$type'] === '$PTextField' ||
    fieldAsAny?.['$$type'] === '$PCharField' ||
    fieldAsAny?.['$$type'] === '$PUuidField'
  ) {
    schema = string();
    if (((field as TextField)['__allowBlank'] as boolean) === false)
      schema = (schema as unknown as ReturnType<typeof string>).minLength(1);
    if (fieldAsAny?.['$$type'] === '$PCharField' && typeof (field as CharField)['__maxLength'] === 'number')
      schema = (schema as ReturnType<typeof string>).maxLength((field as CharField)['__maxLength']);
    if (fieldAsAny?.['$$type'] === '$PUuidField') {
      schema = (schema as ReturnType<typeof string>).uuid();
      // eslint-disable-next-line ts/no-unnecessary-condition
      if ((field as UuidField)['auto']) schema = (schema as ReturnType<typeof string>).optional();
    }
  } else if (fieldAsAny?.['$$type'] === '$PDateField') {
    schema = datetime().allowString();
    // eslint-disable-next-line ts/no-unnecessary-condition
    if ((field as DateField)['__autoNow'] || (field as DateField)['__autoNowAdd'])
      schema = (schema as ReturnType<typeof datetime>).optional();
  } else if (fieldAsAny?.['$$type'] === '$PEnumField') {
    const allChoicesOfTypeStrings = (field as EnumField<any>)['__choices'].filter(
      (choice: any) => typeof choice === 'string'
    );
    const allChoicesOfTypeNumbers = (field as EnumField<any>)['__choices'].filter(
      (choice: any) => typeof choice === 'number'
    );

    let schemaForChoicesAsStrings: Schema<any, any> | undefined = undefined;
    let schemaForChoicesAsNumbers: Schema<any, any> | undefined = undefined;
    if (allChoicesOfTypeStrings.length > 0) schemaForChoicesAsStrings = string().is([...allChoicesOfTypeStrings]);
    if (allChoicesOfTypeNumbers.length > 0)
      schemaForChoicesAsNumbers = number().is([...(allChoicesOfTypeNumbers as unknown as number[])]);
    if (schemaForChoicesAsStrings && schemaForChoicesAsNumbers)
      schema = union([schemaForChoicesAsStrings, schemaForChoicesAsNumbers]);
    else if (schemaForChoicesAsStrings) schema = schemaForChoicesAsStrings;
    else if (schemaForChoicesAsNumbers) schema = schemaForChoicesAsNumbers;
  } else if (fieldAsAny?.['$$type'] === '$PForeignKeyField') {
    const fieldAsForeignKey = field as ForeignKeyField;
    const doesADefinedFieldExistWithRelatedName =
      parent && fieldAsForeignKey['__relatedName'] && (parent as any).__data?.[fieldAsForeignKey['__relatedName']];
    const doesADefinedFieldExistWithRelationName =
      definedFields && fieldAsForeignKey['__relationName'] && definedFields[fieldAsForeignKey['__relationName']];
    const fieldWithRelatedName = doesADefinedFieldExistWithRelatedName
      ? (parent as any).__data?.[fieldAsForeignKey['__relatedName']]
      : undefined;
    const fieldWithRelationName = doesADefinedFieldExistWithRelationName
      ? definedFields[fieldAsForeignKey['__relationName']]
      : undefined;
    const isFieldWithRelatedNameAModelField =
      fieldWithRelatedName?.['$$type'] === '$PSchema' && fieldWithRelatedName.__model !== undefined;
    const isFieldWithRelationNameAModelField =
      fieldWithRelationName?.['$$type'] === '$PSchema' && (fieldWithRelationName as any).__model !== undefined;
    const relatedToModel = fieldAsForeignKey['__relatedTo'];
    const toField = fieldAsForeignKey['__toField'];
    if (Object.keys((model as any)['__initialized']).length > 0) {
      const engineInstance = await model.default.getEngineInstance(engineInstanceName);
      const relatedToModelInstance = engineInstance.__modelsOfEngine[relatedToModel];
      const modelFieldsOfRelatedModel = (relatedToModelInstance as any).__cachedFields[toField];
      if (isFieldWithRelatedNameAModelField) {
        if (typeof options !== 'object') options = {};
        options.foreignKeyRelation = {
          schema: parent,
          isArray: fieldWithRelatedName['$$type'] === '$PArraySchema',
          model: fieldWithRelatedName.__model,
          fieldToSearchOnModel: fieldAsForeignKey['__fieldName'],
          fieldToGetFromData: fieldAsForeignKey['__toField'],
          relationOrRelatedName: fieldAsForeignKey['__relatedName']
        };
      } else if (isFieldWithRelationNameAModelField) {
        if (typeof options !== 'object') options = {};
        options.foreignKeyRelation = {
          isArray: fieldWithRelationName['$$type'] === '$PArraySchema',
          model: (fieldWithRelationName as any).__model,
          fieldToSearchOnModel: fieldAsForeignKey['__toField'],
          fieldToGetFromData: field['__fieldName'],
          relationOrRelatedName: fieldAsForeignKey['__relationName']
        };
      }

      return getSchemaFromModelField(
        relatedToModelInstance,
        modelFieldsOfRelatedModel,
        parent,
        definedFields,
        engineInstanceName,
        options
      );
    }
  }

  if (field['__allowNull'] && schema) schema = schema.nullable().optional();
  if (field['__defaultValue'] && schema) schema = schema.default(field['__defaultValue']);

  return schema || string();
}

/**
 * Different from other schemas, this function is a factory function that returns either an ObjectSchema or an
 * ArraySchema. The idea is to build the schema of a model dynamically based on its fields.
 *
 * Another feature is that it can automatically add the foreign key relation to the schema, but for that you need to
 * define the fields of the related model in the fields object.
 *
 * For example: A User model have a field `companyId` that is a ForeignKeyField to the Company model. The `relationName`
 * is the direct relation from the User model to the Company model, and the `relatedName` is the reverse relation from
 * the Company model to the User model. If you define the fieldName as either the relatedName or the relationName it
 * will fetch the data automatically.
 *
 * **Important**: We build the schema dynamically but also lazily, if you don't try to parse or validate the schema, it
 * won't be built. After the first time it's built, it's cached and never built again.
 *
 * **Important 2**: If you want to use the automatic relation feature, you need to define guarantee that the foreignKey
 * field fieldName exists on `show` array, or that it doesn't exist on `omit` array.
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
 *   show: ['type', 'companyId'], // 'companyId' is required for the automatic relation to work, otherwise it won't show
 *   omitRelation: ['company']
 * });
 *
 * const companySchema = p.modelSchema(Company, {
 *   fields: {
 *      usersOfCompany: p.modelSchema(User, { many: true }).optional({ outputOnly: true });
 *   },
 *   // The `companyId` field on the 'User' model is tied to the `id` field on the 'Company' model so 'id' is required.
 *   show: ['id', 'type'] * });
 *```
 * @param model - The model that you want to build the schema from.
 * @param options - The options to build the schema.
 * @param options.ignoreExtraneousFields - If you want to ignore extraneous fields set this to true.
 * @param options.engineInstance - What engine instance you want to use to fetch the data. Defaults to the first one.
 * @param options.omitRelation - Fields that you want to omit from the relation. For example, on the example above, on
 * the `userSchema` you can omit the `companyId` field from the relation by just passing `['company']`, on the
 * `companySchema`  you can omit the `id` field from company by passing `['usersOfCompany']`.
 *
 * @param options.fields - Extra fields that you want to add to the schema. If it has the same name as the model field,
 * We will not create a schema for that field and use the one you have defined here.
 * @param options.omit - Fields that you want to omit from the schema. If that is defined, we ignore `show` option.
 * @param options.show - Fields that you want to show on the schema. If that is defined, we ignore `omit` option.
 * @param options.many - If you want to return an array instead of an object, set this to true. With that we create
 * an ArraySchema instead of an ObjectSchema.
 *
 * @returns - If you pass the `many` option as true, we return an ArraySchema, otherwise we return an ObjectSchema.
 */
export function modelSchema<
  TModel extends ReturnType<typeof Model>,
  const TOmit extends readonly (keyof ModelFields<InstanceType<TModel>>)[] | undefined[] = undefined[],
  const TShow extends readonly (keyof ModelFields<InstanceType<TModel>>)[] | undefined[] = undefined[],
  TMany extends boolean = false,
  TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> | undefined = undefined,
  TAllModelFieldsRead = InferModel<InstanceType<TModel>, 'read'>,
  TAllModelFieldsCreate = InferModel<InstanceType<TModel>, 'create'>,
  TDefinitionsOfSchemaType extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
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
          keyof ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
            TFields extends undefined ? {} : TFields,
            'input'
          >
        > &
          ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
            TFields extends undefined ? {} : TFields,
            'input'
          >;
    output: TFields extends undefined
      ? TFieldsOnModelRead
      : Omit<
          TFieldsOnModelRead,
          keyof ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
            TFields extends undefined ? {} : TFields,
            'output'
          >
        > &
          ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
            TFields extends undefined ? {} : TFields,
            'output'
          >;
    internal: TFields extends undefined
      ? TFieldsOnModelCreateOrUpdate
      : Omit<
          TFieldsOnModelCreateOrUpdate,
          keyof ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
            TFields extends undefined ? {} : TFields,
            'internal'
          >
        > &
          ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
            TFields extends undefined ? {} : TFields,
            'internal'
          >;
    representation: TFields extends undefined
      ? TFieldsOnModelRead
      : Omit<
          TFieldsOnModelRead,
          keyof ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
            TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
            'representation'
          >
        > &
          ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
            TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
            'representation'
          >;
    validate: TFields extends undefined
      ? TFieldsOnModelCreateOrUpdate
      : Omit<
          TFieldsOnModelCreateOrUpdate,
          keyof ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
            TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
            'validate'
          >
        > &
          ExtractTypeFromObjectOfSchemas<
            // eslint-disable-next-line ts/ban-types
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
    omitRelation?: readonly (keyof TFields)[];
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
      TDefinitionsOfSchemaType,
      [
        ObjectSchema<
          {
            input: TReturnType['input'];
            output: TReturnType['output'];
            internal: TReturnType['internal'];
            representation: TReturnType['representation'];
            validate: TReturnType['validate'];
          },
          TDefinitionsOfSchemaType,
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
      TDefinitionsOfSchemaType,
      Record<any, any>
    > {
  const lazyModelSchema = ObjectSchema.new({} as any) as ObjectSchema<any, any, any> & {
    __runBeforeParseAndData: NonNullable<Schema<any, any>['__runBeforeParseAndData']>;
  };
  const parentSchema = options?.many === true ? ArraySchema.new([lazyModelSchema as any]) : (lazyModelSchema as any);
  const omitRelationAsSet = new Set(options?.omitRelation || []);
  const omitAsSet = new Set(options?.omit || []);
  const showAsSet = new Set(options?.show || []);
  const fieldsAsObject = options?.fields || {};
  const customFieldValues = Object.values(fieldsAsObject);

  // We need to add it to the instance to be able to access it on the `toRepresentation` callback
  (lazyModelSchema as any).__omitRelation = omitRelationAsSet;
  parentSchema.__model = model;
  (lazyModelSchema as any).__model = model;

  // Add this callback to transform the model fields
  parentSchema.__runBeforeParseAndData = async () => {
    const promise = new Promise((resolve) => {
      const fieldsOfModels = (model as unknown as typeof InternalModelClass_DoNotUse)['_fields']();
      const fieldsAsEntries = Object.entries(fieldsOfModels);
      const fieldsWithAutomaticRelations = new Map<
        Schema<any, any>,
        {
          relationOrRelatedName: string;
          isArray: boolean;
          model: ReturnType<typeof Model>;
          fieldToSearchOnModel: string;
          fieldToGetFromData: string;
        }[]
      >();

      const fields = fieldsAsObject as Record<any, Schema<any, any>>;
      Promise.all(
        fieldsAsEntries.map(async ([key, value]) => {
          if (omitAsSet.has(key as any)) return;
          if (showAsSet.size > 0 && !showAsSet.has(key as any)) return;

          let schema = (fieldsAsObject as any)[key as any];
          const optionsForForeignKeyRelation: any = {};
          if (!schema || (value as any)?.['$$type'] === '$PForeignKeyField') {
            const newSchema = await getSchemaFromModelField(
              model,
              value,
              parentSchema?.__getParent?.(),
              options?.fields,
              options?.engineInstance,
              optionsForForeignKeyRelation
            );
            if (!schema) schema = newSchema;
          }

          // Appends the foreign key relation to the schema automatically.
          if (optionsForForeignKeyRelation.foreignKeyRelation) {
            const rootSchema = optionsForForeignKeyRelation?.foreignKeyRelation?.schema || lazyModelSchema;
            const existingRelations =
              fieldsWithAutomaticRelations.get(rootSchema) ||
              ([] as {
                relationOrRelatedName: string;
                isArray: boolean;
                model: ReturnType<typeof Model>;
                fieldToSearchOnModel: string;
                fieldToGetFromData: string;
              }[]);
            existingRelations.push({
              relationOrRelatedName: optionsForForeignKeyRelation.foreignKeyRelation.relationOrRelatedName,
              isArray: optionsForForeignKeyRelation.foreignKeyRelation.isArray,
              model: optionsForForeignKeyRelation.foreignKeyRelation.model,
              fieldToSearchOnModel: optionsForForeignKeyRelation.foreignKeyRelation.fieldToSearchOnModel,
              fieldToGetFromData: optionsForForeignKeyRelation.foreignKeyRelation.fieldToGetFromData
            });
            fieldsWithAutomaticRelations.set(rootSchema, existingRelations);
          }

          (fieldsAsObject as any)[key] = schema;
          return fieldsAsObject;
        })
      ).then(async () => {
        if (fieldsWithAutomaticRelations.size > 0) {
          // This way we can get all of the relations concurrently with Promise.all
          for (const [schema, relations] of fieldsWithAutomaticRelations.entries()) {
            schema.toRepresentation(
              async (data: any | any[]) => {
                const allData = Array.isArray(data) ? data : [data];
                // since we are changing the data by reference, just return the data itself.
                await Promise.all(
                  allData.map(async (data) =>
                    Promise.all(
                      relations.map(async (relation) => {
                        // Ignore if the data of the relation already exists
                        if (relation.relationOrRelatedName in data) return;

                        let relationData: any | any[] = await relation.model.default.get((qs) =>
                          qs.where({
                            [relation.fieldToSearchOnModel]: data[relation.fieldToGetFromData]
                          })
                        );
                        if (relation.isArray !== true) relationData = relationData[0];
                        data[relation.relationOrRelatedName] = relationData;

                        if ((schema as any).__omitRelation.has(relation.relationOrRelatedName as any))
                          delete data[relation.fieldToGetFromData];
                      })
                    )
                  )
                );

                return data;
              },
              {
                after: true
              }
            );
          }
        }

        (lazyModelSchema as any).__data = fields as any;

        await Promise.all(
          customFieldValues.map(async (schema: any) => {
            schema['__getParent'] = () => lazyModelSchema;
            if (schema['__runBeforeParseAndData']) await schema['__runBeforeParseAndData'](schema);
          })
        );
        resolve(undefined);
      });
    });
    if (parentSchema.__alreadyAppliedModel) return parentSchema.__alreadyAppliedModel;
    parentSchema.__alreadyAppliedModel = promise;
    return promise;
  };

  if (options?.ignoreExtraneousFields !== true) lazyModelSchema.removeExtraneous();

  return parentSchema;
}
