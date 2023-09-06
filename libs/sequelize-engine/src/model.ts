import { EngineModels, Field, models } from '@palmares/databases';
import { Model, ModelAttributeColumnOptions, ModelCtor, ModelOptions, OrderItem } from 'sequelize';

import SequelizeEngine from './engine';
import SequelizeEngineFields from './fields';
import { ModelTranslatorIndexesType } from './types';

/**
 * This class is used to create a sequelize model from the default model definition.
 */
export default class SequelizeEngineModels extends EngineModels {
  engine!: SequelizeEngine;
  engineFields!: SequelizeEngineFields;
  #indexes: ModelTranslatorIndexesType = {};

  async translateOptions(model: models.BaseModel): Promise<ModelOptions> {
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

  async translateFields(fieldEntriesOfModel: [string, Field][]) {
    const fieldAttributes: { [key: string]: ModelAttributeColumnOptions } = {};
    for (const [fieldName, field] of fieldEntriesOfModel) {
      const translatedAttributes = await this.engineFields.get(field);
      const isTranslatedAttributeDefined = translatedAttributes !== null && typeof translatedAttributes === 'object';
      if (isTranslatedAttributeDefined) fieldAttributes[fieldName] = translatedAttributes;
    }
    return fieldAttributes;
  }

  async translate(model: models.BaseModel): Promise<ModelCtor<Model> | undefined> {
    const { options: translatedOptions, fields: translatedAttributes } = await super.translate(model);

    translatedOptions.indexes = await this.engineFields.getIndexes(model.name);

    const translatedModel = this.engine.instance?.define(model.name, translatedAttributes, translatedOptions);
    if (translatedModel !== undefined) await this.#translateOrdering(model, translatedModel);
    return translatedModel;
  }
}
