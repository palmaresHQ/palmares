import { fields } from '@palmares/databases';

import type SequelizeEngine from './engine';
import type {
  AdapterFieldParserTranslateArgs,
  AdapterForeignKeyFieldParser,
  Field,
  ForeignKeyField
} from '@palmares/databases';
import type {
  BelongsToOptions,
  ForeignKeyOptions,
  HasManyOptions,
  HasOneOptions,
  IndexesOptions,
  Model,
  ModelAttributeColumnOptions,
  ModelCtor
} from 'sequelize';

const indexesByEngineAndModelName = new Map<string, Map<string, IndexesOptions[]>>();
const onDeleteOperationsTable = {
  [fields.ON_DELETE.CASCADE]: 'CASCADE',
  [fields.ON_DELETE.SET_NULL]: 'SET NULL',
  [fields.ON_DELETE.SET_DEFAULT]: 'SET DEFAULT',
  [fields.ON_DELETE.RESTRICT]: 'RESTRICT',
  [fields.ON_DELETE.DO_NOTHING]: 'DO NOTHING'
};

/**
 * Append the index to add it later to the model options.
 *
 * @param engineName - The name of the engine.
 * @param modelName - The name of the model.
 * @param field - The field to add the index to.
 */
export function appendIndexes(
  engineName: string,
  modelName: string,
  field: AdapterFieldParserTranslateArgs<'field'>['field']
) {
  if (indexesByEngineAndModelName.has(engineName) === false) indexesByEngineAndModelName.set(engineName, new Map());
  if (indexesByEngineAndModelName.get(engineName)?.has(modelName) === false)
    indexesByEngineAndModelName.get(engineName)?.set(modelName, []);

  // Get the data and push it since the array is a reference we can be 100% sure that it will be updated on the map.
  const indexesForModelOnEngine = indexesByEngineAndModelName.get(engineName)?.get(modelName) as IndexesOptions[];
  indexesForModelOnEngine.push({
    unique: field.unique === true,
    fields: [field.databaseName as string]
  });
}

export function getIndexes(engineName: string, modelName: string): IndexesOptions[] {
  const indexesForEngineOnModel = indexesByEngineAndModelName.get(engineName)?.get(modelName);
  const doesIndexesExistForModel = Array.isArray(indexesForEngineOnModel);
  if (doesIndexesExistForModel) {
    // We want to delete the reference so we don't occupy memory.
    indexesByEngineAndModelName.get(engineName)?.delete(modelName);
    // We want to delete the reference so we don't occupy memory.
    if (indexesByEngineAndModelName.get(engineName)?.size === 0) indexesByEngineAndModelName.delete(engineName);
    return indexesForEngineOnModel;
  }
  return [];
}

/**
 * This is used to create the relations between the models. This runs AFTER all models have been created,
 * we do not consider them while we are translating each field on the model.
 * This means that if you have, let's say, a profileId field on your User model, we will not create that
 * field until after the User model has been created.
 *
 * @param engine - The engine instance.
 * @param field - The field to create the relation for.
 * @param fieldAttributes - The attributes of the field.
 */
export function handleRelatedField(
  engine: InstanceType<typeof SequelizeEngine>,
  field: Parameters<AdapterForeignKeyFieldParser['translate']>[0]['field'],
  fieldAttributes: ModelAttributeColumnOptions & ForeignKeyOptions
) {
  const modelWithForeignKeyField: ModelCtor<Model> = engine.initializedModels[
    (field as any).modelName as string
  ] as ModelCtor<Model>;
  const relatedToModel: ModelCtor<Model> = engine.initializedModels[field.relatedTo] as ModelCtor<Model>;
  // eslint-disable-next-line ts/no-unnecessary-condition
  const isRelatedModelAndModelOfForeignDefined = relatedToModel !== undefined && modelWithForeignKeyField !== undefined;

  if (isRelatedModelAndModelOfForeignDefined) {
    const translatedOnDelete: string = onDeleteOperationsTable[field.onDelete];

    fieldAttributes.name = field.fieldName;
    const relationOptions: HasManyOptions | BelongsToOptions | HasOneOptions = {
      foreignKey: fieldAttributes,
      hooks: true,
      onDelete: translatedOnDelete,
      sourceKey: field.toField
    };

    if ((field as any)?.['typeName'] === 'ForeignKeyField') {
      relationOptions.as = field.relatedName as string;
      relatedToModel.hasMany(modelWithForeignKeyField, relationOptions);

      relationOptions.as = field.relationName as string;
      modelWithForeignKeyField.belongsTo(relatedToModel, relationOptions);
      return false;
    }
  }
  return true;
}
