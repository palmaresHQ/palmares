import { ForeignKeyField } from '@palmares/databases';
import { ModelAttributeColumnOptions } from 'sequelize';

import SequelizeEngineFieldParser from './field';
import { PreventForeignKeyError } from '../exceptions';

export default class SequelizeEngineForeignKeyFieldParser extends SequelizeEngineFieldParser {
  override async translate(
    field: ForeignKeyField
  ): Promise<ModelAttributeColumnOptions> {
    const defaultOptions = await super.translate(field);
    await this.engineFields.addRelatedFieldToEvaluateAfter(
      field,
      defaultOptions
    );
    throw new PreventForeignKeyError();
  }
}
