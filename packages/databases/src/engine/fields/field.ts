import EngineFields from '.';
import {
  AutoField,
  BigAutoField,
  BigIntegerField,
  CharField,
  DateField,
  Field,
  DecimalField,
  ForeignKeyField,
  IntegerField,
  TextField,
  UUIDField,
  TranslatableField,
} from '../../models/fields';
import type EngineAutoFieldParser from './auto';
import type EngineBigAutoFieldParser from './big-auto';
import type EngineBigIntegerFieldParser from './big-integer';
import type EngineCharFieldParser from './char';
import type EngineDateFieldParser from './date';
import EngineDecimalFieldParser from './decimal';
import type EngineForeignKeyFieldParser from './foreign-key';
import type EngineIntegerFieldParser from './integer';
import type EngineTextFieldParser from './text';
import type EngineUuidFieldParser from './uuid';

/**
 * This will be used to parse the fields that are going to be used in the model in the database, for every field we will call this class.
 * This class will have two methods:
 * - `internalParse` - That will be called internally and should not be overridden.
 * - `translate` - Used to translate the field to something that the database can understand. Except for the `TranslatableField` class that will be
 * translated directly with the `translate` method, all other field types should define a parser with the `translate` field, those will be injected
 * in the `Engine` class constructor.
 */
export default class EngineFieldParser {
  engineFields: EngineFields;
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

  constructor(
    engineFields: EngineFields,
    auto?: EngineAutoFieldParser,
    bigAuto?: EngineBigAutoFieldParser,
    bigInt?: EngineBigIntegerFieldParser,
    char?: EngineCharFieldParser,
    date?: EngineDateFieldParser,
    decimal?: EngineDecimalFieldParser,
    foreignKey?: EngineForeignKeyFieldParser,
    integer?: EngineIntegerFieldParser,
    text?: EngineTextFieldParser,
    uuid?: EngineUuidFieldParser
  ) {
    this.engineFields = engineFields;
    this.auto = auto;
    this.bigAuto = bigAuto;
    this.bigInt = bigInt;
    this.char = char;
    this.date = date;
    this.decimal = decimal;
    this.foreignKey = foreignKey;
    this.integer = integer;
    this.text = text;
    this.uuid = uuid;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async translate(field: Field): Promise<any> {
    return {};
  }

  async internalParse(field: Field): Promise<any> {
    const existAllFieldsSoProbablyTheEngineFieldParserInstance =
      this.auto !== undefined &&
      this.bigAuto !== undefined &&
      this.bigInt !== undefined &&
      this.char !== undefined &&
      this.date !== undefined &&
      this.decimal !== undefined &&
      this.decimal !== undefined &&
      this.foreignKey !== undefined &&
      this.integer !== undefined &&
      this.text !== undefined &&
      this.uuid !== undefined;
    if (existAllFieldsSoProbablyTheEngineFieldParserInstance === false)
      return this.translate(field);
    switch (field.typeName) {
      case AutoField.name:
        return this.auto?.internalParse(field);
      case BigAutoField.name:
        return this.bigAuto?.internalParse(field);
      case BigIntegerField.name:
        return this.bigInt?.internalParse(field);
      case CharField.name:
        return this.char?.internalParse(field);
      case DateField.name:
        return this.date?.internalParse(field);
      case DecimalField.name:
        return this.decimal?.internalParse(field);
      case ForeignKeyField.name:
        return this.foreignKey?.internalParse(field);
      case IntegerField.name:
        return this.integer?.internalParse(field);
      case TextField.name:
        return this.text?.internalParse(field);
      case UUIDField.name:
        return this.uuid?.internalParse(field);
      case TranslatableField.name:
        return (field as TranslatableField).translate(this.engineFields);
      default:
        throw new Error('Field type not supported, please');
    }
  }
}
