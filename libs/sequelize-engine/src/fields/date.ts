import { DateField } from '@palmares/databases';
import { DataTypes } from 'sequelize';

import SequelizeEngineFieldParser from './field';

export default class SequelizeEngineDateFieldParser extends SequelizeEngineFieldParser {
  override async translate(field: DateField) {
    const isAutoNow = (field.autoNow as boolean) === true;
    const hasAutoNowOrAutoNowAdd =
      (field.autoNowAdd as boolean) === true || isAutoNow;

    const defaultOptions = await super.translate(field);
    defaultOptions.type = DataTypes.DATE;
    if (hasAutoNowOrAutoNowAdd) defaultOptions.defaultValue = DataTypes.NOW;
    if (isAutoNow)
      await this.engineFields.addHooksToUpdateDateFields(
        field.model.name,
        field.fieldName
      );
    return defaultOptions;
  }
}
