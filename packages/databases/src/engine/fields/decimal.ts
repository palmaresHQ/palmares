import EngineFieldParser from './field';

export default class EngineDecimalFieldParser extends EngineFieldParser {
  auto = undefined;
  bigAuto = undefined;
  bigInt = undefined;
  char = undefined;
  date = undefined;
  decimal = undefined;
  foreignKey = undefined;
  integer = undefined;
  text = undefined;
  uuid = undefined;
  enum = undefined;
  boolean = undefined;

  translatable = true;
}
