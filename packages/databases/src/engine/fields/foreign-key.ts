import { AdapterFieldParser } from './field';
import { ForeignKeyField } from '../..';
import { EngineDoesNotSupportFieldTypeException } from '../../models/exceptions';

import type { AdapterFieldParserInputAndOutputArgs, AdapterFieldParserTranslateArgs } from '../..';

/**
 * Functional approach to create a custom field parser.
 *
 * This will be used to parse the fields that are going to be used in the model in the database, we call this class
 * just for the `ForeignKeyField`
 * This class can have three methods:
 * - `inputParser` - Used to parse the input value before it is sent to the database on your `AdapterQuery`
 * implementation.
 * - `outputParser` - Used to parse the output value before it is sent to the client on your `AdapterQuery`
 * implementation.
 * - `translate` - Used to translate the ForeignKeyField to something that the database can understand.
 * translated directly with the `translate` method, all other field types should define a parser with the `translate`
 * field, those will be injected in the `DatabaseAdapter` class constructor.
 */
export function adapterForeignKeyFieldParser<
  TTranslateFunction extends AdapterForeignKeyFieldParser['translate'],
  TInputParserFunction extends NonNullable<AdapterForeignKeyFieldParser>['inputParser'],
  TOutputParserFunction extends NonNullable<AdapterForeignKeyFieldParser>['outputParser']
>(args: {
  /**
   * @description
   * Used to translate the field to something that the database can understand. The `{@link AdapterFieldParser}`
   * instance will be injected by default in the `translate` method.
   * The core idea is that for every field type we will have a parser that will be used to translate the field
   * to something that the database can understand. It's nice if all of the configuration options are supported
   * by your ORM, but if that's not the case it's nice to notify the users through documentation.
   *
   * - _Note_: **If you return undefined, we will not consider that field on the object we build on
   * `translateFields` under {@link AdapterModels} instance.**
   * - _Note2_: **Use the `lazyEvaluate` function to evaluate something after the model was translated.**
   *
   * Imagine that you translating to sequelize field:
   * @example
   * ```ts
   * async translate({
   *   engine,
   *   field,
   *   modelName,
   * }: {
   *   engine: SequelizeEngine;
   *   field: Field;
   *   fieldParser: SequelizeEngineFieldParser;
   *   modelName: string;
   *   model: InstanceType<ReturnType<typeof Model>>;
   *   lazyEvaluate: (translatedField: any) => void;
   * }): Promise<ModelAttributeColumnOptions> {
   *   const defaultOptions = {} as ModelAttributeColumnOptions;
   *   const isFieldAIndexOrIsFieldUnique = field.dbIndex === true || (field.unique as boolean) === true;
   *
   *   if (isFieldAIndexOrIsFieldUnique) appendIndexes(engine.connectionName, modelName, field);
   *
   *   const hasNotYetSetDefaultValueForField = defaultOptions.defaultValue === undefined;
   *   if (hasNotYetSetDefaultValueForField) defaultOptions.defaultValue = field.defaultValue;
   *
   *   defaultOptions.autoIncrement = field.isAuto;
   *   defaultOptions.autoIncrementIdentity = field.isAuto;
   *   defaultOptions.primaryKey = field.primaryKey;
   *   defaultOptions.allowNull = field.allowNull;
   *   defaultOptions.unique = field.unique;
   *   defaultOptions.validate = {};
   *   defaultOptions.validate.notNull = !field.allowNull;
   *   defaultOptions.field = field.databaseName;
   *
   *   const customAttributesOfFieldEntries = Object.entries(field.customAttributes);
   *   for (const [key, value] of customAttributesOfFieldEntries) {
   *     const keyAsTypeofModelColumnOption = key as keyof ModelAttributeColumnOptions;
   *     defaultOptions[keyAsTypeofModelColumnOption] = value as never;
   *   }
   *
   *   const isFieldOfTypeText =
   *     field.typeName === TextField.name || field.typeName === CharField.name || field.typeName === UuidField.name;
   *
   *   if (isFieldOfTypeText) this.textFieldValidations(field as TextField);
   *
   *   return defaultOptions;
   * }
   * ```
   *
   * @description Or you can lazy evaluate (useful for ForeignKeys):
   *
   * @example
   * ```ts
   * async translate(args: {
   *   engine: SequelizeEngine;
   *   field: ForeignKeyField;
   *   fieldParser: SequelizeEngineFieldParser;
   *   modelName: string;
   *   model: InstanceType<ReturnType<typeof Model>>;
   *   lazyEvaluate: (translatedField: TranslatedFieldToEvaluateAfterType) => void;
   * }): Promise<undefined> {
   *   const defaultOptions = await args.fieldParser.translate(args);
   *
   *   args.lazyEvaluate({
   *     fieldAttributes: defaultOptions,
   *     type: 'foreign-key',
   *   } as TranslatedFieldToEvaluateAfterType);
   * }
   * ```
   *
   * @description
   * As we discussed before, the `lazyEvaluate` function is used to evaluate something after the model was translated.
   * So what you pass to the `lazyEvaluate` function will be passed to `lazyEvaluateField` method on the
   * `{@link AdapterFields}` instance under `fieldTranslated` argument
   *
   * @returns - The translated field.
   */
  translate: TTranslateFunction;

  /**
   * @description
   * This is used to parse the input value before you save it. For example, let's say that palmares by default accept
   * `Date` objects for `DateField`. But your database does not support saving `Date` instances. What you can do is
   * that you can implement this method on `DateFieldParser` and return a iSO string. With that, you can be 100% sure
   * that the data on your `queryData` is something valid for your database.
   *
   * This parses the value for each data.
   *
   * @example
   * ```ts
   * async inputParser(args: {
   *   engine: SequelizeEngine;
   *   field: DateField;
   *   fieldParser: SequelizeEngineFieldParser;
   *   modelName: string;
   *   model: InstanceType<ReturnType<typeof Model>>;
   *   value: Date | string;
   * }): Promise<string> {
   *   if (args.value instanceof Date) return args.value.toISOString();
   *   return args.value;
   * }
   * ```
   *
   * @returns - The parsed value.
   */
  inputParser?: TInputParserFunction;
  /**
   * @description
   * This is used to parse the output value before you send it to the user. For example, if the user is fetching a
   * `DateField` from the database, you can parse the value to a `Date` object.
   * This can be useful so you can guarantee that the user will receive the data in the format that it's expected.
   *
   * This parses the value for each data that is retrieved.
   *
   * @example
   * ```ts
   * async outputParser(args: {
   *   engine: SequelizeEngine;
   *   field: DateField;
   *   fieldParser: SequelizeEngineFieldParser;
   *   modelName: string;
   *   model: InstanceType<ReturnType<typeof Model>>;
   *   value: string;
   * }): Promise<string> {
   *   if (typeof value === 'string') return new Date(value);
   *   return args.value;
   * }
   * ```
   *
   * @returns - The parsed value for the user for that specific field.
   */
  outputParser?: TOutputParserFunction;
}) {
  class CustomAdapterForeignKeyFieldParser extends AdapterForeignKeyFieldParser {
    translate = args.translate;
    inputParser = args.inputParser as TInputParserFunction;
    outputParser = args.outputParser as TOutputParserFunction;
  }

  return CustomAdapterForeignKeyFieldParser as typeof AdapterForeignKeyFieldParser & {
    new (): AdapterForeignKeyFieldParser & {
      translate: TTranslateFunction;
      inputParser: TInputParserFunction;
      outputParser: TOutputParserFunction;
    };
  };
}

