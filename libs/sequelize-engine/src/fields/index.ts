import { adapterFields } from '@palmares/databases';

import SequelizeEngineAutoFieldParser from './auto';
import SequelizeEngineBigAutoFieldParser from './big-auto';
import SequelizeEngineBigIntegerFieldParser from './big-integer';
import SequelizeEngineBooleanFieldParser from './boolean';
import SequelizeEngineCharFieldParser from './char';
import SequelizeEngineDateFieldParser from './date';
import SequelizeEngineDecimalFieldParser from './decimal';
import SequelizeEngineEnumFieldParser from './enum';
import SequelizeEngineFieldParser from './field';
import SequelizeEngineForeignKeyFieldParser from './foreign-key';
import SequelizeEngineIntegerFieldParser from './integer';
import SequelizeEngineTextFieldParser from './text';
import SequelizeEngineUuidFieldParser from './uuid';
import { handleRelatedField } from '../utils';

import type SequelizeEngine from '../engine';
import type { TranslatedFieldToEvaluateAfterType } from '../types';
import type { AdapterFieldParserTranslateArgs, AdapterForeignKeyFieldParser } from '@palmares/databases';
import type { Model, ModelCtor } from 'sequelize';

/**
 * This class is used to translate the fields of a model to the attributes of a sequelize model.
 * This is closely tied to the engine itself because sometimes we might need the models after it was translated
 * or sometimes we need to translate stuff outside of the fields for example the indexes that are from the model
 * itself.
 */
export default adapterFields({
  fieldsParser: new SequelizeEngineFieldParser(),
  autoFieldParser: new SequelizeEngineAutoFieldParser(),
  bigAutoFieldParser: new SequelizeEngineBigAutoFieldParser(),
  bigIntegerFieldParser: new SequelizeEngineBigIntegerFieldParser(),
  charFieldParser: new SequelizeEngineCharFieldParser(),
  dateFieldParser: new SequelizeEngineDateFieldParser(),
  decimalFieldParser: new SequelizeEngineDecimalFieldParser(),
  foreignKeyFieldParser: new SequelizeEngineForeignKeyFieldParser(),
  integerFieldParser: new SequelizeEngineIntegerFieldParser(),
  textFieldParser: new SequelizeEngineTextFieldParser(),
  uuidFieldParser: new SequelizeEngineUuidFieldParser(),
  enumFieldParser: new SequelizeEngineEnumFieldParser(),
  booleanFieldParser: new SequelizeEngineBooleanFieldParser(),

  // eslint-disable-next-line ts/require-await
  lazyEvaluateField: async (
    engine,
    _modelName: string,
    translatedModel: ModelCtor<Model>,
    field: AdapterFieldParserTranslateArgs<'field'>['field'],
    fieldTranslated: TranslatedFieldToEvaluateAfterType
  ) => {
    switch (fieldTranslated.type) {
      case 'foreign-key':
        handleRelatedField(
          engine as InstanceType<typeof SequelizeEngine>,
          field as Parameters<AdapterForeignKeyFieldParser['translate']>[0]['field'],
          fieldTranslated
        );
        break;
      case 'date':
        translatedModel.addHook('beforeSave', `${field.fieldName}AutoNow`, (instance: Model) => {
          (instance as any)[field.fieldName] = new Date();
        });
        break;
    }
    return translatedModel;
  }
});
