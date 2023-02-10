import Engine from '..';
import { EngineFieldsType } from '../types';
import { Field } from '../../models/fields';
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
   * This method will return the fields translated to something that the ORM can understand.
   *
   * @param field - The field that will be translated.
   *
   * @returns The field translated to something that the ORM can understand.
   */
  async get(field: Field): Promise<any> {
    return this.fieldParserInstance._internalParse(field);
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
