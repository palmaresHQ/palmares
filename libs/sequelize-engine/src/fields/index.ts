import { EngineAutoFieldParser, EngineFields, Field, ForeignKeyField } from '@palmares/databases';

import {
  ModelAttributeColumnOptions,
  Model,
  ModelCtor,
  HasManyOptions,
  BelongsToOptions,
  HasOneOptions,
  ForeignKeyOptions,
  IndexesOptions,
} from 'sequelize';

import type SequelizeEngine from '../engine';
import {
  ModelTranslatorIndexesType,
  RelatedModelToEvaluateAfterType,
  TranslatedFieldToEvaluateAfterType,
} from '../types';
import SequelizeEngineFieldParser from './field';
import SequelizeEngineAutoFieldParser from './auto';
import SequelizeEngineBigAutoFieldParser from './big-auto';
import SequelizeEngineBigIntegerFieldParser from './big-integer';
import SequelizeEngineCharFieldParser from './char';
import SequelizeEngineDateFieldParser from './date';
import SequelizeEngineDecimalFieldParser from './decimal';
import SequelizeEngineTextFieldParser from './text';
import SequelizeEngineUuidFieldParser from './uuid';
import SequelizeEngineForeignKeyFieldParser from './foreign-key';
import SequelizeEngineIntegerFieldParser from './integer';
import SequelizeEngineEnumFieldParser from './enum';
import SequelizeEngineBooleanFieldParser from './boolean';
import { handleRelatedField } from '../utils';

/**
 * This class is used to translate the fields of a model to the attributes of a sequelize model.
 * This is closely tied to the engine itself because sometimes we might need the models after it was translated
 * or sometimes we need to translate stuff outside of the fields for example the indexes that are from the model
 * itself.
 */
export default class SequelizeEngineFields extends EngineFields {
  fieldsParser = new SequelizeEngineFieldParser();
  autoFieldParser = new SequelizeEngineAutoFieldParser();
  bigAutoFieldParser = new SequelizeEngineBigAutoFieldParser();
  bigIntegerFieldParser = new SequelizeEngineBigIntegerFieldParser();
  charFieldParser = new SequelizeEngineCharFieldParser();
  dateFieldParser = new SequelizeEngineDateFieldParser();
  decimalFieldParser = new SequelizeEngineDecimalFieldParser();
  foreignKeyFieldParser = new SequelizeEngineForeignKeyFieldParser();
  integerFieldParser = new SequelizeEngineIntegerFieldParser();
  textFieldParser = new SequelizeEngineTextFieldParser();
  uuidFieldParser = new SequelizeEngineUuidFieldParser();
  enumFieldParser = new SequelizeEngineEnumFieldParser();
  booleanFieldParser = new SequelizeEngineBooleanFieldParser();

  async lazyEvaluateField(
    engine: SequelizeEngine,
    _modelName: string,
    translatedModel: ModelCtor<Model>,
    field: Field,
    fieldTranslated: TranslatedFieldToEvaluateAfterType
  ): Promise<any> {
    switch (fieldTranslated.type) {
      case 'foreign-key':
        handleRelatedField(engine, field as ForeignKeyField, fieldTranslated);
        break;
      case 'date':
        translatedModel.addHook('beforeSave', `${field.fieldName}AutoNow`, (instance: Model) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          instance[updateDateHook] = new Date();
        });
        break;
    }
    return translatedModel;
  }
}
