import { ForeignKeyField } from '@palmares/databases';
import { ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import { PreventForeignKeyError } from '../exceptions';
import SequelizeEngine from '../engine';

export default class SequelizeEngineForeignKeyFieldParser extends SequelizeEngineFieldParser {
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

  async translate(engine: SequelizeEngine, field: ForeignKeyField): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await super.translate(engine, field);
    await engine.fields.addRelatedFieldToEvaluateAfter(engine, field, defaultOptions);
    throw new PreventForeignKeyError();
  }
}
