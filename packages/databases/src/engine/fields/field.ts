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

  async parse(field: Field): Promise<any> {
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
        return this.auto?.parse(field);
      case BigAutoField.name:
        return this.bigAuto?.parse(field);
      case BigIntegerField.name:
        return this.bigInt?.parse(field);
      case CharField.name:
        return this.char?.parse(field);
      case DateField.name:
        return this.date?.parse(field);
      case DecimalField.name:
        return this.decimal?.parse(field);
      case ForeignKeyField.name:
        return this.foreignKey?.parse(field);
      case IntegerField.name:
        return this.integer?.parse(field);
      case TextField.name:
        return this.text?.parse(field);
      case UUIDField.name:
        return this.uuid?.parse(field);
      case TranslatableField.name:
        return (field as TranslatableField).translate(this.engineFields);
      default:
        throw new Error('Field type not supported, please');
    }
  }
}