/**
 * This will be used to parse the fields that are going to be used in the model in the database, we call this class
 * just for the `ForeignKeyField`
 * This class can have three methods:
 * - `inputParser` - Used to parse the input value before it is sent to the database on your `AdapterQuery`
 * implementation.
 * - `outputParser` - Used to parse the output value before it is sent to the client on your `AdapterQuery`
 * implementation.
 * - `translate` - Used to translate the ForeignKeyField to something that the database can understand.
 * translated directly with the `translate` method, all other field types should define a parser with the
 * `translate` field, those will be injected in the `DatabaseAdapter` class constructor.
 */
export class AdapterForeignKeyFieldParser {
  /**
   * @description
   * Used to translate the field to something that the database can understand. The `{@link AdapterFieldParser}`
   * instance will be injected by default in the `translate` method.
   * The core idea is that for every field type we will have a parser that will be used to translate the field to
   * something that the database can understand. It's nice if all of the configuration options are supported by
   * your ORM, but if that's not the case it's nice to notify the users through documentation.
   *
   * - _Note_: **If you return undefined, we will not consider that field on the object we build on
   * `translateFields` under {@link AdapterModels} instance.**
   * - _Note2_: **Use the `lazyEvaluate` function to evaluate something after the model was translated.**
   *
   * Imagine that you translating to sequelize field:
   * @example
   * ```ts
   * async translate({
   *   engine,
   *   field,
   *   modelName,
   * }: {
   *   engine: SequelizeEngine;
   *   field: Field;
   *   fieldParser: SequelizeEngineFieldParser;
   *   modelName: string;
   *   model: InstanceType<ReturnType<typeof Model>>;
   *   lazyEvaluate: (translatedField: any) => void;
   * }): Promise<ModelAttributeColumnOptions> {
   *   const defaultOptions = {} as ModelAttributeColumnOptions;
   *   const isFieldAIndexOrIsFieldUnique = field.dbIndex === true || (field.unique as boolean) === true;
   *
   *   if (isFieldAIndexOrIsFieldUnique) appendIndexes(engine.connectionName, modelName, field);
   *
   *   const hasNotYetSetDefaultValueForField = defaultOptions.defaultValue === undefined;
   *   if (hasNotYetSetDefaultValueForField) defaultOptions.defaultValue = field.defaultValue;
   *
   *   defaultOptions.autoIncrement = field.isAuto;
   *   defaultOptions.autoIncrementIdentity = field.isAuto;
   *   defaultOptions.primaryKey = field.primaryKey;
   *   defaultOptions.allowNull = field.allowNull;
   *   defaultOptions.unique = field.unique;
   *   defaultOptions.validate = {};
   *   defaultOptions.validate.notNull = !field.allowNull;
   *   defaultOptions.field = field.databaseName;
   *
   *   const customAttributesOfFieldEntries = Object.entries(field.customAttributes);
   *   for (const [key, value] of customAttributesOfFieldEntries) {
   *     const keyAsTypeofModelColumnOption = key as keyof ModelAttributeColumnOptions;
   *     defaultOptions[keyAsTypeofModelColumnOption] = value as never;
   *   }
   *
   *   const isFieldOfTypeText =
   *     field.typeName === TextField.name || field.typeName === CharField.name || field.typeName === UuidField.name;
   *
   *   if (isFieldOfTypeText) this.textFieldValidations(field as TextField);
   *
   *   return defaultOptions;
   * }
   * ```
   *
   * @description Or you can lazy evaluate (useful for ForeignKeys):
   *
   * @example
   * ```ts
   * async translate(args: {
   *   engine: SequelizeEngine;
   *   field: ForeignKeyField;
   *   fieldParser: SequelizeEngineFieldParser;
   *   modelName: string;
   *   model: InstanceType<ReturnType<typeof Model>>;
   *   lazyEvaluate: (translatedField: TranslatedFieldToEvaluateAfterType) => void;
   * }): Promise<undefined> {
   *   const defaultOptions = await args.fieldParser.translate(args);
   *
   *   args.lazyEvaluate({
   *     fieldAttributes: defaultOptions,
   *     type: 'foreign-key',
   *   } as TranslatedFieldToEvaluateAfterType);
   * }
   * ```
   *
   * @description
   * As we discussed before, the `lazyEvaluate` function is used to evaluate something after the model was translated.
   * So what you pass to the `lazyEvaluate` function will be passed to `lazyEvaluateField` method on the
   * `{@link AdapterFields}` instance under `fieldTranslated` argument
   *
   * @returns - The translated field.
   */
  // eslint-disable-next-line ts/require-await
  async translate(args: AdapterFieldParserTranslateArgs<'foreign-key'>): Promise<any> {
    throw new EngineDoesNotSupportFieldTypeException(args.engine.constructor.name, ForeignKeyField.name);
  }

