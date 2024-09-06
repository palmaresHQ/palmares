import type DatabaseAdapter from '.';
import type EngineFields from './fields';
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
import type { model } from '../models';

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
  TLazyTranslatedFieldArg = any
> = {
  /**The engine instance. */
  engine: TEngine;
  /**The {@link Field} instance that you need to translate. */
  field: TFieldType extends 'field'
    ?
        | Field
        | AutoField
        | BigAutoField
        | BigIntegerField
        | BooleanField
        | CharField
        | DateField
        | DecimalField
        | EnumField
        | ForeignKeyField
        | IntegerField
        | TextField
        | UuidField
    : TFieldType extends 'auto'
      ? AutoField
      : TFieldType extends 'big-auto'
        ? BigAutoField
        : TFieldType extends 'big-integer'
          ? BigIntegerField
          : TFieldType extends 'boolean'
            ? BooleanField
            : TFieldType extends 'char'
              ? CharField
              : TFieldType extends 'date'
                ? DateField
                : TFieldType extends 'decimal'
                  ? DecimalField
                  : TFieldType extends 'enum'
                    ? EnumField
                    : TFieldType extends 'foreign-key'
                      ? ForeignKeyField
                      : TFieldType extends 'integer'
                        ? IntegerField
                        : TFieldType extends 'text'
                          ? TextField
                          : UuidField;
  /** The field parser instance so we can call the `translate` method on other field types. */
  fieldParser: TFieldParser;
  /** The name of the model */
  modelName: string;
  /** The Palmares model instance. */
  model: InstanceType<ReturnType<typeof model>>;
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
  model: InstanceType<ReturnType<typeof model>>;
  /** The value that it was received from the query so we can parse it. */
  value: TValue;
  /**The Field instance that you need to translate. */
  field: ConstructorParameters<
    TFieldType extends 'field'
      ? typeof Field
      : TFieldType extends 'auto'
        ? typeof AutoField
        : TFieldType extends 'big-auto'
          ? typeof BigAutoField
          : TFieldType extends 'big-integer'
            ? typeof BigIntegerField
            : TFieldType extends 'boolean'
              ? typeof BooleanField
              : TFieldType extends 'char'
                ? typeof CharField
                : TFieldType extends 'date'
                  ? typeof DateField
                  : TFieldType extends 'decimal'
                    ? typeof DecimalField
                    : TFieldType extends 'enum'
                      ? typeof EnumField
                      : TFieldType extends 'foreign-key'
                        ? typeof ForeignKeyField
                        : TFieldType extends 'integer'
                          ? typeof IntegerField
                          : TFieldType extends 'text'
                            ? typeof TextField
                            : typeof UuidField
  >[0];
};
