import { adapterModels } from '@palmares/databases';
import { Model } from 'sequelize';

import { getIndexes } from './utils';

import type { ModelOptionsType } from '@palmares/databases';
import type { ModelAttributes, ModelCtor, ModelOptions, OrderItem } from 'sequelize';

/**
 * Translates the default ordering of the model, so everytime a query is made we guarantee that the ordering is applied.
 */
// eslint-disable-next-line ts/require-await
async function translateOrdering(modelOptions: ModelOptionsType, translatedModel: ModelCtor<Model>) {
  const translatedOrdering: OrderItem[] = (modelOptions.ordering || []).map((order) => {
    const orderAsString = order;
    const isDescending = orderAsString.startsWith('-');
    return isDescending ? [orderAsString.substring(1), 'DESC'] : [orderAsString, 'ASC'];
  });

  if (translatedOrdering.length > 0) {
    translatedModel.addScope(
      'defaultScope',
      {
        // eslint-disable-next-line ts/no-unnecessary-condition
        order: translatedOrdering || []
      },
      { override: true }
    );
  }
}

export default adapterModels({
  // eslint-disable-next-line ts/require-await
  translateOptions: async (_engine, _modelName, options): Promise<ModelOptions> => {
    return {
      underscored: options.underscored || true,
      timestamps: false,
      tableName: options.tableName,
      ...options.customOptions
    };
  },
  translate: async (
    engine,
    modelName,
    _model,
    _fieldEntriesOfModel,
    modelOptions,
    defaultTranslateCallback: () => Promise<{ options: ModelOptions; fields: ModelAttributes<any> }>,
    _,
    __
  ): Promise<ModelCtor<Model> | undefined> => {
    const { options: translatedOptions, fields: translatedAttributes } = await defaultTranslateCallback();

    if (Array.isArray(translatedOptions.indexes))
      translatedOptions.indexes.push(...getIndexes(engine.connectionName, modelName));
    else translatedOptions.indexes = getIndexes(engine.connectionName, modelName);

    const sequelizeModel = new Function('sequelizeModel', `return class ${modelName} extends sequelizeModel {}`)(Model);
    const translatedModel = sequelizeModel.init(translatedAttributes, {
      sequelize: engine.instance,
      ...translatedOptions
    });

    if (translatedModel !== undefined) await translateOrdering(modelOptions, translatedModel);
    return translatedModel;
  }
});