  /**
   * @description
   * This is used to parse the input value before you save it. For example, let's say that palmares by default accept
   * `Date` objects for `DateField`. But your database does not support saving `Date` instances. What you can do is
   * that you can implement this method on `DateFieldParser` and return a iSO string. With that, you can be 100% sure
   * that the data on your `queryData` is something valid for your database.
   *
   * This parses the value for each data.
   *
   * @example
   * ```ts
   * async inputParser(args: {
   *   engine: SequelizeEngine;
   *   field: DateField;
   *   fieldParser: SequelizeEngineFieldParser;
   *   modelName: string;
   *   model: InstanceType<ReturnType<typeof Model>>;
   *   value: Date | string;
   * }): Promise<string> {
   *   if (args.value instanceof Date) return args.value.toISOString();
   *   return args.value;
   * }
   * ```
   *
   * @returns - The parsed value.
   */
  // eslint-disable-next-line ts/require-await
  async inputParser?(args: AdapterFieldParserInputAndOutputArgs<'foreign-key'>) {
    return args.value;
  }

  /**
   * @description
   * This is used to parse the output value before you send it to the user. For example, if the user is fetching a
   * `DateField` from the database, you can parse the value to a `Date` object.
   * This can be useful so you can guarantee that the user will receive the data in the format that it's expected.
   *
   * This parses the value for each data that is retrieved.
   *
   * @example
   * ```ts
   * async outputParser(args: {
   *   engine: SequelizeEngine;
   *   field: DateField;
   *   fieldParser: SequelizeEngineFieldParser;
   *   modelName: string;
   *   model: InstanceType<ReturnType<typeof Model>>;
   *   value: string;
   * }): Promise<string> {
   *   if (typeof value === 'string') return new Date(value);
   *   return args.value;
   * }
   * ```
   *
   * @returns - The parsed value for the user for that specific field.
   */
  // eslint-disable-next-line ts/require-await
  async outputParser?(args: AdapterFieldParserInputAndOutputArgs<'foreign-key'>) {
    return args.value;
  }
}
