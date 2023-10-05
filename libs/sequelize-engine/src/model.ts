import { EngineModels, Field, models } from '@palmares/databases';
import { Model, ModelAttributeColumnOptions, ModelAttributes, ModelCtor, ModelOptions, OrderItem } from 'sequelize';

import SequelizeEngine from './engine';
import SequelizeEngineFields from './fields';
import { ModelTranslatorIndexesType } from './types';

/**
 * This class is used to create a sequelize model from the default model definition.
 */
export default class SequelizeEngineModels extends EngineModels {
  #indexes: ModelTranslatorIndexesType = {};

  async translateOptions(engine: SequelizeEngine, model: models.BaseModel): Promise<ModelOptions> {
    const modelName = model.name;
    const options = model.options;
    const indexes = this.#indexes[modelName] ? this.#indexes[modelName] : [];
    return {
      underscored: options.underscored,
      indexes: indexes,
      timestamps: false,
      tableName: options.tableName,
      ...options.customOptions,
    };
  }

  async #translateOrdering(originalModel: models.BaseModel, translatedModel: ModelCtor<Model>) {
    const translatedOrdering: OrderItem[] = (originalModel.options.ordering || [])?.map((order) => {
      const orderAsString = order as string;
      const isDescending = orderAsString.startsWith('-');
      return isDescending ? [orderAsString.substring(1), 'DESC'] : [orderAsString, 'ASC'];
    });

    if (translatedOrdering.length > 0) {
      translatedModel.addScope(
        'defaultScope',
        {
          order: translatedOrdering || [],
        },
        { override: true }
      );
    }
  }

  async translateFields(
    engine: SequelizeEngine,
    fieldEntriesOfModel: [string, Field][],
    _: models.BaseModel,
    defaultGetTranslatedFieldCallback: (field: Field) => Promise<ModelAttributeColumnOptions>
  ) {
    const fieldAttributes: { [key: string]: ModelAttributeColumnOptions } = {};
    for (const [fieldName, field] of fieldEntriesOfModel) {
      const translatedAttributes = await engine.fields.get(engine, field, defaultGetTranslatedFieldCallback);
      const isTranslatedAttributeDefined = translatedAttributes !== null && typeof translatedAttributes === 'object';
      if (isTranslatedAttributeDefined) fieldAttributes[fieldName] = translatedAttributes;
    }
    return fieldAttributes;
  }

  async translate(
    engine: SequelizeEngine,
    model: models.BaseModel,
    defaultTranslateCallback: () => Promise<{ options: ModelOptions; fields: ModelAttributes<any> }>,
    _: (_field: Field) => Promise<any>
  ): Promise<ModelCtor<Model> | undefined> {
    const { options: translatedOptions, fields: translatedAttributes } = await defaultTranslateCallback();

    translatedOptions.indexes = await engine.fields.getIndexes(model.name);

    const translatedModel = engine.instance?.define(model.name, translatedAttributes, translatedOptions);
    if (translatedModel !== undefined) await this.#translateOrdering(model, translatedModel);
    return translatedModel;
  }
}
