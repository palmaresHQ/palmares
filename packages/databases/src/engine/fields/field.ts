import { EngineDoesNotSupportFieldTypeException } from '../../models/exceptions';

import { Field } from '../../models/fields';
import type EngineFields from '.';
import type Engine from '..';
import EngineAutoFieldParser from './auto';
import EngineBigAutoFieldParser from './big-auto';
import EngineBigIntegerFieldParser from './big-integer';
import EngineCharFieldParser from './char';
import EngineDateFieldParser from './date';
import EngineDecimalFieldParser from './decimal';
import EngineForeignKeyFieldParser from './foreign-key';
import EngineIntegerFieldParser from './integer';
import EngineTextFieldParser from './text';
import EngineUuidFieldParser from './uuid';
import EngineEnumFieldParser from './enum';
import EngineBooleanFieldParser from './boolean';

/**
 * This will be used to parse the fields that are going to be used in the model in the database, for every field we will call this class.
 * This class will have two methods:
 * - `internalParse` - That will be called internally and should not be overridden.
 * - `translate` - Used to translate the field to something that the database can understand. Except for the `TranslatableField` class that will be
 * translated directly with the `translate` method, all other field types should define a parser with the `translate` field, those will be injected
 * in the `Engine` class constructor.
 */
export default class EngineFieldParser {
  auto?: EngineAutoFieldParser;
  bigAuto?: EngineBigAutoFieldParser;
  bigInt?: EngineBigIntegerFieldParser;
  char?: EngineCharFieldParser;
  date?: EngineDateFieldParser;
  decimal?: EngineDecimalFieldParser;
  foreignKey?: EngineForeignKeyFieldParser;
  integer?: EngineIntegerFieldParser;
  text?: EngineTextFieldParser;
  uuid?: EngineUuidFieldParser;
  enum?: EngineEnumFieldParser;
  boolean?: EngineBooleanFieldParser;

  translatable = false;

  async translate(
    _engine: Engine,
    _field: ConstructorParameters<typeof Field>[0],
    _defaultTranslateCallback: (
      _field: ConstructorParameters<typeof Field>[0]
    ) => ReturnType<EngineFieldParser['translate']>
  ): Promise<any> {
    throw new EngineDoesNotSupportFieldTypeException(_engine.constructor.name, Field.name);
  }
}
