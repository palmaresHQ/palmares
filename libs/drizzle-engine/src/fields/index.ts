import { adapterFields, Field, ForeignKeyField } from '@palmares/databases';

import DrizzleEngineFieldParser from './field';
import DrizzleEngineBigIntegerFieldParser from './big-integer';
import DrizzleEngineCharFieldParser from './char';
import DrizzleEngineDateFieldParser from './date';
import DrizzleEngineDecimalFieldParser from './decimal';
import DrizzleEngineTextFieldParser from './text';
import DrizzleEngineUuidFieldParser from './uuid';
import DrizzleEngineForeignKeyFieldParser from './foreign-key';
import DrizzleEngineIntegerFieldParser from './integer';
import DrizzleEngineEnumFieldParser from './enum';
import DrizzleEngineBooleanFieldParser from './boolean';

/**
 * This class is used to translate the fields of a model to the attributes of a Drizzle model.
 * This is closely tied to the engine itself because sometimes we might need the models after it was translated
 * or sometimes we need to translate stuff outside of the fields for example the indexes that are from the model
 * itself.
 */
export default adapterFields({
  fieldsParser: new DrizzleEngineFieldParser(),
  bigIntegerFieldParser: new DrizzleEngineBigIntegerFieldParser(),
  charFieldParser: new DrizzleEngineCharFieldParser(),
  dateFieldParser: new DrizzleEngineDateFieldParser(),
  decimalFieldParser: new DrizzleEngineDecimalFieldParser(),
  foreignKeyFieldParser: new DrizzleEngineForeignKeyFieldParser(),
  integerFieldParser: new DrizzleEngineIntegerFieldParser(),
  textFieldParser: new DrizzleEngineTextFieldParser(),
  uuidFieldParser: new DrizzleEngineUuidFieldParser(),
  enumFieldParser: new DrizzleEngineEnumFieldParser(),
  booleanFieldParser: new DrizzleEngineBooleanFieldParser(),

  lazyEvaluateField: async (
    _engine: any,
    _modelName: string,
    translatedModel: any,
    field: Field,
    fieldTranslated: any
  ) => {
    return translatedModel;
  },
} as any);
