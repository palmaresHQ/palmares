import Engine from '..';
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
import EngineEnumFieldParser from './enum';
import EngineBooleanFieldParser from './boolean';
import { NotImplementedEngineFieldsException } from '../exceptions';

/**
 * This works as a storage and transformer for all of the fields. First we have the `set` method
 * that will store all of the fields in the object and then we have the `get` method that will return
 * the fields translated to a way that the ORM can understand.
 */
export default class EngineFields {
  fieldsParser: EngineFieldParser;
  autoFieldParser: EngineAutoFieldParser = new EngineAutoFieldParser();
  bigAutoFieldParser: EngineBigAutoFieldParser = new EngineBigAutoFieldParser();
  bigIntegerFieldParser: EngineBigIntegerFieldParser = new EngineBigIntegerFieldParser();
  charFieldParser: EngineCharFieldParser = new EngineCharFieldParser();
  dateFieldParser: EngineDateFieldParser = new EngineDateFieldParser();
  decimalFieldParser: EngineDecimalFieldParser = new EngineDecimalFieldParser();
  foreignKeyFieldParser: EngineForeignKeyFieldParser = new EngineForeignKeyFieldParser();
  integerFieldParser: EngineIntegerFieldParser = new EngineIntegerFieldParser();
  textFieldParser: EngineTextFieldParser = new EngineTextFieldParser();
  uuidFieldParser: EngineUuidFieldParser = new EngineUuidFieldParser();
  enumFieldParser: EngineEnumFieldParser = new EngineEnumFieldParser();
  booleanFieldParser: EngineBooleanFieldParser = new EngineBooleanFieldParser();

  constructor(fieldsParser?: EngineFieldParser) {
    this.fieldsParser = fieldsParser ? fieldsParser : new EngineFieldParser();
  }

  /** */
  async lazyEvaluateField(
    _engine: Engine,
    _modelName: string,
    _translatedModel: any,
    _field: Field,
    _fieldTranslated: any
  ): Promise<any> {
    throw new NotImplementedEngineFieldsException('lazyEvaluateField');
  }

  /**
   * This method will return the fields translated to something that the ORM can understand.
   *
   * @param field - The field that will be translated.
   *
   * @returns The field translated to something that the ORM can understand.
   */
  async translateField?(
    _engine: Engine,
    _field: Field,
    _defaultGetCallback: (_field: Field) => Promise<any>
  ): Promise<any> {
    throw new NotImplementedEngineFieldsException('get');
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
  EngineEnumFieldParser,
  EngineBooleanFieldParser,
};
