import type { DatabaseAdapter } from '.';
import type { AdapterFields as EngineFields } from './fields';
import type {
  AdapterFieldParser,
  AutoField,
  BigAutoField,
  BigIntegerField,
  BooleanField,
  CharField,
  DateField,
  DecimalField,
  EnumField,
  Field,
  ForeignKeyField,
  IntegerField,
  TextField,
  UuidField,
  adapterFieldParser
} from '..';
import type { BaseModel, model } from '../models';

export type EngineInitializedModels<TModel = unknown> = {
  [key: string]: TModel | undefined;
};

export type EngineType = {
  connectionName: string;
  fields: EngineFields;
};

export type AdapterFieldParserTranslateArgs<
  TFieldType extends
    | 'field'
    | 'auto'
    | 'big-auto'
    | 'big-integer'
    | 'boolean'
    | 'char'
    | 'date'
    | 'decimal'
    | 'enum'
    | 'foreign-key'
    | 'integer'
    | 'text'
    | 'uuid' = 'field',
  TEngine = DatabaseAdapter,
  TFieldParser extends AdapterFieldParser | InstanceType<ReturnType<typeof adapterFieldParser>> = AdapterFieldParser,
  TLazyTranslatedFieldArg = any,
  TCustomAttributes = any
> = {
  /**The engine instance. */
  engine: TEngine;
  /**The {@link Field} instance that you need to translate. */
  field: TFieldType extends 'field'
    ?
        | Omit<ReturnType<Field['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<AutoField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<BigAutoField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<BigIntegerField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<BooleanField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<CharField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<DateField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<DecimalField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<EnumField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<ForeignKeyField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<IntegerField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<TextField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<UuidField['__getArgumentsCallback']>, 'customAttributes'>
    : TFieldType extends 'auto'
      ? Omit<ReturnType<AutoField['__getArgumentsCallback']>, 'customAttributes'>
      : TFieldType extends 'big-auto'
        ? Omit<ReturnType<BigAutoField['__getArgumentsCallback']>, 'customAttributes'>
        : TFieldType extends 'big-integer'
          ? Omit<ReturnType<BigIntegerField['__getArgumentsCallback']>, 'customAttributes'>
          : TFieldType extends 'boolean'
            ? Omit<ReturnType<BooleanField['__getArgumentsCallback']>, 'customAttributes'>
            : TFieldType extends 'char'
              ? Omit<ReturnType<CharField['__getArgumentsCallback']>, 'customAttributes'>
              : TFieldType extends 'date'
                ? Omit<ReturnType<DateField['__getArgumentsCallback']>, 'customAttributes'>
                : TFieldType extends 'decimal'
                  ? Omit<ReturnType<DecimalField['__getArgumentsCallback']>, 'customAttributes'>
                  : TFieldType extends 'enum'
                    ? Omit<ReturnType<EnumField['__getArgumentsCallback']>, 'customAttributes'>
                    : TFieldType extends 'foreign-key'
                      ? Omit<ReturnType<ForeignKeyField['__getArgumentsCallback']>, 'customAttributes'>
                      : TFieldType extends 'integer'
                        ? Omit<ReturnType<IntegerField['__getArgumentsCallback']>, 'customAttributes'>
                        : TFieldType extends 'text'
                          ? Omit<ReturnType<TextField['__getArgumentsCallback']>, 'customAttributes'>
                          : Omit<ReturnType<UuidField['__getArgumentsCallback']>, 'customAttributes'>;
  /** The custom attributes that you can pass to the field. */
  customAttributes: TCustomAttributes;
  /** The field parser instance so we can call the `translate` method on other field types. */
  fieldParser: TFieldParser;
  /** The name of the model */
  modelName: string;
  /** The lazy evaluate function that you can call to evaluate something after the model was translated. */
  lazyEvaluate: (translatedField: TLazyTranslatedFieldArg) => void;
};

export type AdapterFieldParserInputAndOutputArgs<
  TFieldType extends
    | 'field'
    | 'auto'
    | 'big-auto'
    | 'big-integer'
    | 'boolean'
    | 'char'
    | 'date'
    | 'decimal'
    | 'enum'
    | 'foreign-key'
    | 'integer'
    | 'text'
    | 'uuid' = 'field',
  TEngine extends DatabaseAdapter = DatabaseAdapter,
  TFieldParser extends AdapterFieldParser = AdapterFieldParser,
  TValue = any
> = {
  /** The engine instance. */
  engine: TEngine;
  /** The field parser instance so we can call the `inputParse` or `outputParse` method on other field types */
  fieldParser: TFieldParser;
  /** The model name. */
  modelName: string;
  /** The Palmares model instance. */
  translatedModel: any;
  /** The value that it was received from the query so we can parse it. */
  value: TValue;
  /**The Field instance that you need to translate. */
  field: TFieldType extends 'field'
    ?
        | Omit<ReturnType<Field['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<AutoField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<BigAutoField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<BigIntegerField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<BooleanField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<CharField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<DateField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<DecimalField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<EnumField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<ForeignKeyField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<IntegerField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<TextField['__getArgumentsCallback']>, 'customAttributes'>
        | Omit<ReturnType<UuidField['__getArgumentsCallback']>, 'customAttributes'>
    : TFieldType extends 'auto'
      ? Omit<ReturnType<AutoField['__getArgumentsCallback']>, 'customAttributes'>
      : TFieldType extends 'big-auto'
        ? Omit<ReturnType<BigAutoField['__getArgumentsCallback']>, 'customAttributes'>
        : TFieldType extends 'big-integer'
          ? Omit<ReturnType<BigIntegerField['__getArgumentsCallback']>, 'customAttributes'>
          : TFieldType extends 'boolean'
            ? Omit<ReturnType<BooleanField['__getArgumentsCallback']>, 'customAttributes'>
            : TFieldType extends 'char'
              ? Omit<ReturnType<CharField['__getArgumentsCallback']>, 'customAttributes'>
              : TFieldType extends 'date'
                ? Omit<ReturnType<DateField['__getArgumentsCallback']>, 'customAttributes'>
                : TFieldType extends 'decimal'
                  ? Omit<ReturnType<DecimalField['__getArgumentsCallback']>, 'customAttributes'>
                  : TFieldType extends 'enum'
                    ? Omit<ReturnType<EnumField['__getArgumentsCallback']>, 'customAttributes'>
                    : TFieldType extends 'foreign-key'
                      ? Omit<ReturnType<ForeignKeyField['__getArgumentsCallback']>, 'customAttributes'>
                      : TFieldType extends 'integer'
                        ? Omit<ReturnType<IntegerField['__getArgumentsCallback']>, 'customAttributes'>
                        : TFieldType extends 'text'
                          ? Omit<ReturnType<TextField['__getArgumentsCallback']>, 'customAttributes'>
                          : Omit<ReturnType<UuidField['__getArgumentsCallback']>, 'customAttributes'>;
};
