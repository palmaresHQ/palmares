import Engine from '..';
import { model } from '../../models';
import { EngineDoesNotSupportFieldTypeException } from '../../models/exceptions';
import { AutoField } from '../../models/fields';
import EngineFieldParser from './field';

/**
 * Functional approach to the `EngineAutoFieldParser` class.
 */
export function adapterAutoFieldParser<
  TTranslatorFunction extends EngineAutoFieldParser['translate'],
  TGetFieldClassFunction extends (typeof EngineAutoFieldParser)['getFieldClass'],
>(args: {
  /**
   * This function is used for translating the fields to something that the database is able to understand. Auto field is special because usually it should be used as
   * the primary key of the database.
   *
   * @example
   * ```ts
   * async translate(engine, field) {
   *    const defaultOptions = await baseFieldTranslate(engine, field);
   *    defaultOptions.primaryKey = true;
   *    defaultOptions.autoIncrement = true;
   *    defaultOptions.autoIncrementIdentity = true;
   *    defaultOptions.type = DataTypes.INTEGER;
   *    defaultOptions.validate = defaultOptions.validate || {};
   *    defaultOptions.validate.isNumeric = true;
   *    defaultOptions.validate.isInt = true;
   *    return defaultOptions;
   * }
   * ```
   *
   * @param _engine - The engine instance that is being used.
   * @param _field - The AutoField instance that is being translated. (we are just retrieving the constructor options from it)
   *
   * @returns The translated field.
   */
  translate: TTranslatorFunction;

  /**
   * This static method is used for getting a custom field class for the AutoField. This is used for the `engine` to be able to override the existing behavior of the fields.
   *
   * Notice that you should return a class that extends the `AutoField` class or the `AutoField` class itself. Also, overriding types with `AutoField.overrideType<string>()`
   * is supported.
   *
   * @example
   * ```ts
   * static getFieldClass() {
   *    return AutoField.overrideType<string>();
   * }
   * ```
   *
   * @returns - The custom field class that will be used for the AutoField.
   */
  getFieldClass?: TGetFieldClassFunction;
}) {
  const returnedClass = class CustomAdapterAutoFieldParser extends EngineFieldParser {
    translate = args.translate as TTranslatorFunction;
  };

  return returnedClass as new () => EngineAutoFieldParser & {
    translate: TTranslatorFunction;
  };
}

/**
 * This will be used to parse the AutoField that are going to be used in the model in the database, for every AutoField we will call this class.
 *
 * There are two key things you should implement in this class:
 * - `translatable` should be true
 * - `translate` should be implemented
 */
export default class EngineAutoFieldParser extends EngineFieldParser {
  /**
   * This static method is used for getting a custom field class for the AutoField. This is used for the `engine` to be able to override the existing behavior of the fields.
   *
   * Notice that you should return a class that extends the `AutoField` class or the `AutoField` class itself. Also, overriding types with `AutoField.overrideType<string>()`
   * is supported.
   *
   * @example
   * ```ts
   * static getFieldClass() {
   *    return AutoField.overrideType<string>();
   * }
   * ```
   *
   * @returns - The custom field class that will be used for the AutoField.
   */
  static getFieldClass?(): unknown;
}
