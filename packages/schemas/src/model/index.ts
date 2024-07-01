import ObjectSchema from "../schema/object"

import {
  Model,
  AutoField,
  Field,
  DecimalField,
  BigAutoField,
  IntegerField,
  BooleanField,
  CharField,
  TextField,
  DateField,
  UuidField,
  EnumField,
  ForeignKeyField,
  TranslatableField,
  type InternalModelClass_DoNotUse,
  type ModelBaseClass,
  type ModelFields,
} from "@palmares/databases";

import { DefinitionsOfSchemaType, ExtractTypeFromObjectOfSchemas } from "../schema/types";
import Schema from "../schema/schema";
import { string } from "../schema/string";
import { number } from "../schema";
import { boolean } from "../schema/boolean";
import { datetime } from "../schema/datetime";
import { union } from "../schema/union";
import { TranslatableFieldNotImplementedError } from "../exceptions";

async function getSchemaFromModelField(
  model: ReturnType<typeof Model>,
  field: Field<any, any, any, any, any, any, any, any>,
  engineInstanceName?: string
) {
  let schema: Schema<any, any> | undefined = undefined;
  if (field instanceof AutoField || field instanceof BigAutoField)
    schema = number().integer().optional();
  else if (field instanceof DecimalField)
    schema = number()
      .decimalPlaces(field.decimalPlaces)
      .maxDigits(field.maxDigits);
  else if (field instanceof IntegerField)
    schema = number().integer();
  else if (field instanceof BooleanField)
    schema = boolean()
  else if (field instanceof TextField || field instanceof CharField || field instanceof UuidField) {
    schema = string()
    if (field.allowBlank === false) schema = (schema as ReturnType<typeof string>).minLength(1);
    if (field instanceof CharField && typeof field.maxLength === 'number')
      schema = (schema as ReturnType<typeof string>).maxLength(field.maxLength);
    if (field instanceof UuidField) {
      schema = (schema as ReturnType<typeof string>).uuid();
      if (field.autoGenerate) schema = (schema as ReturnType<typeof string>).optional();
    }
  } else if (field instanceof DateField) {
    schema = datetime().allowString();
    if (field.autoNow || field.autoNowAdd) schema = (schema as ReturnType<typeof datetime>).optional();
  } else if (field instanceof EnumField) {
    const allChoicesOfTypeStrings = field.choices.filter((choice: any) => typeof choice === 'string');
    const allChoicesOfTypeNumbers = field.choices.filter((choice: any) => typeof choice === 'number');

    let schemaForChoicesAsStrings: Schema<any, any>  | undefined = undefined;
    let schemaForChoicesAsNumbers: Schema<any, any> | undefined = undefined;
    if (allChoicesOfTypeStrings) schemaForChoicesAsStrings = string().is([...allChoicesOfTypeStrings]);
    if (allChoicesOfTypeNumbers) schemaForChoicesAsNumbers = number().is([...allChoicesOfTypeNumbers]);
    if (schemaForChoicesAsStrings && schemaForChoicesAsNumbers)
      schema = union([schemaForChoicesAsStrings, schemaForChoicesAsNumbers]);
    else if (schemaForChoicesAsStrings) schema = schemaForChoicesAsStrings;
    else if (schemaForChoicesAsNumbers) schema = schemaForChoicesAsNumbers;
  } else if (field instanceof ForeignKeyField) {
    const relatedToModel = field.relatedTo;
    const toField = field.toField;
    const engineInstance = await model.default.getEngineInstance(engineInstanceName);
    const relatedToModelInstance = engineInstance.__modelsOfEngine[relatedToModel];
    const modelFieldsOfRelatedModel = (relatedToModelInstance as unknown as ModelBaseClass).fields[toField];
    return getSchemaFromModelField(relatedToModelInstance, modelFieldsOfRelatedModel, engineInstanceName);
  } else if (field instanceof TranslatableField && field.customAttributes.schema) {
    if (field.customAttributes.schema instanceof Schema ===  false)
      throw new TranslatableFieldNotImplementedError(field.fieldName)
    schema = field.customAttributes.schema;
  }

  if (field.allowNull && schema) schema = schema.nullable().optional();
  if (field.defaultValue && schema) schema = schema.default(field.defaultValue);

  return schema || string();
}


