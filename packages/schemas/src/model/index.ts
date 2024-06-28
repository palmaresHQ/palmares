import ObjectSchema from "../schema/object"

import { Model, auto, char, text, define, type ModelFields, choice, AllFieldsOfModel,
  InternalModelClass_DoNotUse,
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
  ForeignKeyField
} from "@palmares/databases";
import { DefinitionsOfSchemaType, ExtractTypeFromObjectOfSchemas } from "../schema/types";
import Schema from "../schema/schema";
import { string } from "../schema/string";
import { number } from "../schema";
import { boolean } from "../schema/boolean";

function getSchemaFromModelField(field: Field<any, any, any, any, any, any, any, any>) {
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

  if (field.allowNull && schema) schema = schema.nullable().optional();
  if (field.defaultValue && schema) schema = schema.default(field.defaultValue);

  return schema || string();
}


export function modelObject<
  TModel extends ReturnType<typeof Model>,
  const TOmit extends readonly (keyof ModelFields<InstanceType<TModel>>)[],
  const TShow extends readonly (keyof ModelFields<InstanceType<TModel>>)[],
  TFields extends Record<any, Schema<any, DefinitionsOfSchemaType>> | undefined = undefined,
  TAllModelFields = ModelFields<InstanceType<TModel>>,
>(model: TModel, options?: {
  fields?: TFields;
  omit?: TOmit;
  show?: TShow;
}) {
  const lazyModelSchema = ObjectSchema.new({} as any) as ObjectSchema<any, any, any> & {
    __runBeforeParseAndData: Required<Schema<any, any>['__runBeforeParseAndData']>;
  }
  lazyModelSchema.__runBeforeParseAndData = async (self: any) => {
    if (self.__alreadyAppliedModel) return;
    self.__alreadyAppliedModel = true;
    const omitAsSet = new Set(options?.omit || []);
    const showAsSet = new Set(options?.show || []);
    const fieldsAsObject = options?.fields || {};
    const fieldsOfModels = (model as unknown as typeof InternalModelClass_DoNotUse)._fields();
    const fieldsAsEntries = Object.entries(fieldsOfModels);

    const fields = fieldsAsEntries.reduce((accumulator, [key, value]) => {
      if (omitAsSet.has(key as any)) return accumulator;
      if (showAsSet.size > 0 && !showAsSet.has(key as any)) return accumulator;

      let schema = (fieldsAsObject as any)[key as any];
      if (!schema) schema = getSchemaFromModelField(value);

      return accumulator;
    }, {} as Record<any, Schema<any, any>>);
  }

  type FieldsOnModel =
    TOmit extends never
      ? TShow extends never
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

class User extends Model<User>() {
  fields = {
    id: auto(),
    name: choice({ choices: ['a', 'b', 'c'] }),
    email: text()
  }
}
const userSchema = modelObject(User, {
  omit: ['id']
})

const main = async () => {
  const data = await userSchema.data({
    email: 'test',
    name: 'a'
  });

  data
}
