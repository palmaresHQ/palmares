import Engine from '..';
import { EngineFieldsType } from '../types';
import { Field, TranslatableField } from '../../models/fields';
import EngineFieldParser from './field';
import EngineAutoFieldParser from './auto';
import EngineBigAutoFieldParser from './big-auto';
import EngineBigIntegerFieldParser from './big-integer';
import EngineDateFieldParser from './date';
import EngineForeignKeyFieldParser from './foreign-key';
import EngineIntegerFieldParser from './integer';
import EngineUuidFieldParser from './uuid';
import EngineDecimalFieldParser from './decimal';
import EngineCharFieldParser from './char';
import EngineTextFieldParser from './text';

/**
 * This works as a storage and transformer for all of the fields. First we have the `set` method
 * that will store all of the fields in the object and then we have the `get` method that will return
 * the fields translated to a way that the ORM can understand.
 */
export default class EngineFields implements EngineFieldsType {
  engineInstance!: Engine;
  fields: Map<Field['fieldName'], Field> = new Map();
  fieldParserInstance: EngineFieldParser;

  constructor(
    engineInstance: Engine,
    fields: {
      field?: typeof EngineFieldParser;
      auto: typeof EngineAutoFieldParser;
      bigAuto: typeof EngineBigAutoFieldParser;
      bigInteger: typeof EngineBigIntegerFieldParser;
      char: typeof EngineCharFieldParser;
      date: typeof EngineDateFieldParser;
      decimal: typeof EngineDecimalFieldParser;
      foreignKey: typeof EngineForeignKeyFieldParser;
      integer: typeof EngineIntegerFieldParser;
      text: typeof EngineTextFieldParser;
      uuid: typeof EngineUuidFieldParser;
    }
  ) {
    const auto = new fields.auto(this);
    const bigAuto = new fields.bigAuto(this);
    const bigInteger = new fields.bigInteger(this);
    const char = new fields.char(this);
    const date = new fields.date(this);
    const decimal = new fields.decimal(this);
    const foreignKey = new fields.foreignKey(this);
    const integer = new fields.integer(this);
    const text = new fields.text(this);
    const uuid = new fields.uuid(this);
    this.fieldParserInstance =
      fields.field === undefined
        ? new EngineFieldParser(
            this,
            auto,
            bigAuto,
            bigInteger,
            char,
            date,
            decimal,
            foreignKey,
            integer,
            text,
            uuid
          )
        : new fields.field(
            this,
            auto,
            bigAuto,
            bigInteger,
            char,
            date,
            decimal,
            foreignKey,
            integer,
            text,
            uuid
          );
    this.engineInstance = engineInstance;
  }

  /**
   * This should return the field translated, on here it returns if the field was translated and the field translated or not.
   *
   * We can create fields able to translate by itself (without needing to be defined on the engine). Those are `TranslatableField`s,
   * it is a field that have the `translate` function so we can translate it to a given engine at any time. Right now, it's not used
   * much, and might not be used by any existing engine, but it's a nice stuff to have for users. So if your engine does not support by
   * default all of the fields of the engine, the user can still create custom fields.
   *
   * Generally speaking this is more for the user to create custom fields for your engine. A better engine API will enable users to create
   * custom fields more easily.
   *
   * @param fieldName - The name of the field that we want to retrieve translated.
   *
   * @return - An object that explains if the field was already translated and the translated value of it.
   */
  async get(fieldName: string): Promise<{
    wasTranslated: boolean;
    value?: any;
  }> {
    const field = this.fields.get(fieldName);
    const hasTranslateHandler =
      typeof (field as TranslatableField).translate === 'function';
    if (hasTranslateHandler) {
      const fieldAsTranslatable = field as TranslatableField;
      return {
        wasTranslated: true,
        value: fieldAsTranslatable.translate
          ? fieldAsTranslatable.translate(this)
          : null,
      };
    } else {
      return {
        wasTranslated: false,
        value: field,
      };
    }
  }
}

export {
  EngineFieldParser,
  EngineAutoFieldParser,
  EngineBigAutoFieldParser,
  EngineIntegerFieldParser,
  EngineCharFieldParser,
  EngineDateFieldParser,
  EngineUuidFieldParser,
  EngineTextFieldParser,
  EngineDecimalFieldParser,
  EngineBigIntegerFieldParser,
  EngineForeignKeyFieldParser,
};