export function modelObject<
  TModel extends ReturnType<typeof Model>,
  const TOmit extends readonly (keyof ModelFields<InstanceType<TModel>>)[] | undefined[] = undefined[],
  const TShow extends readonly (keyof ModelFields<InstanceType<TModel>>)[] | undefined[] = undefined[],
  TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> | undefined = undefined,
  TAllModelFields = ModelFields<InstanceType<TModel>>,
>(model: TModel, options?: {
  engineInstance?: string;
  fields?: TFields;
  omit?: TOmit;
  show?: TShow;
}) {
  const lazyModelSchema = ObjectSchema.new({} as any) as ObjectSchema<any, any, any> & {
    __runBeforeParseAndData: Required<Schema<any, any>['__runBeforeParseAndData']>;
  }
  // Add this callback to transform the model fields
  lazyModelSchema.__runBeforeParseAndData = async (self: ObjectSchema<any, any, any> & {
    __data: ObjectSchema<any, any, any>['__data'];
    __alreadyAppliedModel: boolean;
  }) => {
    if (self.__alreadyAppliedModel) return;
    self.__alreadyAppliedModel = true;
    const omitAsSet = new Set(options?.omit || []);
    const showAsSet = new Set(options?.show || []);
    const fieldsAsObject = options?.fields || {};
    const fieldsOfModels = (model as unknown as typeof InternalModelClass_DoNotUse)._fields();
    const fieldsAsEntries = Object.entries(fieldsOfModels);

    const fields = fieldsAsEntries.reduce(async (accumulatorAsPromise, [key, value]) => {
      const accumulator = await accumulatorAsPromise;
      if (omitAsSet.has(key as any)) return accumulator;
      if (showAsSet.size > 0 && !showAsSet.has(key as any)) return accumulator;

      let schema = (fieldsAsObject as any)[key as any];
      if (!schema) schema = await getSchemaFromModelField(model, value, options?.engineInstance);

      accumulator[key] = schema;
      return accumulator;
    }, Promise.resolve({} as Record<any, Schema<any, any>>));

    self.__data = fields as any;
  }

  type FieldsOnModel =
    TOmit extends undefined[]
      ? TShow extends undefined[]
        ? TAllModelFields
        : Pick<
            TAllModelFields,
            TShow[number] extends keyof TAllModelFields ? TShow[number] : never
          >
      : Omit<
          TAllModelFields,
          TOmit[number] extends keyof TAllModelFields ? TOmit[number] : never
        >
  return lazyModelSchema as unknown as ObjectSchema<{
    input: TFields extends undefined ? FieldsOnModel :
      Omit<
        FieldsOnModel,
        keyof ExtractTypeFromObjectOfSchemas<
          TFields extends undefined ? {} : TFields,
          'input'
        >
      > &
      ExtractTypeFromObjectOfSchemas<
        TFields extends undefined ? {} : TFields,
        'input'
      >
    output: TFields extends undefined ? FieldsOnModel :
      (Omit<
        FieldsOnModel,
        keyof ExtractTypeFromObjectOfSchemas<
          TFields extends undefined ? {} : TFields,
          'output'
        >
      > &
      ExtractTypeFromObjectOfSchemas<
        TFields extends undefined ? {} : TFields,
        'output'
      >);
    internal: TFields extends undefined ? FieldsOnModel :
      (Omit<
        FieldsOnModel,
        keyof ExtractTypeFromObjectOfSchemas<
          TFields extends undefined ? {} : TFields,
          'internal'
        >
      > &
      ExtractTypeFromObjectOfSchemas<
        TFields extends undefined ? {} : TFields,
        'internal'
      >);
    representation: TFields extends undefined ? FieldsOnModel :
      (Omit<
        FieldsOnModel,
        keyof ExtractTypeFromObjectOfSchemas<
          TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
          'representation'
        >
      > &
      ExtractTypeFromObjectOfSchemas<
        TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
        'representation'
      >);
    validate: TFields extends undefined ? FieldsOnModel :
      Omit<
        FieldsOnModel,
        keyof ExtractTypeFromObjectOfSchemas<
          TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
          'validate'
        >
      > &
      ExtractTypeFromObjectOfSchemas<
        TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> ? TFields : {},
        'validate'
      >;
  }, DefinitionsOfSchemaType, Record<any, any>>;
}






/*
class User extends Model<User>() {
  fields = {
    id: auto(),
    name: choice({ choices: ['a', 'b', 'c'] }),
    email: text(),
  }
}




const userSchema = modelObject(User, {
  show: ['id', 'email']
})

const main = async () => {
  const data = await userSchema.data({
    email: 'test',
    id: 1,
  });
}*/
